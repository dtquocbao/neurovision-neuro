# NeuroVision Neuro — Product Requirements Document v2.0
## Scientific-First Update

This document updates PRD v1.0. The platform has been built and is functional.
This update reorients the platform so **scientific insight is the primary contribution**,
not engineering capability. All existing features are retained; this document
specifies changes and additions only.

---

## Core Problem with v1.0

The current platform reads as a demo app. Tools are the hero. Science is secondary.
The fix: findings lead, tools follow. Every page should answer a biological question,
not demonstrate a capability.

---

## Changes to Existing Pages

### `/` — Landing Page (REWRITE)

**Current:** Tool cards with descriptions, stats banner.

**New:** Lead with the central scientific finding, then show tools as ways to explore it.

**Hero section copy (replace current):**
```
We identified a forebrain-enriched astrocyte state - Astrocyte_2 - whose
neuroprotective transcriptional program is progressively lost in Alzheimer's
disease donors, depleted in APOE4 carriers, and communicates with hippocampal
neurons via EFNA5→EPHA6 and APOE→SORL1 signaling.
```

**Finding cards (replace tool cards):**
Show 4 finding cards before tool cards:
1. "Astrocyte_2 is forebrain-enriched" — 51% cortex, 28% hippocampus, absent from hindbrain
2. "AD neuroprotective program is nearly exclusive" — 96% Q4 vs 13% canonical Astrocyte
3. "Program is lost in Alzheimer's disease" — dementia median 0.197 vs normal 0.300, p=3.96e-177
4. "APOE→SORL1 is the dominant communication axis" — top LR pair in the entire dataset

**Stats banner:** Keep but add scientific context:
- 888k Nuclei (WHB) → "from 14 brain regions"
- 368 Donors → "neurotypical, WHB atlas"
- 7 Notebooks → "discovery through validation"
- 0.999 AUROC → "donor-aware held-out test"

**Tool cards:** Move below finding cards, label section "Explore the Data"

---

### `/atlas` — Atlas Browser (ADD GUIDED STORY MODE)

**Current:** UMAP with color selector. Static browsing.

**Add:** Guided story panel on the left side with 4 steps.
User clicks through steps; UMAP updates automatically to match each step.

**Story steps:**
```
Step 1 — "The Non-Neuronal Landscape"
  Color by: cell type
  Annotation: "12 non-neuronal populations from 888k nuclei.
  Two astrocyte states coexist — Astrocyte and Astrocyte_2."

Step 2 — "Astrocyte_2 is Transcriptionally Distinct"
  Color by: cell type, highlight Astrocyte_2
  Annotation: "Astrocyte_2 (n=4,081) occupies a distinct UMAP territory.
  Top markers: SLC1A2 (log2FC 19.7), SPARCL1 (15.3), AQP4 (13.3)."

Step 3 — "The AD-Associated Program"
  Color by: AD support score (Reds colormap)
  Annotation: "96% of Astrocyte_2 cells score in the top quartile.
  The neuroprotective program — APOE, CLU, AQP4, SLC1A2 — is concentrated here."

Step 4 — "Forebrain Anatomy"
  Color by: anatomical_division_label
  Annotation: "51% cerebral cortex, 28% hippocampus.
  Zero representation in cerebellum, myelencephalon, or spinal cord."
```

**Free explore mode:** Remains available after story, with all existing controls.

---

### `/lr` — Ligand-Receptor Explorer (ADD BIOLOGICAL ANNOTATIONS)

**Current:** Table and dotplot with raw LR pair data.

**Add:** Biological annotation column in the LR table.
For each LR pair, show a one-line note. Hardcode annotations for the top pairs:

```javascript
const lrAnnotations = {
  "EFNA5_EPHA6": "Synapse refinement - ephrin/Eph mediates long-term potentiation in hippocampus",
  "APOE_SORL1": "Lipid transport - SORL1 regulates APP processing; top AD GWAS gene",
  "APOE_TREM2": "Microglial activation - APOE/TREM2 axis is central to AD neuroinflammation",
  "FN1_ITGA6": "ECM scaffolding - fibronectin/integrin perisynaptic matrix support",
  "CNTN4_PTPRG": "Synapse-astrocyte contact - bidirectional circuit co-regulation",
  "VEGFA_GRIN2B": "Synaptic plasticity - VEGF signaling to NMDA receptor (Astrocyte_2 unique)",
  "VEGFA_NRP1": "Axon guidance/survival - neuropilin-1 mediates VEGF neuroprotection",
  "LAMC1_ITGA1": "Basement membrane - laminin support of perivascular astrocyte endfeet",
  "TNC_PTPRB": "Perisynaptic ECM - tenascin-C modulates synaptic plasticity",
  "EFNB2_EPHA6": "Synapse maturation - class B ephrin/Eph cross-talk",
  "C3_GRM7": "Complement/inflammation - canonical Astrocyte reactive signal (NOT Astrocyte_2)",
  "TNFSF10_TNFRSF10B": "Apoptosis - TRAIL pathway, canonical Astrocyte only"
};
```

