# Neuro-AI Brain Cell Atlas

Single-cell brain atlas workflow for identifying major brain cell types from gene expression and interpreting their biological identity with a focus on **forebrain-enriched astrocyte heterogeneity** and **Alzheimer's disease–associated gene programs**.

**Start date:** 06/20/2026

## Goal

Build a reproducible analysis pipeline that goes from raw single-cell RNA-seq data to cell-type discovery and brain biology interpretation:

```
cell × gene matrix → cell embeddings → cell type discovery → astrocyte subtype characterization → AD gene program analysis
```

## Research Questions

- Which genes define hippocampus, cortex, and cerebellum?
- Does the Allen WHB atlas resolve distinct astrocyte subtypes beyond canonical astrocytes?
- Is **Astrocyte_2** - a cortex/hippocampus-enriched population — enriched for neuroprotective and AD-associated transcriptional programs?
- Do regional and donor-level patterns in AD support scores replicate across the atlas, or reflect batch artifacts?

## Analysis Pipeline

| Step | Notebook | Summary |
|------|----------|---------|
| **01** | `01_load_brain_data.ipynb` | Load WHB non-neuron h5ad → subsample 50k → Leiden → annotate glia → discover **Astrocyte_2** → GO/KEGG enrichment → save processed object |
| **02** | `02_neuroprotective_astrocytes.ipynb` | Neuroprotective Support Score → quartile enrichment → regional mapping → DE (Astrocyte_2 vs Astrocyte) → Mann–Whitney |
| **03** | `03_AD_risk_gene_enrichment_in_Astrocyte_2.ipynb` | AD support score (6-gene panel) → quartile + Mann–Whitney → regional and **donor** stratification → donor × region heatmap |

**Shared input for notebooks 02–03:**

```
data/processed/brain_non_neuronal_50k_annotated_umap.h5ad
```

(50,000 nuclei × 3,000 HVGs - produced by notebook 01; gitignored locally.)

## Repository Structure

```
neuro-ai-brain-cell-atlas/
├── README.md
├── environment.yml                 # Conda env: neuro-ai-brain-cell-atlas
├── requirements.txt                # Pip fallback
├── .gitignore
├── scripts/
│   └── download_whb_data.py        # Download Allen WHB-10Xv3 h5ad + metadata
├── notebooks/
│   ├── 01_load_brain_data.ipynb                        # WHB load → UMAP → Leiden → Astrocyte_2 discovery
│   ├── 02_neuroprotective_astrocytes.ipynb             # Neuroprotective score + regional DE
│   └── 03_AD_risk_gene_enrichment_in_Astrocyte_2.ipynb  # AD gene score + donor/region stratification
├── reports/
│   ├── brain_cell_atlas_report.qmd           # Conference summary — Notebook 01
│   └── neuroprotective_astrocytes_report.qmd # Conference summary — Notebook 02
├── results/
│   └── astrocyte2_vs_astrocyte_markers.csv   # DE table from Notebook 02
└── data/
    ├── raw/                        # Optional local inputs (.gitkeep)
    └── processed/
        └── abc_atlas/              # Allen cache (metadata + h5ad; gitignored)
            ├── metadata/WHB-10Xv3/
            ├── metadata/WHB-taxonomy/
            └── expression_matrices/WHB-10Xv3/
```

| Path | Purpose |
|------|---------|
| `notebooks/` | Exploratory analysis — run in order (01 → 02 → 03) |
| `scripts/` | Data download utilities |
| `reports/` | Conference-style Quarto summaries (`.qmd`; PDF/HTML rendered locally) |
| `results/` | Exported tables and analysis outputs |
| `data/processed/abc_atlas/` | Allen Brain Cell Atlas cache (CSVs + h5ad) |
| `data/raw/` | Optional raw inputs — not tracked in git |

Large files (`*.h5ad`, `data/processed/*`) and rendered reports (`reports/*.pdf`, `reports/*.html`) are gitignored; download or render locally.

