# NeuroVision Neuro - Product Requirements Document v1.0

## Overview

**Product:** NeuroVision Neuro - an interactive neuroscience research platform that wraps the Brain Cell Atlas findings (NB01–NB07) into a deployable web application.

**Stack:** React (frontend) + FastAPI (backend) + Python ML pipeline

**Goal:** Allow researchers to upload single-cell expression data and receive AD-associated astrocyte state predictions, scores, and visualizations; demonstrating both computational biology depth and software engineering capability for PhD portfolio.

---

## Core Features

### 1. AD Support Score Calculator
- **Input:** Gene expression matrix (CSV or h5ad)
- **Processing:** Compute AD support score from 6-gene panel (APOE, CLU, CST3, AQP4, SLC1A2, SPARCL1)
- **Output:** Per-cell score distribution, violin plot by cell type, quartile enrichment table
- **Endpoint:** `POST /api/score`

### 2. Astrocyte State Classifier
- **Input:** Gene expression matrix
- **Processing:** Run scVI latent embedding → MLP classifier (NB04 model)
- **Output:** Per-cell prediction (Astrocyte_2 / Astrocyte / Other), confidence scores, UMAP colored by prediction
- **Endpoint:** `POST /api/classify`

### 3. AD Risk Comparison Dashboard
- **Input:** Donor metadata (disease status, Braak stage, ADNC, APOE4)
- **Processing:** Stratify AD support score by disease metadata
- **Output:** Normal vs dementia violin, Braak stage gradient, ADNC heatmap, CPS scatter
- **Endpoint:** `POST /api/disease-compare`

### 4. Ligand-Receptor Explorer
- **Input:** Precomputed LIANA results (from NB07)
- **Processing:** Filter and rank LR pairs by cell type pair, ligand, magnitude rank
- **Output:** Interactive dotplot, heatmap, Astrocyte_2-specific interaction table
- **Endpoint:** `GET /api/lr-interactions`

### 5. Atlas Browser
- **Static:** Precomputed UMAP embeddings from NB01–NB07
- **Display:** Cell type, AD support score, Braak stage, regional distribution overlays
- **Endpoint:** `GET /api/atlas`

---

## Pages

### `/` - Landing
- Project title: "NeuroVision Neuro: A Computational Atlas of AD-Associated Astrocyte States"
- Brief narrative: NB01→NB07 story in 3 sentences
- Navigation to all tools
- Key stats: 888k nuclei, 368 donors, 6 notebooks, AUROC 0.9991

### `/atlas` - Brain Cell Atlas Browser
- Interactive UMAP (plotly/d3)
- Color by: cell type / AD support score / Braak stage / anatomical region
- Sidebar: cell type selector, region filter
- Click on cell → show metadata panel

### `/classifier` - Cell State Predictor
- Upload panel (CSV or h5ad, max 500MB)
- Gene panel validation (checks for required genes)
- Results: prediction table + UMAP + confidence histogram
- Download results as CSV

### `/score` - AD Support Score
- Upload panel
- Gene availability check
- Results: violin by cell type + quartile heatmap + summary stats
- Download scored matrix

### `/disease` - Disease Comparison
- Upload panel with metadata columns selector
- Results: normal vs dementia violin + Braak gradient + ADNC heatmap
- Reference line from SEA-AD cohort overlaid

### `/lr` - Ligand-Receptor Explorer
- Preloaded NB07 LIANA results (no upload needed)
- Filters: source cell type, target cell type, ligand, top N
- Views: dotplot / heatmap / network graph
- Highlight Astrocyte_2-specific interactions

### `/about` - Project Story
- NB01→NB07 narrative with key figures embedded
- Methods summary table
- GitHub link
- References (Siletti et al. 2023, Gabitto et al. 2024)

---

## Backend API Spec

```
FastAPI app
├── /api/score           POST  - compute AD support score
├── /api/classify        POST  - run scVI + MLP classifier
├── /api/disease-compare POST  - stratify by disease metadata
├── /api/lr-interactions GET   - return precomputed LIANA results
├── /api/atlas           GET   - return precomputed UMAP embeddings
└── /api/health          GET   - health check
```

### Key Backend Files
```
backend/
├── main.py                   # FastAPI app
├── models/
│   ├── scvi_nb04/            # saved scVI model
│   └── mlp_classifier.pkl    # saved MLP
├── pipelines/
│   ├── scorer.py             # AD support score computation
│   ├── classifier.py         # scVI + MLP inference
│   └── disease.py            # disease stratification
├── data/
│   ├── liana_results.csv     # precomputed NB07 output
│   └── umap_embeddings.csv   # precomputed UMAP coords + metadata
└── requirements.txt
```