**Add:** "Astrocyte_2 vs Astrocyte" toggle that highlights which interactions are
unique to Astrocyte_2 (14), unique to canonical Astrocyte (5), or shared (1).

**Add:** Summary panel above the table:
```
Astrocyte_2 → Neuron: 79 interactions
Neuron → Astrocyte_2: 74 interactions
Astrocyte_2-unique pairs: 14 (synaptogenic/neuroprotective)
Canonical Astrocyte-unique: 5 (complement/inflammatory)
Shared: 1
Top interaction: APOE→SORL1 (magnitude_rank 0.000011)
```

---

### `/disease` — Disease Comparison (ADD SEA-AD REFERENCE OVERLAY)

**Current:** Upload panel for user data, disease stratification plots.

**Add:** SEA-AD Reference Panel — always-visible section showing NB06 results
as the scientific baseline, even without user upload.

**SEA-AD reference panel content (hardcoded from NB06 results):**

Normal vs Dementia:
- Normal median: 0.300 (n=32,830)
- Dementia median: 0.197 (n=34,589)
- p = 3.96e-177, rank-biserial r = −0.126

ADNC gradient table:
| ADNC | Median Score |
|------|-------------|
| Not AD | 0.302 |
| Low | 0.264 |
| Intermediate | 0.310 |
| High | 0.199 |

APOE4 effect:
- Carrier median: 0.201 (n=20,395)
- Non-carrier median: 0.264 (n=47,024)
- p = 8.22e-47

Braak stage: scores decline from Braak 0 → Braak VI (Kruskal-Wallis p < 0.001)

**Framing copy above reference panel:**
```
"In the SEA-AD MTG cohort (84 donors, 67,419 astrocytes), the AD-associated
neuroprotective program is significantly lower in dementia donors and declines
with increasing neuropathological severity. Upload your own data to compare
against this reference."
```

---

## New Page: `/findings` — Key Findings

**Route:** `/findings`
**Nav label:** "Findings"
**Position in nav:** Between Home and Atlas

**Purpose:** The scientific results page. A PhD committee member or PI should
be able to read this page and understand the full contribution without running
any notebooks.

**Layout:** Single scrolling page with 7 sections, one per notebook.

### Section structure for each notebook:

```
[NB badge] Notebook 01 — Discovery
[One-sentence finding]
[Key result — stat or table]
[One-sentence biological interpretation]
[Link: "Explore in Atlas →" or "Open tool →"]
```

### Content for each section:

**NB01 — Discovery**
Finding: Leiden clustering of 50,000 WHB non-neuronal nuclei resolves two astrocyte states.
Key result: Astrocyte_2 (n=4,081) - top markers SLC1A2 (log2FC 19.7), SPARCL1 (15.3), AQP4 (13.3). Regional distribution: 51.5% cerebral cortex, 27.9% hippocampus, 0% hindbrain.
Interpretation: A forebrain-specialized astrocyte state with a coherent synaptic-support transcriptional program.

**NB02 — Neuroprotective Scoring**
Finding: Astrocyte_2 dominates the neuroprotective support score landscape across all non-neuronal populations.
Key result: 96% of Astrocyte_2 in Q4 vs 13% of canonical Astrocyte. Mann-Whitney rank-biserial r = 0.967, p < 0.001.
Interpretation: The Astrocyte_2 program is not a generic astrocyte signature - it represents the extreme high tail of neuroprotective gene expression across the atlas.

**NB03 — AD Score Stratification**
Finding: The AD-associated program is highest in cortex and hippocampus within Astrocyte_2, consistent across 368 donors.
Key result: Cortex median 5.77, hippocampus 5.73, hypothalamus 2.56. Donor score std = 1.21 across 368 libraries.
Interpretation: The regional gradient replicates across donors - not a batch artifact. Substantial inter-donor variability motivates disease cohort comparison.

**NB04 — Cell-State Prediction**
Finding: A donor-aware scVI + MLP classifier predicts Astrocyte_2 identity with near-perfect performance on held-out donors.
Key result: Macro AUROC 0.9991. Astrocyte_2 F1 = 0.93. SHAP independently recovers SLC1A2, APOE, AQP4 as top features.
Interpretation: The Astrocyte_2, rediscovering NB01 markers through an independent ML path, is the strongest evidence for biological reality.

**NB05 — Taxonomy Validation**
Finding: Cross-referencing 50,000 cells against the Allen WHB official taxonomy confirms Astrocyte_2 maps to the Astrocyte supercluster.
Key result: 40% of Astrocyte_2 maps to WHB "Astrocyte" supercluster. Subcluster: Astro_52_3085. Taxonomy-independent validation of manual annotation.
Interpretation: Astrocyte_2 is not an annotation artifact, it corresponds to a real population recognized by the Allen Institute reference taxonomy.

