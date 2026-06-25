"""NeuroVision Neuro - FastAPI backend (atlas, score, LR, classifier, disease)."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from pipelines.classifier import classify_from_upload, models_available
from pipelines.disease import disease_compare_from_upload, load_reference
from pipelines.scorer import DEFAULT_GENES, score_from_upload

APP_ROOT = Path(__file__).resolve().parent
DATA_DIR = APP_ROOT / "data"


def _cors_origins() -> list[str]:
    raw = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    return [o.strip() for o in raw.split(",") if o.strip()]


app = FastAPI(
    title="NeuroVision Neuro API",
    description="AD-associated astrocyte state scoring and atlas browser (NB01–NB07)",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_origin_regex=os.getenv("CORS_ORIGIN_REGEX", r"https://.*\.vercel\.app"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(500 * 1024 * 1024)))


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "neurovision-neuro",
        "health": "/api/health",
        "docs": "/docs",
    }


def _load_csv(name: str) -> pd.DataFrame:
    path = DATA_DIR / name
    if not path.exists():
        raise HTTPException(status_code=503, detail=f"Missing data file: {name}")
    return pd.read_csv(path)


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "service": "neurovision-neuro",
        "models": models_available(),
    }


@app.get("/api/disease-reference")
def get_disease_reference() -> dict[str, Any]:
    """Precomputed SEA-AD cohort reference (NB06) for overlay on user uploads."""
    ref = load_reference()
    if not ref:
        raise HTTPException(status_code=503, detail="Missing seaad_reference.json")
    return ref


@app.get("/api/atlas")
def get_atlas(
    limit: int = Query(5000, ge=100, le=50000),
    cell_type: str | None = None,
    region: str | None = None,
) -> dict[str, Any]:
    """Precomputed UMAP embeddings from NB01–05."""
    df = _load_csv("umap_embeddings.csv")
    if cell_type:
        df = df[df["cell_type"] == cell_type]
    if region and "anatomical_division_label" in df.columns:
        df = df[df["anatomical_division_label"] == region]

    if len(df) > limit:
        df = df.sample(n=limit, random_state=42)

    color_options = ["cell_type", "AD_support_score", "anatomical_division_label"]
    if "whb_supercluster" in df.columns:
        color_options.append("whb_supercluster")

    cells = df.to_dict(orient="records")
    meta = {
        "n_total": len(_load_csv("umap_embeddings.csv")),
        "n_returned": len(cells),
        "cell_types": sorted(df["cell_type"].dropna().unique().tolist()),
        "regions": sorted(
            df["anatomical_division_label"].dropna().unique().tolist()
        )
        if "anatomical_division_label" in df.columns
        else [],
        "color_by_options": color_options,
    }
    return {"cells": cells, "meta": meta}


@app.get("/api/lr-interactions")
def get_lr_interactions(
    source: str | None = None,
    target: str | None = None,
    ligand: str | None = None,
    astrocyte_2_only: bool = False,
    top_n: int = Query(50, ge=1, le=500),
) -> dict[str, Any]:
    """Precomputed LIANA rank_aggregate results from NB07."""
    df = _load_csv("liana_results.csv")
    if astrocyte_2_only:
        df = df[(df["source"] == "Astrocyte_2") | (df["target"] == "Astrocyte_2")]
    if source:
        df = df[df["source"] == source]
    if target:
        df = df[df["target"] == target]
    if ligand:
        df = df[df["ligand_complex"].str.contains(ligand, case=False, na=False)]

    sort_col = "magnitude_rank" if "magnitude_rank" in df.columns else "lr_means"
    ascending = sort_col == "magnitude_rank"
    df = df.sort_values(sort_col, ascending=ascending).head(top_n)

    sources = sorted(_load_csv("liana_results.csv")["source"].unique().tolist())
    targets = sorted(_load_csv("liana_results.csv")["target"].unique().tolist())
    ligands = sorted(_load_csv("liana_results.csv")["ligand_complex"].unique().tolist())

    return {
        "interactions": df.to_dict(orient="records"),
        "filters": {
            "sources": sources,
            "targets": targets,
            "ligands": ligands[:100],
        },
        "n_returned": len(df),
    }


@app.post("/api/score")
async def compute_score(
    file: UploadFile = File(...),
    cell_id_column: str = Form("cell_id"),
    cell_type_column: str = Form("cell_type"),
) -> dict[str, Any]:
    """Compute AD support score from uploaded CSV or h5ad."""
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 500MB limit")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required")

    try:
        return score_from_upload(
            content,
            file.filename,
            cell_id_column=cell_id_column,
            cell_type_column=cell_type_column,
            genes=DEFAULT_GENES,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Scoring failed: {exc}") from exc


@app.post("/api/classify")
async def classify_cells(
    file: UploadFile = File(...),
    cell_id_column: str = Form("cell_id"),
    cell_type_column: str = Form("cell_type"),
) -> dict[str, Any]:
    """Run scVI latent embedding + MLP classifier (NB04)."""
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 500MB limit")
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required")

    try:
        return classify_from_upload(
            content,
            file.filename,
            cell_id_column=cell_id_column,
            cell_type_column=cell_type_column,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Classification failed: {exc}") from exc


@app.post("/api/disease-compare")
async def disease_compare(
    file: UploadFile = File(...),
    cell_id_column: str = Form("cell_id"),
    score_column: str = Form("AD_support_score"),
    disease_column: str = Form("disease"),
    braak_column: str = Form("Braak stage"),
    adnc_column: str = Form("ADNC"),
    apoe4_column: str = Form("APOE4 status"),
    cps_column: str = Form("Continuous Pseudo-progression Score"),
) -> dict[str, Any]:
    """Stratify AD support score by disease metadata (NB06)."""
    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 500MB limit")
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required")

    try:
        return disease_compare_from_upload(
            content,
            file.filename,
            cell_id_column=cell_id_column,
            score_column=score_column,
            disease_column=disease_column,
            braak_column=braak_column,
            adnc_column=adnc_column,
            apoe4_column=apoe4_column,
            cps_column=cps_column,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Disease comparison failed: {exc}") from exc
