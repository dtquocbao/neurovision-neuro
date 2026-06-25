# NeuroVision Neuro - Web Platform

Interactive research platform wrapping Brain Cell Atlas notebooks NB01–NB07.

**Stack:** React (Vite) + FastAPI + precomputed CSV assets + NB04 ML models

## Features

| Route | Feature |
|-------|---------|
| `/` | Science-first landing — central finding + 4 key result cards |
| `/findings` | Full NB01–07 scientific results (committee-readable) |
| `/atlas` | Guided 4-step UMAP story + free explore |
| `/score` | AD support score from CSV/h5ad upload |
| `/classifier` | scVI + MLP cell-state predictor (NB04) |
| `/disease` | SEA-AD reference panel + upload comparison (NB06) |
| `/lr` | L-R explorer with biological annotations (NB07) |
| `/about` | Project narrative + references |

## Quick start

### 1. Export platform data + models (once)

From repo root with conda env active:

```bash
python scripts/export_platform_data.py --copy-models
```

Requires:

- `data/processed/brain_non_neuronal_50k_annotated_umap.h5ad` (UMAP export)
- `models/scvi_nb04/` from NB04 (`model.save` + `mlp_classifier.pkl`, `label_encoder.pkl`)

### 2. Backend

```bash
cd platform/backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

API docs: http://127.0.0.1:8000/docs

### 3. Frontend

```bash
cd platform/frontend
npm install
npm run dev
```

App: http://localhost:5173 (proxies `/api` → backend)

## Deployment

**GitHub Actions** deploys on push to `main` (`platform/**` changes).

Guide: [`DEPLOY.md`](DEPLOY.md) — secrets, HF Space, Vercel project setup

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check + model availability |
| GET | `/api/atlas` | UMAP + metadata |
| GET | `/api/lr-interactions` | LIANA pairs |
| GET | `/api/disease-reference` | SEA-AD reference medians (NB06) |
| POST | `/api/score` | Multipart CSV/h5ad → AD support score |
| POST | `/api/classify` | scVI + MLP → Astrocyte_2 / Astrocyte / Other |
| POST | `/api/disease-compare` | Stratify score by disease metadata |

## Project layout

```
platform/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── pipelines/
│   │   ├── scorer.py
│   │   ├── classifier.py
│   │   └── disease.py
│   ├── models/              # NB04 scVI + MLP (gitignored, export with script)
│   └── data/
│       ├── umap_embeddings.csv
│       ├── liana_results.csv
│       └── seaad_reference.json
└── frontend/
    └── src/pages/           # Landing, Atlas, Score, Classifier, Disease, LR, About
```

See `neurovision_neuro_prd_v2.md` for the science-first product spec (v2).