**NB06 — Disease Comparison (SEA-AD)**
Finding: The neuroprotective program is progressively lost as AD pathology accumulates across 84 SEA-AD donors.
Key result table:
| Comparison | Direction | p-value | Effect size |
|------------|-----------|---------|-------------|
| Normal vs Dementia | ↓ dementia | 3.96e-177 | r = −0.126 |
| ADNC High vs Not AD | ↓ High ADNC | Kruskal p<0.001 | — |
| APOE4 carrier vs non | ↓ carrier | 8.22e-47 | — |
| CPS correlation | ↓ progression | 4.94e-288 | r = −0.139 |
Interpretation: Four converging metrics confirm program loss in disease. APOE4 carriers show additional depletion, connecting the top Astrocyte_2 marker to genetic risk.

**NB07 — Ligand-Receptor Communication**
Finding: Astrocyte_2 communicates with cortical and hippocampal neurons through a synaptogenic program distinct from canonical Astrocyte.
Key result: 14 Astrocyte_2-unique LR pairs (EFNA5→EPHA6, APOE→SORL1, VEGFA→GRIN2B) vs 5 canonical Astrocyte-unique pairs (C3→GRM7, TNFSF10→TNFRSF10B). Only 1 shared interaction.
Interpretation: Astrocyte_2 signals through synapse refinement and lipid transport; canonical Astrocyte signals through complement-mediated inflammation. The near-complete separation of communication profiles provides functional mechanistic evidence for the Astrocyte_2 program.

**Bottom of /findings:**
Add methods summary table:
| Step | Method | Tool | Key parameter |
|------|--------|------|---------------|
| Clustering | Leiden | Scanpy | resolution=0.5 |
| Batch correction | scVI | scvi-tools | n_latent=20, batch_key=library_label |
| Classification | MLP | scikit-learn | hidden=(64,32), donor-aware split |
| Interpretability | SHAP | shap | KernelExplainer, 500 background |
| LR analysis | LIANA rank aggregate | liana 1.7.3 | resource=consensus, expr_prop=0.1 |
| Disease validation | Mann-Whitney U | scipy | SEA-AD MTG, 84 donors |

Add references:
- Siletti K et al. Transcriptomic diversity of cell types across the adult human brain. Nature. 2023.
- Gabitto MI et al. Integrated multimodal cell atlas of Alzheimer's disease. Nature Neuroscience. 2024.
- Wolf FA et al. SCANPY. Genome Biology. 2018.
- Lopez R et al. Deep generative modeling for single-cell transcriptomics. Nature Methods. 2018.

---

## Navigation Update

Add "Findings" between Home and Atlas:

```
Home | Findings | Atlas | AD Score | Classifier | Disease | L-R Explorer | About
```

---

## About Page Update

**Add to `/about`:**

Project narrative section (above methods):
```
"This project began as a portfolio for PhD applications to BCM, Rice University,
and UTHealth — targeting neuroscience and cancer research programs. The goal was
to demonstrate that software engineering experience (SaaS, full-stack development)
could be combined with rigorous bioinformatics and ML to produce scientifically
credible research.

The central finding — that a forebrain-enriched astrocyte state with a coherent
neuroprotective program is progressively lost in Alzheimer's disease — emerged
from 7 iterative notebooks combining single-cell transcriptomics, donor-aware
machine learning, taxonomy validation, disease cohort comparison, and
ligand-receptor communication analysis.

The platform you are using is the interactive wrapper around those findings."
```

---

## Summary of All Changes

| Page | Change type | Priority |
|------|-------------|----------|
| `/` Landing | Rewrite hero + add finding cards | High |
| `/findings` | New page — full scientific results | High |
| `/atlas` | Add guided story mode (4 steps) | High |
| `/lr` | Add biological annotations + Astrocyte_2 toggle | Medium |
| `/disease` | Add SEA-AD reference panel (hardcoded NB06 results) | Medium |
| `/about` | Add project narrative paragraph | Low |
| Nav | Add Findings link | High |

---

## Biological Context Reference (unchanged from v1.0)

**Key gene panel:** APOE, CLU, CST3, AQP4, SLC1A2, SPARCL1

**Key cell types:** Astrocyte_2, Astrocyte, Oligodendrocyte, Microglia, Pericyte, Endothelial

**Key regions:** Cerebral cortex, Hippocampus, Amygdaloid complex, Hypothalamus

**NB01–NB07 finding summary:**
| Notebook | Key finding |
|----------|-------------|
| NB01 | Astrocyte_2 discovered; forebrain enriched (51% cortex, 28% hippocampus) |
| NB02 | 99.9% Q4 neuroprotective score; near-complete separation from canonical Astrocyte |
| NB03 | AD score regional gradient; donor variability std=1.21 across 368 donors |
| NB04 | scVI + MLP classifier AUROC=0.9991; SHAP recovers SLC1A2, APOE independently |
| NB05 | Allen WHB taxonomy confirms Astrocyte_2 maps to official Astrocyte supercluster |
| NB06 | AD support score lower in dementia (p=3.96e-177); APOE4 carriers depleted (p=8.22e-47) |
| NB07 | EFNA5→EPHA6 and APOE→SORL1 top LR pairs; 14 Astrocyte_2-unique vs 5 Astrocyte-unique |
