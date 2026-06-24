"""scVI + MLP cell-state classifier inference (NB04)."""

from __future__ import annotations

import io
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import scanpy as sc

from pipelines.scorer import _parse_expression_table

APP_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = APP_ROOT.parents[1]

_clf = None
_label_encoder = None
_model_dirs: list[Path] | None = None


def _candidate_model_dirs() -> list[Path]:
    return [
        APP_ROOT / "models" / "scvi_nb04",
        APP_ROOT / "models",
        REPO_ROOT / "models" / "scvi_nb04",
    ]


def _find_model_dir() -> Path | None:
    for d in _candidate_model_dirs():
        if (d / "model.pt").exists() or (d / "scvi_model").exists():
            return d
        if list(d.glob("**/model.pt")):
            return d
    return None


def _find_pkl(name: str) -> Path | None:
    for base in [APP_ROOT / "models", APP_ROOT / "models" / "scvi_nb04", REPO_ROOT / "models" / "scvi_nb04"]:
        path = base / name
        if path.exists():
            return path
    return None


def _load_sklearn_models() -> tuple[Any, Any]:
    global _clf, _label_encoder
    if _clf is not None and _label_encoder is not None:
        return _clf, _label_encoder

    clf_path = _find_pkl("mlp_classifier.pkl")
    le_path = _find_pkl("label_encoder.pkl")
    if not clf_path or not le_path:
        raise FileNotFoundError(
            "Missing mlp_classifier.pkl or label_encoder.pkl. "
            "Run NB04 save cell or: python scripts/export_platform_data.py --copy-models"
        )
    _clf = joblib.load(clf_path)
    _label_encoder = joblib.load(le_path)
    return _clf, _label_encoder


def _expression_to_anndata(
    expr: pd.DataFrame,
    cell_ids: pd.Index,
) -> sc.AnnData:
    import anndata as ad

    X = expr.to_numpy(dtype=np.float32)
    adata = ad.AnnData(X=X, obs=pd.DataFrame(index=cell_ids.astype(str)), var=pd.DataFrame(index=expr.columns))
    adata.layers["log_norm"] = adata.X.copy()
    adata.obs["library_label"] = "platform_upload"
    adata.obs["cell_class"] = "Other"
    return adata


def _get_latent(adata: sc.AnnData, model_dir: Path) -> np.ndarray:
    import scvi

    scvi.model.SCVI.prepare_query_anndata(adata, str(model_dir))
    query_model = scvi.model.SCVI.load_query_data(adata, str(model_dir))
    return query_model.get_latent_representation()


def _compute_umap(latent: np.ndarray, max_cells: int = 8000) -> np.ndarray:
    n = latent.shape[0]
    idx = np.arange(n)
    if n > max_cells:
        rng = np.random.default_rng(42)
        idx = rng.choice(n, size=max_cells, replace=False)

    sub = latent[idx]
    adata = sc.AnnData(X=sub)
    sc.pp.neighbors(adata, n_neighbors=15, use_rep="X")
    sc.tl.umap(adata, min_dist=0.3)

    coords = np.full((n, 2), np.nan, dtype=float)
    coords[idx, 0] = adata.obsm["X_umap"][:, 0]
    coords[idx, 1] = adata.obsm["X_umap"][:, 1]

    if np.isnan(coords).any():
        from sklearn.decomposition import PCA

        pca = PCA(n_components=2, random_state=42)
        full = pca.fit_transform(latent)
        mask = np.isnan(coords[:, 0])
        coords[mask] = full[mask]
    return coords


def classify_from_upload(
    content: bytes,
    filename: str,
    cell_id_column: str = "cell_id",
    cell_type_column: str = "cell_type",
    max_cells: int = 10000,
) -> dict[str, Any]:
    clf, le = _load_sklearn_models()
    model_dir = _find_model_dir()

    expr, cell_ids, _cell_types = _parse_expression_table(
        content, filename, cell_id_column, cell_type_column
    )
    if len(expr) > max_cells:
        expr = expr.iloc[:max_cells]
        cell_ids = cell_ids[:max_cells]

    adata = _expression_to_anndata(expr, cell_ids)

    inference_mode = "scvi_mlp"
    if model_dir is None:
        raise FileNotFoundError(
            "scVI model not found. Export from NB04 (model.save) to "
            "models/scvi_nb04/ or platform/backend/models/scvi_nb04/"
        )

    latent = _get_latent(adata, model_dir)
    proba = clf.predict_proba(latent)
    pred_idx = proba.argmax(axis=1)
    classes = le.inverse_transform(pred_idx)
    confidence = proba.max(axis=1)

    umap_coords = _compute_umap(latent)

    predictions = []
    umap_records = []
    for i, cid in enumerate(cell_ids):
        pred = str(classes[i])
        conf = float(confidence[i])
        predictions.append(
            {
                "cell_id": str(cid),
                "predicted_class": pred,
                "confidence": conf,
            }
        )
        umap_records.append(
            {
                "cell_id": str(cid),
                "x": float(umap_coords[i, 0]),
                "y": float(umap_coords[i, 1]),
                "predicted_class": pred,
            }
        )

    class_counts = pd.Series(classes).value_counts(normalize=True)
    class_distribution = {str(k): float(v) for k, v in class_counts.items()}

    conf_hist: dict[str, int] = {}
    bins = [0, 0.5, 0.7, 0.85, 0.95, 1.01]
    labels = ["<0.5", "0.5–0.7", "0.7–0.85", "0.85–0.95", "≥0.95"]
    digitized = np.digitize(confidence, bins[1:-1])
    for label, count in zip(labels, np.bincount(digitized, minlength=len(labels))):
        conf_hist[label] = int(count)

    return {
        "predictions": predictions,
        "class_distribution": class_distribution,
        "umap_coords": umap_records,
        "confidence_histogram": conf_hist,
        "n_cells": len(predictions),
        "inference_mode": inference_mode,
        "model_dir": str(model_dir),
        "classes": list(le.classes_),
    }


def models_available() -> dict[str, bool]:
    return {
        "scvi": _find_model_dir() is not None,
        "mlp": _find_pkl("mlp_classifier.pkl") is not None,
        "label_encoder": _find_pkl("label_encoder.pkl") is not None,
    }
