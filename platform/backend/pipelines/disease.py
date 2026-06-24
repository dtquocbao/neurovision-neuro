"""Disease metadata stratification for AD support score (NB06)."""

from __future__ import annotations

import io
import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from pipelines.scorer import compute_ad_support_score, _parse_expression_table

APP_ROOT = Path(__file__).resolve().parents[1]
REFERENCE_PATH = APP_ROOT / "data" / "seaad_reference.json"

BRAK_ORDER = [
    "Braak 0",
    "Braak I",
    "Braak II",
    "Braak III",
    "Braak IV",
    "Braak V",
    "Braak VI",
]

ADNC_ORDER = ["Not AD", "Low", "Intermediate", "High"]


def load_reference() -> dict[str, Any]:
    if not REFERENCE_PATH.exists():
        return {}
    return json.loads(REFERENCE_PATH.read_text(encoding="utf-8"))


def _load_table(
    content: bytes,
    filename: str,
    cell_id_column: str,
) -> pd.DataFrame:
    name = filename.lower()
    if name.endswith(".h5ad"):
        import anndata as ad

        adata = ad.read_h5ad(io.BytesIO(content))
        return adata.obs.copy()

    df = pd.read_csv(io.BytesIO(content))
    if cell_id_column in df.columns:
        df = df.set_index(cell_id_column)
    return df


def _ensure_score_column(
    df: pd.DataFrame,
    score_column: str,
    content: bytes,
    filename: str,
    cell_id_column: str,
) -> pd.Series:
    if score_column in df.columns:
        return pd.to_numeric(df[score_column], errors="coerce")

    expr, cell_ids, _ = _parse_expression_table(
        content, filename, cell_id_column, None
    )
    scores, _present, _missing = compute_ad_support_score(expr)
    aligned = scores.reindex(df.index)
    if aligned.isna().all():
        aligned = scores.reindex(df.index.astype(str))
    if aligned.isna().mean() > 0.5:
        raise ValueError(
            f"Column '{score_column}' not found and could not align computed scores to rows."
        )
    return aligned


def _violin_by_column(scores: pd.Series, groups: pd.Series) -> dict[str, list[float]]:
    out: dict[str, list[float]] = {}
    valid = scores.notna() & groups.notna()
    for g, grp in pd.DataFrame({"score": scores[valid], "group": groups[valid]}).groupby("group"):
        out[str(g)] = grp["score"].astype(float).tolist()
    return out


def _ordered_means(
    scores: pd.Series,
    groups: pd.Series,
    order: list[str],
) -> list[dict[str, Any]]:
    rows = []
    valid = scores.notna() & groups.notna()
    df = pd.DataFrame({"score": scores[valid], "group": groups[valid].astype(str)})
    for label in order:
        subset = df[df["group"] == label]["score"]
        if len(subset) == 0:
            continue
        rows.append(
            {
                "label": label,
                "mean": float(subset.mean()),
                "median": float(subset.median()),
                "n": int(len(subset)),
            }
        )
    extra = set(df["group"].unique()) - set(order)
    for label in sorted(extra):
        subset = df[df["group"] == label]["score"]
        rows.append(
            {
                "label": label,
                "mean": float(subset.mean()),
                "median": float(subset.median()),
                "n": int(len(subset)),
            }
        )
    return rows


def disease_compare_from_upload(
    content: bytes,
    filename: str,
    cell_id_column: str = "cell_id",
    score_column: str = "AD_support_score",
    disease_column: str = "disease",
    braak_column: str = "Braak stage",
    adnc_column: str = "ADNC",
    apoe4_column: str = "APOE4 status",
    cps_column: str = "Continuous Pseudo-progression Score",
) -> dict[str, Any]:
    df = _load_table(content, filename, cell_id_column)
    scores = _ensure_score_column(df, score_column, content, filename, cell_id_column)
    df = df.copy()
    df["AD_support_score"] = scores

    result: dict[str, Any] = {
        "n_cells": int(scores.notna().sum()),
        "reference": load_reference(),
    }

    if disease_column in df.columns:
        disease_violin = _violin_by_column(scores, df[disease_column])
        result["disease_violin"] = disease_violin
        summary = {}
        for grp, vals in disease_violin.items():
            arr = np.array(vals)
            summary[grp] = {
                "median": float(np.median(arr)),
                "mean": float(np.mean(arr)),
                "n": len(vals),
            }
        result["disease_summary"] = summary

    if braak_column in df.columns:
        result["braak_gradient"] = _ordered_means(scores, df[braak_column], BRAK_ORDER)

    if adnc_column in df.columns:
        adnc_stats = _ordered_means(scores, df[adnc_column], ADNC_ORDER)
        result["adnc_stats"] = adnc_stats
        result["adnc_heatmap"] = {row["label"]: row["median"] for row in adnc_stats}

    if apoe4_column in df.columns:
        result["apoe4_violin"] = _violin_by_column(scores, df[apoe4_column])

    if cps_column in df.columns:
        cps = pd.to_numeric(df[cps_column], errors="coerce")
        valid = scores.notna() & cps.notna()
        scatter = [
            {"cps": float(c), "score": float(s)}
            for c, s in zip(cps[valid], scores[valid])
        ]
        if len(scatter) > 5000:
            rng = np.random.default_rng(42)
            idx = rng.choice(len(scatter), size=5000, replace=False)
            scatter = [scatter[i] for i in idx]
        result["cps_scatter"] = scatter

        if valid.sum() > 10:
            result["cps_correlation"] = float(
                np.corrcoef(cps[valid], scores[valid])[0, 1]
            )

    available = [
        c
        for c in [disease_column, braak_column, adnc_column, apoe4_column, cps_column]
        if c in df.columns
    ]
    result["columns_used"] = available
    result["columns_missing"] = [
        c
        for c in [disease_column, braak_column, adnc_column, apoe4_column, cps_column]
        if c not in df.columns
    ]

    return result
