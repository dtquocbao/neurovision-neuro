# Neuro-AI Brain Cell Atlas

Single-cell brain atlas workflow for identifying major brain cell types from gene expression and interpreting their biological identity with a focus on **forebrain-enriched astrocyte heterogeneity**, **Alzheimer's disease–associated gene programs**, **donor-aware cell-state prediction**, **SEA-AD disease validation**, and **astrocyte–neuron ligand-receptor communication**.

**Start date:** 06/20/2026

## Goal

Build a reproducible analysis pipeline from raw single-cell RNA-seq to cell-type discovery, astrocyte characterization, predictive modeling, disease-cohort validation, and mechanistic cell–cell communication:

```
cell × gene matrix → cell embeddings → Astrocyte_2 discovery → neuroprotective/AD scoring
  → scVI + ML classification → WHB taxonomy + donor metadata → SEA-AD disease comparison
  → LIANA astrocyte–neuron ligand-receptor analysis
```

## Research Questions

- Does the Allen WHB atlas resolve a forebrain-enriched neuroprotective astrocyte state (**Astrocyte_2**)?
- Is Astrocyte_2 enriched for AD-associated transcriptional programs, and does this replicate across regions and donors?
- Can a donor-aware scVI + MLP classifier predict Astrocyte_2 on held-out donors?
- Does official Allen taxonomy confirm Astrocyte_2 as a genuine astrocyte state?
- Does the neuroprotective program **decline in SEA-AD** astrocytes with dementia, Braak stage, ADNC, and APOE4?
- Through which **ligand-receptor axes** does Astrocyte_2 communicate with cortical and hippocampal neurons?

## Analysis Pipeline

| Step | Notebook | Summary |
|------|----------|---------|
| **01** | `01_load_brain_data.ipynb` | WHB load → 50k subsample → Leiden → discover **Astrocyte_2** → GO/KEGG → save h5ad |
| **02** | `02_neuroprotective_astrocytes.ipynb` | Neuroprotective Support Score → quartile → regional DE → Mann–Whitney |
| **03** | `03_AD_risk_gene_enrichment_in_Astrocyte_2.ipynb` | AD support score → donor/region stratification (368 donors) |
| **04** | `04_cell_state_prediction_in_human_astrocytes.ipynb` | Donor-aware **scVI** + **MLP** → SHAP interpretability |
| **05** | `05_whb_taxonomy_and_donor_stratification.ipynb` | Allen taxonomy mapping + donor age/sex + pseudo-spatial |
| **06** | `06_seaad_disease_comparison.ipynb` | SEA-AD MTG: normal vs dementia → Braak/ADNC/APOE4 |
| **07** | `07_ligand_receptor_analysis.ipynb` | WHB neurons + astrocytes → **LIANA** rank_aggregate LR pairs |

## Conference Reports

| Notebook | Quarto report | Topic |
|----------|---------------|-------|
| 01 | `reports/brain_cell_atlas_report.qmd` | Astrocyte_2 discovery |
| 02 | `reports/neuroprotective_astrocytes_report.qmd` | Neuroprotective scoring |
| 03 | `reports/ad_risk_gene_enrichment_report.qmd` | AD gene enrichment + donor stratification |
| 04 | `reports/cell_state_prediction_report.qmd` | scVI + MLP + SHAP |
| 05 | `reports/whb_taxonomy_donor_report.qmd` | Official taxonomy + donor metadata |
| 06 | `reports/seaad_disease_comparison_report.qmd` | SEA-AD disease comparison |
| 07 | `reports/ligand_receptor_analysis_report.qmd` | LIANA astrocyte–neuron communication |

Render all PDFs:

```bash
for f in reports/*_report.qmd; do quarto render "$f" --to pdf; done
```

On Windows (PowerShell):

```powershell
& "C:\Program Files\Quarto\bin\quarto.exe" render reports/ad_risk_gene_enrichment_report.qmd --to pdf
# ... repeat for each report
```

## Repository Structure

```
neuro-ai-brain-cell-atlas/
├── README.md
├── neurovision_neuro_prd.md        # Platform product spec
├── platform/                       # NeuroVision Neuro web app (React + FastAPI)
│   ├── README.md
│   ├── backend/
│   └── frontend/
├── environment.yml
├── requirements.txt
├── scripts/
│   ├── download_whb_data.py        # Allen WHB h5ad + metadata
│   ├── download_sea_ad_mtg.py      # SEA-AD S3 URL probe
│   └── precheck_nb07.py            # LIANA import check
├── notebooks/                      # 01 → 07 (run in order)
├── reports/                        # 7 conference .qmd summaries
├── results/
│   └── astrocyte2_vs_astrocyte_markers.csv
├── models/scvi_nb04/               # scVI checkpoint (gitignored)
└── data/processed/
    ├── abc_atlas/                  # Allen WHB cache
    ├── brain_non_neuronal_50k_annotated_umap.h5ad
    └── <SEAAD_MTG>.h5ad
```

