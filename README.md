# Neuro-AI Brain Cell Atlas

Single-cell brain atlas workflow for identifying major brain cell types from gene expression and interpreting their biological identity.

**Start date:** 06/20/2026

## Goal

Build a reproducible analysis pipeline that goes from raw single-cell RNA-seq data to cell-type discovery and brain biology interpretation:

```
cell × gene matrix → cell embeddings → cell type discovery → brain biology interpretation
```

## Research Questions

- Which genes define hippocampus?
- Which genes define cortex?
- Which genes define cerebellum?

## First Milestone

Load a brain single-cell dataset and produce a UMAP colored by known or inferred cell types.

## Repository Structure

```
neuro-ai-brain-cell-atlas/
├── README.md
├── environment.yml
├── requirements.txt              # Pip fallback (conda preferred)
├── .gitignore
├── scripts/
│   └── download_whb_data.py        # Download Allen WHB-10Xv3 h5ad + metadata
├── notebooks/
│   └── 01_load_brain_data.ipynb    # Load and explore AnnData; first UMAP milestone
├── reports/
│   └── brain_cell_atlas_report.qmd # Quarto report (analysis write-up)
└── data/
    ├── raw/                        # Raw input datasets (e.g. .h5ad)
    └── processed/                  # Cleaned or intermediate AnnData outputs
```

| Path | Purpose |
|------|---------|
| `notebooks/` | Exploratory analysis and milestone notebooks |
| `reports/` | Rendered reports and research logs (Quarto) |
| `data/raw/` | Raw datasets — not tracked in git if large |
| `data/processed/` | Processed AnnData objects and derived tables |

## Tools

- Python
- [Scanpy](https://scanpy.readthedocs.io/) — single-cell analysis
- [AnnData](https://anndata.readthedocs.io/) — annotated data matrices
- [Squidpy](https://squidpy.readthedocs.io/) — spatial omics (planned)
- scikit-learn

## Getting Started

### 1. Environment (conda)

Create and activate the conda environment from `environment.yml`:

```bash
conda env create -f environment.yml
conda activate neuro-ai-brain-cell-atlas
```

Register the kernel for Jupyter / VS Code (once per environment):

```bash
python -m ipykernel install --user --name neuro-ai-brain-cell-atlas --display-name "neuro-ai-brain-cell-atlas"
```

To update after dependency changes:

```bash
conda env update -f environment.yml --prune
```

**Pip alternative:** `pip install -r requirements.txt` (see `requirements.txt` if you are not using conda).

### 2. Data (Allen Whole Human Brain)

This project uses the [Allen WHB-10X clustering dataset](https://alleninstitute.github.io/abc_atlas_access/descriptions/WHB-10X-clustering.html) (~3.4M nuclei, CC BY-NC 4.0).

The clustering page provides **metadata** (cell types, UMAP coordinates). **h5ad expression matrices** are downloaded separately from [WHB-10Xv3](https://alleninstitute.github.io/abc_atlas_access/descriptions/WHB-10Xv3.html) (~70 GB for all four files).

List available files and sizes:

```bash
python scripts/download_whb_data.py --list
```

Download clustering metadata + one log2 h5ad matrix into `data/processed/abc_atlas/`:

```bash
python scripts/download_whb_data.py --metadata --matrix nonneurons-log2
```

Other matrix options: `neurons-log2`, `neurons-raw`, `nonneurons-raw`, or `all` (full ~70 GB).

After download, h5ad files appear under:

```
data/processed/abc_atlas/expression_matrices/WHB-10Xv3/<version>/
```

Load with Scanpy using backed mode for large files:

```python
import scanpy as sc
adata = sc.read_h5ad("path/to/WHB-10Xv3-Nonneurons-log2.h5ad", backed="r")
```

### 3. Run the notebook

Open and run `notebooks/01_load_brain_data.ipynb` from the `notebooks/` directory (paths are relative to that folder).

## Current Status

Early scaffold — notebook, data directories, report template, and `environment.yml` are in place. Reusable modules (`src/`) and the raw dataset are still to be added.

## Planned Outputs

- Blog post
- Poster
- Whitepaper
- Conference submission
