---
title: NeuroVision Neuro API
emoji: 🧠
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# NeuroVision Neuro — Backend API

FastAPI backend for the NeuroVision Neuro brain cell atlas platform (NB01–NB07).

**Endpoints:** `/api/atlas` · `/api/score` · `/api/classify` · `/api/disease-compare` · `/api/lr-interactions`

Interactive docs: `/docs`

## Space variables (Settings → Variables)

| Variable | Example | Purpose |
|----------|---------|---------|
| `CORS_ORIGINS` | `https://your-app.vercel.app` | Allow your Vercel frontend |
| `CORS_ORIGIN_REGEX` | `https://.*\.vercel\.app` | Vercel preview deploys (default in app) |

## NB04 classifier models

Place scVI + MLP weights in `models/` (see repo `scripts/export_platform_data.py --copy-models`).
Without models, `/api/classify` returns 503; all other endpoints work.