## Tools

| Package | Role |
|---------|------|
| [Scanpy](https://scanpy.readthedocs.io/) | Single-cell analysis (PCA, neighbors, UMAP, Leiden, markers, `score_genes`) |
| [AnnData](https://anndata.readthedocs.io/) | Annotated expression matrices |
| `python-igraph`, `leidenalg` | Leiden clustering |
| [GSEApy](https://gseapy.readthedocs.io/) | GO / KEGG enrichment via Enrichr |
| [abc_atlas_access](https://alleninstitute.github.io/abc_atlas_access/) | Allen WHB data download |
| scikit-learn | ML utilities (via Scanpy) |
| [Squidpy](https://squidpy.readthedocs.io/) | Spatial omics (planned) |

## Getting Started

### 1. Environment (conda)

Create and activate the conda environment:

```bash
conda env create -f environment.yml
conda activate neuro-ai-brain-cell-atlas
```

Register the Jupyter kernel (once):

```bash
python -m ipykernel install --user --name neuro-ai-brain-cell-atlas --display-name "neuro-ai-brain-cell-atlas"
```

Update after dependency changes:

```bash
conda env update -f environment.yml --prune
```

**Note:** If you created an earlier env named `brain-cell-atlas`, either activate that env or recreate from `environment.yml`. GSEApy is installed via **pip** inside the conda env (PyPI wheel; bioconda build is unreliable on Windows).

**Pip alternative:** `pip install -r requirements.txt`

### 2. Data (Allen Whole Human Brain)

Dataset: [WHB-10X clustering](https://alleninstitute.github.io/abc_atlas_access/descriptions/WHB-10X-clustering.html) + [WHB-10Xv3 expression](https://alleninstitute.github.io/abc_atlas_access/descriptions/WHB-10Xv3.html) (~3.4M nuclei, CC BY-NC 4.0).

| Component | Location after download |
|-----------|-------------------------|
| Clustering metadata | `data/processed/abc_atlas/metadata/WHB-10Xv3/` |
| Cell-type taxonomy | `data/processed/abc_atlas/metadata/WHB-taxonomy/` |
| h5ad matrices | `data/processed/abc_atlas/expression_matrices/WHB-10Xv3/<version>/` |

List files and sizes:

```bash
python scripts/download_whb_data.py --list
```

Download metadata + one h5ad matrix (notebook 01 uses non-neuron log2):

```bash
python scripts/download_whb_data.py --metadata --matrix nonneurons-log2
```

Other matrix options: `neurons-log2`, `neurons-raw`, `nonneurons-raw`, or `all` (~70 GB total).

Expected h5ad path used in notebook 01:

```
data/processed/abc_atlas/expression_matrices/WHB-10Xv3/20240330/WHB-10Xv3-Nonneurons-log2.h5ad
```

(888,263 cells × 59,357 genes - use `backed="r"` if memory is tight.)

### 3. Run the notebooks

Select kernel **neuro-ai-brain-cell-atlas** (or your equivalent conda env) for all notebooks.

#### Notebook 01 - `01_load_brain_data.ipynb`

1. Load `WHB-10Xv3-Nonneurons-log2.h5ad`
2. Explore anatomical divisions (cortex, hippocampus, thalamus, …)
3. Subsample to 50,000 cells for interactive analysis
4. HVG selection → PCA → neighbors → UMAP
5. Leiden clustering → manual glial annotations → UMAP by cell type
6. Region × cell-type composition tables; discover **Astrocyte_2**
7. Marker genes (`rank_genes_groups`) → validation plots
8. GO Biological Process / KEGG enrichment (`gseapy.enrichr`) — requires internet
9. Save `data/processed/brain_non_neuronal_50k_annotated_umap.h5ad`

#### Notebook 02 - `02_neuroprotective_astrocytes.ipynb`

Requires processed h5ad from notebook 01.

1. Compute **Neuroprotective Support Score** (10-gene astrocyte-support panel)
2. Quartile enrichment across all non-neuronal cell types
3. Regional composition of Astrocyte_2 (cortex + hippocampus enrichment)
4. Differential expression: Astrocyte_2 vs Astrocyte
5. Mann–Whitney U test on score separation
6. Export markers → `results/astrocyte2_vs_astrocyte_markers.csv`

#### Notebook 03 - `03_AD_risk_gene_enrichment_in_Astrocyte_2.ipynb`

Requires processed h5ad from notebook 01 (scores from NB02 may already be in `adata.obs`).

1. Compute **AD support score** (*APOE*, *CLU*, *CST3*, *AQP4*, *SLC1A2*, *SPARCL1*)
2. Quartile enrichment and Mann–Whitney vs canonical astrocytes
3. Regional stratification within Astrocyte_2
4. Donor stratification via `library_label` (368 donors)
5. Donor × region heatmap: test for batch vs biology
6. Correlation with Neuroprotective Support Score

### 4. Conference reports

Render Quarto summaries as PDF or HTML:

```bash
# Notebook 01 report
quarto render reports/brain_cell_atlas_report.qmd --to pdf
quarto render reports/brain_cell_atlas_report.qmd --to html

# Notebook 02 report
quarto render reports/neuroprotective_astrocytes_report.qmd --to pdf
quarto render reports/neuroprotective_astrocytes_report.qmd --to html
```

Output (gitignored):

- `reports/brain_cell_atlas_report.pdf` / `.html`
- `reports/neuroprotective_astrocytes_report.pdf` / `.html`

On Windows, if `quarto` is not on PATH:

```powershell
& "C:\Program Files\Quarto\bin\quarto.exe" render reports/brain_cell_atlas_report.qmd --to pdf
& "C:\Program Files\Quarto\bin\quarto.exe" render reports/neuroprotective_astrocytes_report.qmd --to pdf
```

## Current Status

| Item | Status |
|------|--------|
| Conda env + kernel | Done (`environment.yml`) |
| WHB metadata + taxonomy | Downloaded under `data/processed/abc_atlas/` |
| WHB non-neuron h5ad | Used in notebook 01 (local; gitignored) |
| Notebook 01 | Load → UMAP → Leiden → Astrocyte_2 discovery → enrichment → save h5ad |
| Notebook 02 | Neuroprotective score, regional DE, Mann–Whitney; markers exported |
| Notebook 03 | AD support score; regional + donor stratification |
| Download script | `scripts/download_whb_data.py` |
| Quarto reports | NB01 + NB02 conference summaries (`.qmd`) |
| Results export | `results/astrocyte2_vs_astrocyte_markers.csv` |
| Reusable `src/` module | Not started |

## Key Findings (so far)

- **Astrocyte_2** (*n* ≈ 4,081 / 50,000) is a forebrain-enriched astrocyte state: ~52% cerebral cortex, ~28% hippocampus, absent from cerebellum and spinal cord.
- Top markers include *SLC1A2*, *SPARCL1*, *SLC4A4*, *AQP4*, *APOE*, and *CLU* — consistent with synaptic-support astrocyte biology.
- **Neuroprotective Support Score:** ~99.9% of Astrocyte_2 nuclei in Q4 vs ~2.9% of canonical astrocytes (NB02).
- **AD support score:** ~96% of Astrocyte_2 in Q4; regional gradient (cortex/hippocampus > hypothalamus) replicates across donors (NB03).

## Planned Next Steps

- Link Allen WHB donor metadata (age, sex) for covariate-adjusted stratification
- Cross-reference Astrocyte_2 to official WHB taxonomy labels
- Integrate external AD snRNA-seq cohort (e.g., SEA-AD) for disease comparison
- Quarto report for Notebook 03
- Blog post, poster, whitepaper, conference submission