## Data inputs

| Notebook(s) | File | Notes |
|-------------|------|-------|
| 01–05 | `brain_non_neuronal_50k_annotated_umap.h5ad` | 50k × 3k HVGs; from NB01 |
| 05 | Allen `donor.csv`, `cell_metadata.csv`, WHB-taxonomy CSVs | Via `download_whb_data.py --metadata` |
| 06 | SEA-AD MTG h5ad (~1.38M nuclei) | CELLxGENE or S3; `backed="r"` |
| 07 | `WHB-10Xv3-Neurons-log2.h5ad` + non-neuronal subsample | Neuron supertypes from metadata |

## Tools

| Package | Role |
|---------|------|
| [Scanpy](https://scanpy.readthedocs.io/) | Single-cell analysis |
| [scvi-tools](https://docs.scvi-tools.org/) | Batch-corrected latent embeddings (NB04) |
| [SHAP](https://shap.readthedocs.io/) | Latent-dimension interpretability (NB04) |
| [LIANA](https://liana-py.readthedocs.io/) | Ligand-receptor inference (NB07) |
| [GSEApy](https://gseapy.readthedocs.io/) | GO/KEGG enrichment (NB01) |
| [abc_atlas_access](https://alleninstitute.github.io/abc_atlas_access/) | Allen data download |
| scikit-learn | MLP classifier (NB04) |

## Getting Started

### 1. Environment

```bash
conda env create -f environment.yml
conda activate neuro-ai-brain-cell-atlas
python -m ipykernel install --user --name neuro-ai-brain-cell-atlas --display-name "neuro-ai-brain-cell-atlas"
```

**abc_atlas_access** (GitHub install):

```bash
pip install "git+https://github.com/AllenInstitute/abc_atlas_access.git"
```

### 2. Download data

```bash
# Allen WHB (notebook 01)
python scripts/download_whb_data.py --metadata --matrix nonneurons-log2

# Neurons matrix (notebook 07)
python scripts/download_whb_data.py --matrix neurons-log2

# SEA-AD URL probe (notebook 06)
python scripts/download_sea_ad_mtg.py
```

### 3. Run notebooks 01 → 07 in order

See individual notebook headers for prerequisites. Notebook 07 requires **liana** (`pip install "liana>=1.0"`).

## Current Status

| Item | Status |
|------|--------|
| Notebooks 01–07 | Complete analysis pipeline |
| Quarto reports | NB01–NB07 conference summaries (`.qmd`) |
| WHB non-neuron + neuron h5ad | Local (gitignored) |
| SEA-AD MTG h5ad | Local (gitignored) |
| scVI model | `models/scvi_nb04/` |
| DE markers export | `results/astrocyte2_vs_astrocyte_markers.csv` |
| Reusable `src/` module | Not started |
| **NeuroVision platform** | `platform/`: Atlas, Score, Classifier, Disease, L-R Explorer |

## Key Findings (pipeline summary)

| NB | Headline result |
|----|-----------------|
| **01** | Astrocyte_2 discovered; ~52% cortex, ~28% hippocampus |
| **02** | 99.9% Q4 neuroprotective score; *SLC1A2*, *SPARCL1*, *APOE* markers |
| **03** | 96% Q4 AD score; regional gradient replicates across 368 donors |
| **04** | Macro AUROC 0.999 on held-out donors; SHAP → *SLC1A2*, *CST3* |
| **05** | Official Allen **Astrocyte** supercluster confirms Astrocyte_2 |
| **06** | AD score ↓ in dementia (−22% Astrocyte_2-like); APOE4 carriers lower |
| **07** | Top LR: **EFNA5→EPHA6**, **APOE→SORL1** to hippocampal/cortical neurons |

## NeuroVision Neuro Platform

Interactive web app wrapping NB01–NB07 findings. See [`platform/README.md`](platform/README.md) and [`neurovision_neuro_prd.md`](neurovision_neuro_prd.md).

```bash
# Export data + NB04 models (once)
python scripts/export_platform_data.py --copy-models

# Terminal 1: API
cd platform/backend && pip install -r requirements.txt && uvicorn main:app --reload

# Terminal 2: UI
cd platform/frontend && npm install && npm run dev
```

**Routes:** Atlas · AD score · Cell classifier (scVI+MLP) · Disease comparison · L-R explorer

---

## Planned Next Steps

- Donor-level mixed models (SEA-AD: 84 donors; WHB full atlas)
- Cross-dataset scVI on shared gene space
- SEA-AD ligand-receptor comparison (disease-altered communication)
- MERFISH spatial validation
- Blog post, poster, conference submission