### Key Frontend Files
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Atlas.jsx
│   │   ├── Classifier.jsx
│   │   ├── Score.jsx
│   │   ├── Disease.jsx
│   │   ├── LR.jsx
│   │   └── About.jsx
│   ├── components/
│   │   ├── UMAPViewer.jsx       # plotly UMAP
│   │   ├── ViolinPlot.jsx       # recharts violin
│   │   ├── HeatmapViewer.jsx    # d3 heatmap
│   │   ├── DotPlot.jsx          # LR dotplot
│   │   ├── UploadPanel.jsx      # file upload
│   │   └── MetadataPanel.jsx    # cell metadata sidebar
│   └── api/
│       └── client.js            # axios API client
└── package.json
```

---

## Data Contracts

### Score endpoint input
```json
{
  "expression_matrix": "base64_encoded_csv_or_h5ad",
  "cell_type_column": "cell_type",
  "gene_columns": ["APOE", "CLU", "CST3", "AQP4", "SLC1A2", "SPARCL1"]
}
```

### Score endpoint output
```json
{
  "scores": [{"cell_id": "...", "cell_type": "...", "AD_support_score": 0.0}],
  "summary": {"mean": 0.0, "median": 0.0, "q4_fraction": 0.0},
  "violin_data": {},
  "quartile_table": {}
}
```

### Classifier endpoint input
```json
{
  "expression_matrix": "base64_encoded_csv_or_h5ad",
  "cell_type_column": "cell_type"
}
```

### Classifier endpoint output
```json
{
  "predictions": [{"cell_id": "...", "predicted_class": "Astrocyte_2", "confidence": 0.94}],
  "class_distribution": {"Astrocyte_2": 0.25, "Astrocyte": 0.35, "Other": 0.40},
  "umap_coords": [{"cell_id": "...", "x": 0.0, "y": 0.0, "predicted_class": "..."}]
}
```

---

## Non-Functional Requirements

- **Performance:** Score + classify pipeline < 30s for 10,000 cells
- **File size limit:** 500MB upload max
- **Error handling:** Graceful fallback if required genes missing (show which genes absent, proceed with available)
- **No auth required:** Public portfolio tool
- **Deployment target:** Local first, then HuggingFace Spaces or Render
- **Python version:** 3.10+
- **Node version:** 18+

---

## Key Dependencies

### Backend
```
fastapi
uvicorn
scanpy
scvi-tools
scikit-learn
shap
pandas
numpy
scipy
anndata
liana
joblib
python-multipart
```

### Frontend
```
react
react-router-dom
plotly.js
recharts
d3
axios
tailwindcss
lucide-react
```

---

## MVP Scope (build first)

1. `/atlas` : precomputed UMAP browser (no upload, static data)
2. `/score` : AD support score from CSV upload
3. `/lr` : precomputed LR explorer (no upload, static data)

Classifier and disease comparison pages can follow after MVP is validated.

---

## Precomputed Assets to Export from Notebooks

Before building the platform, export these from your notebooks:

```python
# From NB01-05 - UMAP + metadata
umap_df = pd.DataFrame({
    "UMAP1": adata.obsm["X_umap"][:, 0],
    "UMAP2": adata.obsm["X_umap"][:, 1],
    "cell_type": adata.obs["cell_type"],
    "AD_support_score": adata.obs["AD_support_score"],
    "anatomical_division_label": adata.obs["anatomical_division_label"],
    "whb_supercluster": adata.obs["whb_supercluster"]
})
umap_df.to_csv("../platform/backend/data/umap_embeddings.csv", index=False)

# From NB07 - LIANA results
liana_res.to_csv("../platform/backend/data/liana_results.csv", index=False)

# From NB04 - save models
import joblib
joblib.dump(clf, "../platform/backend/models/mlp_classifier.pkl")
joblib.dump(le, "../platform/backend/models/label_encoder.pkl")
```

---

## Biological Context (for agent reference)

The platform wraps findings from 7 research notebooks:

| Notebook | Key finding |
|----------|-------------|
| NB01 | Astrocyte_2 discovered; forebrain enriched (51% cortex, 28% hippocampus) |
| NB02 | 99.9% Q4 neuroprotective score; near-complete separation from canonical Astrocyte |
| NB03 | AD score regional gradient; donor variability std=1.21 across 368 donors |
| NB04 | scVI + MLP classifier AUROC=0.9991; SHAP recovers SLC1A2, APOE independently |
| NB05 | Allen WHB taxonomy confirms Astrocyte_2 maps to official Astrocyte supercluster |
| NB06 | AD support score lower in dementia (p=3.96e-177); APOE4 carriers depleted (p=8.22e-47) |
| NB07 | EFNA5→EPHA6 and APOE→SORL1 top LR pairs; 14 Astrocyte_2-unique vs 5 Astrocyte-unique |

**Key gene panel:** APOE, CLU, CST3, AQP4, SLC1A2, SPARCL1

**Key cell types:** Astrocyte_2, Astrocyte, Oligodendrocyte, Microglia, Pericyte, Endothelial

**Key regions:** Cerebral cortex, Hippocampus, Amygdaloid complex, Hypothalamus
