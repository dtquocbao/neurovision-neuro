"""Export precomputed assets for NeuroVision Neuro platform from notebook outputs."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path

import pandas as pd
import scanpy as sc

PROJECT_ROOT = Path(__file__).resolve().parents[1]
PLATFORM_DATA = PROJECT_ROOT / "platform" / "backend" / "data"
PLATFORM_MODELS = PROJECT_ROOT / "platform" / "backend" / "models"
DEFAULT_H5AD = PROJECT_ROOT / "data" / "processed" / "brain_non_neuronal_50k_annotated_umap.h5ad"
NB04_MODELS = PROJECT_ROOT / "models" / "scvi_nb04"


def export_umap(h5ad_path: Path, out_path: Path, subsample: int | None = None) -> None:
    adata = sc.read_h5ad(h5ad_path)
    cols = {
        "UMAP1": adata.obsm["X_umap"][:, 0],
        "UMAP2": adata.obsm["X_umap"][:, 1],
        "cell_type": adata.obs["cell_type"].values,
    }
    if "AD_support_score" in adata.obs.columns:
        cols["AD_support_score"] = adata.obs["AD_support_score"].values
    if "anatomical_division_label" in adata.obs.columns:
        cols["anatomical_division_label"] = adata.obs["anatomical_division_label"].values
    if "whb_supercluster" in adata.obs.columns:
        cols["whb_supercluster"] = adata.obs["whb_supercluster"].values

    df = pd.DataFrame(cols)
    if subsample and len(df) > subsample:
        df = df.sample(n=subsample, random_state=42)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} rows → {out_path}")


def export_liana_from_notebook(liana_csv: Path, out_path: Path) -> None:
    df = pd.read_csv(liana_csv)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} LR rows → {out_path}")


def copy_nb04_models() -> None:
    """Copy scVI + MLP artifacts from models/scvi_nb04 to platform/backend/models/."""
    PLATFORM_MODELS.mkdir(parents=True, exist_ok=True)
    src = NB04_MODELS
    if not src.exists():
        print(f"Skip model copy: {src} not found (run NB04 first)")
        return

    for name in ("mlp_classifier.pkl", "label_encoder.pkl"):
        if (src / name).exists():
            shutil.copy2(src / name, PLATFORM_MODELS / name)
            print(f"Copied {name} → {PLATFORM_MODELS / name}")

    scvi_dst = PLATFORM_MODELS / "scvi_nb04"
    if scvi_dst.exists():
        shutil.rmtree(scvi_dst)
    if (src / "model.pt").exists() or any(src.glob("**/*.pt")):
        shutil.copytree(src, scvi_dst, dirs_exist_ok=True)
        print(f"Copied scVI model → {scvi_dst}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--h5ad", type=Path, default=DEFAULT_H5AD)
    parser.add_argument("--subsample", type=int, default=50000, help="0 = all cells")
    parser.add_argument("--liana-csv", type=Path, help="Optional LIANA export CSV from NB07")
    parser.add_argument("--copy-models", action="store_true", help="Copy NB04 scVI + MLP to platform/backend/models")
    args = parser.parse_args()

    subsample = args.subsample if args.subsample > 0 else None
    export_umap(args.h5ad, PLATFORM_DATA / "umap_embeddings.csv", subsample=subsample)

    if args.liana_csv:
        export_liana_from_notebook(args.liana_csv, PLATFORM_DATA / "liana_results.csv")
    elif (PLATFORM_DATA / "liana_results.csv").exists():
        print("liana_results.csv already present - skipping")

    if args.copy_models:
        copy_nb04_models()

    ref_path = PLATFORM_DATA / "seaad_reference.json"
    if ref_path.exists():
        print(f"seaad_reference.json present at {ref_path}")


if __name__ == "__main__":
    main()
