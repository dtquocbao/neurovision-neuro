"""AD support score computation (NB02/03 six-gene panel)."""

from __future__ import annotations

import io
from typing import Any

import numpy as np
import pandas as pd

DEFAULT_GENES = ["APOE", "CLU", "CST3", "AQP4", "SLC1A2", "SPARCL1"]


def _parse_expression_table(
    content: bytes,
    filename: str,
    cell_id_column: str,
    cell_type_column: str | None,
) -> tuple[pd.DataFrame, pd.Index, pd.Series | None]:
    """Load cells × genes matrix from CSV. First column or index = cell ids."""
    name = filename.lower()
    if name.endswith(".h5ad"):
        import anndata as ad

        adata = ad.read_h5ad(io.BytesIO(content))
        if cell_type_column and cell_type_column in adata.obs.columns:
            cell_types = adata.obs[cell_type_column].astype(str)
        else:
            cell_types = None
        expr = pd.DataFrame(
            adata.X.toarray() if hasattr(adata.X, "toarray") else adata.X,
            index=adata.obs_names,
            columns=adata.var_names,
        )
        return expr, expr.index, cell_types

    df = pd.read_csv(io.BytesIO(content))
    if cell_id_column in df.columns:
        df = df.set_index(cell_id_column)
    elif df.columns[0].lower() in {"cell_id", "cell", "barcode", "cell_label"}:
        df = df.set_index(df.columns[0])

    cell_types = None
    if cell_type_column and cell_type_column in df.columns:
        cell_types = df[cell_type_column].astype(str)
        df = df.drop(columns=[cell_type_column])

    # Drop non-numeric metadata columns
    numeric = df.select_dtypes(include=[np.number])
    return numeric, numeric.index, cell_types


def compute_ad_support_score(
    expr: pd.DataFrame,
    genes: list[str] | None = None,
) -> tuple[pd.Series, list[str], list[str]]:
    """
    Scanpy-compatible score_genes: mean expression of panel minus mean of reference.
    Reference = genes not in panel (or random control genes if panel covers all).
    """
    genes = genes or DEFAULT_GENES
    present = [g for g in genes if g in expr.columns]
    missing = [g for g in genes if g not in expr.columns]
    if not present:
        raise ValueError(f"No score genes found in matrix. Missing all of: {genes}")

    X = expr[present].to_numpy(dtype=float)
    panel_mean = X.mean(axis=1)

    ref_cols = [c for c in expr.columns if c not in present]
    if len(ref_cols) < 10:
        rng = np.random.default_rng(42)
        ref_idx = rng.choice(expr.shape[1], size=min(50, expr.shape[1]), replace=False)
        ref_mean = expr.iloc[:, ref_idx].to_numpy(dtype=float).mean(axis=1)
    else:
        ref_mean = expr[ref_cols].to_numpy(dtype=float).mean(axis=1)

    scores = panel_mean - ref_mean
    return pd.Series(scores, index=expr.index, name="AD_support_score"), present, missing


def score_from_upload(
    content: bytes,
    filename: str,
    cell_id_column: str = "cell_id",
    cell_type_column: str = "cell_type",
    genes: list[str] | None = None,
) -> dict[str, Any]:
    expr, cell_ids, cell_types = _parse_expression_table(
        content, filename, cell_id_column, cell_type_column
    )
    scores, present, missing = compute_ad_support_score(expr, genes)

    records = []
    for cid in cell_ids:
        row: dict[str, Any] = {
            "cell_id": str(cid),
            "AD_support_score": float(scores.loc[cid]),
        }
        if cell_types is not None:
            row["cell_type"] = str(cell_types.loc[cid])
        records.append(row)

    scores_df = pd.DataFrame(records)
    quartile_table: dict[str, dict[str, float]] = {}
    if "cell_type" in scores_df.columns:
        scores_df["quartile"] = pd.qcut(
            scores_df["AD_support_score"],
            q=4,
            labels=["Q1", "Q2", "Q3", "Q4"],
            duplicates="drop",
        )
        ct = pd.crosstab(
            scores_df["cell_type"],
            scores_df["quartile"],
            normalize="index",
        )
        quartile_table = ct.round(4).to_dict()

    violin_data: dict[str, list[float]] = {}
    if "cell_type" in scores_df.columns:
        for ct, grp in scores_df.groupby("cell_type"):
            violin_data[str(ct)] = grp["AD_support_score"].tolist()

    q4_frac = float(
        (scores_df["AD_support_score"] >= scores_df["AD_support_score"].quantile(0.75)).mean()
    )

    return {
        "scores": records,
        "summary": {
            "mean": float(scores_df["AD_support_score"].mean()),
            "median": float(scores_df["AD_support_score"].median()),
            "std": float(scores_df["AD_support_score"].std()),
            "q4_fraction": q4_frac,
            "n_cells": len(scores_df),
        },
        "genes_present": present,
        "genes_missing": missing,
        "violin_data": violin_data,
        "quartile_table": quartile_table,
    }
