/** Scientific copy and constants from PRD v2 / NB01–07 */

export const HERO_FINDING =
  "We identified a forebrain-enriched astrocyte state - Astrocyte_2 - whose neuroprotective transcriptional program is progressively lost in Alzheimer's disease donors, depleted in APOE4 carriers, and communicates with hippocampal neurons via EFNA5→EPHA6 and APOE→SORL1 signaling.";

export const FINDING_CARDS = [
  {
    title: "Astrocyte_2 is forebrain-enriched",
    detail: "51% cerebral cortex, 28% hippocampus, absent from hindbrain (cerebellum, myelencephalon, spinal cord).",
    nb: "NB01",
  },
  {
    title: "AD neuroprotective program is nearly exclusive",
    detail: "96% of Astrocyte_2 in Q4 vs 13% of canonical Astrocyte (Mann-Whitney r = 0.967, p < 0.001).",
    nb: "NB02",
  },
  {
    title: "Program is lost in Alzheimer's disease",
    detail: "Dementia median 0.197 vs normal 0.300 (p = 3.96×10⁻¹⁷⁷, rank-biserial r = −0.126).",
    nb: "NB06",
  },
  {
    title: "APOE→SORL1 is the dominant communication axis",
    detail: "Top LR pair in the entire dataset; lipid transport via SORL1, a top AD GWAS gene.",
    nb: "NB07",
  },
];

export const STATS = [
  { value: "888k", label: "Nuclei (WHB)", context: "from 14 brain regions" },
  { value: "368", label: "Donors", context: "neurotypical, WHB atlas" },
  { value: "7", label: "Notebooks", context: "discovery through validation" },
  { value: "0.999", label: "AUROC", context: "donor-aware held-out test" },
];

export const ATLAS_STORY = [
  {
    step: 1,
    title: "The Non-Neuronal Landscape",
    colorBy: "cell_type",
    annotation:
      "12 non-neuronal populations from 888k nuclei. Two astrocyte states coexist - Astrocyte and Astrocyte_2.",
  },
  {
    step: 2,
    title: "Astrocyte_2 is Transcriptionally Distinct",
    colorBy: "cell_type",
    highlight: "Astrocyte_2",
    annotation:
      "Astrocyte_2 (n=4,081) occupies a distinct UMAP territory. Top markers: SLC1A2 (log2FC 19.7), SPARCL1 (15.3), AQP4 (13.3).",
  },
  {
    step: 3,
    title: "The AD-Associated Program",
    colorBy: "AD_support_score",
    colorscale: "Reds",
    annotation:
      "96% of Astrocyte_2 cells score in the top quartile. The neuroprotective program - APOE, CLU, AQP4, SLC1A2 - is concentrated here.",
  },
  {
    step: 4,
    title: "Forebrain Anatomy",
    colorBy: "anatomical_division_label",
    annotation:
      "51% cerebral cortex, 28% hippocampus. Zero representation in cerebellum, myelencephalon, or spinal cord.",
  },
];

export const LR_ANNOTATIONS = {
  EFNA5_EPHA6:
    "Synapse refinement - ephrin/Eph mediates long-term potentiation in hippocampus",
  APOE_SORL1:
    "Lipid transport - SORL1 regulates APP processing; top AD GWAS gene",
  APOE_TREM2:
    "Microglial activation - APOE/TREM2 axis is central to AD neuroinflammation",
  FN1_ITGA6:
    "ECM scaffolding - fibronectin/integrin perisynaptic matrix support",
  CNTN4_PTPRG:
    "Synapse-astrocyte contact - bidirectional circuit co-regulation",
  VEGFA_GRIN2B:
    "Synaptic plasticity - VEGF signaling to NMDA receptor (Astrocyte_2 unique)",
  VEGFA_NRP1:
    "Axon guidance/survival - neuropilin-1 mediates VEGF neuroprotection",
  LAMC1_ITGA1:
    "Basement membrane - laminin support of perivascular astrocyte endfeet",
  TNC_PTPRB:
    "Perisynaptic ECM - tenascin-C modulates synaptic plasticity",
  EFNB2_EPHA6:
    "Synapse maturation - class B ephrin/Eph cross-talk",
  C3_GRM7:
    "Complement/inflammation - canonical Astrocyte reactive signal (NOT Astrocyte_2)",
  TNFSF10_TNFRSF10B:
    "Apoptosis - TRAIL pathway, canonical Astrocyte only",
};

export const LR_SUMMARY = {
  astro2ToNeuron: 79,
  neuronToAstro2: 74,
  astro2Unique: 14,
  astroUnique: 5,
  shared: 1,
  topPair: "APOE→SORL1",
  topRank: "0.000011",
};

/** Pair keys for uniqueness toggle (ligand_receptor uppercase) */
export const ASTRO2_UNIQUE_KEYS = new Set([
  "EFNA5_EPHA6",
  "APOE_SORL1",
  "VEGFA_GRIN2B",
  "VEGFA_NRP1",
  "CNTN4_PTPRG",
  "FN1_ITGA6",
  "LAMC1_ITGA1",
  "TNC_PTPRB",
  "EFNB2_EPHA6",
  "SEMA3C_NRP2",
  "NLGN1_NRXN1",
  "GAS6_AXL",
  "SPP1_CD44",
  "THBS1_CD47",
]);

export const ASTRO_UNIQUE_KEYS = new Set([
  "C3_GRM7",
  "TNFSF10_TNFRSF10B",
  "SERPINA3_LRP1",
  "CXCL8_ACKR1",
  "IL6_IL6R",
]);

export const SHARED_LR_KEYS = new Set(["APOE_LRP1"]);

export function lrPairKey(ligand, receptor) {
  const L = String(ligand ?? "").split(/[+&]/)[0].trim().toUpperCase();
  const R = String(receptor ?? "").split(/[+&]/)[0].trim().toUpperCase();
  return `${L}_${R}`;
}

export function getLrAnnotation(ligand, receptor) {
  return LR_ANNOTATIONS[lrPairKey(ligand, receptor)] ?? "";
}

export function classifyLrPair(ligand, receptor) {
  const key = lrPairKey(ligand, receptor);
  if (ASTRO2_UNIQUE_KEYS.has(key)) return "astro2_unique";
  if (ASTRO_UNIQUE_KEYS.has(key)) return "astro_unique";
  if (SHARED_LR_KEYS.has(key)) return "shared";
  return "other";
}

export const NOTEBOOK_FINDINGS = [
  {
    nb: "01",
    title: "Discovery",
    finding:
      "Leiden clustering of 50,000 WHB non-neuronal nuclei resolves two astrocyte states.",
    keyResult:
      "Astrocyte_2 (n=4,081) - top markers SLC1A2 (log2FC 19.7), SPARCL1 (15.3), AQP4 (13.3). Regional distribution: 51.5% cerebral cortex, 27.9% hippocampus, 0% hindbrain.",
    interpretation:
      "A forebrain-specialized astrocyte state with a coherent synaptic-support transcriptional program.",
    link: { to: "/atlas", label: "Explore in Atlas →" },
  },
  {
    nb: "02",
    title: "Neuroprotective Scoring",
    finding:
      "Astrocyte_2 dominates the neuroprotective support score landscape across all non-neuronal populations.",
    keyResult:
      "96% of Astrocyte_2 in Q4 vs 13% of canonical Astrocyte. Mann-Whitney rank-biserial r = 0.967, p < 0.001.",
    interpretation:
      "The Astrocyte_2 program is not a generic astrocyte signature - it represents the extreme high tail of neuroprotective gene expression across the atlas.",
    link: { to: "/score", label: "Compute AD score →" },
  },
  {
    nb: "03",
    title: "AD Score Stratification",
    finding:
      "The AD-associated program is highest in cortex and hippocampus within Astrocyte_2, consistent across 368 donors.",
    keyResult:
      "Cortex median 5.77, hippocampus 5.73, hypothalamus 2.56. Donor score std = 1.21 across 368 libraries.",
    interpretation:
      "The regional gradient replicates across donors - not a batch artifact. Substantial inter-donor variability motivates disease cohort comparison.",
    link: { to: "/atlas", label: "Explore in Atlas →" },
  },
  {
    nb: "04",
    title: "Cell-State Prediction",
    finding:
      "A donor-aware scVI + MLP classifier predicts Astrocyte_2 identity with near-perfect performance on held-out donors.",
    keyResult:
      "Macro AUROC 0.9991. Astrocyte_2 F1 = 0.93. SHAP independently recovers SLC1A2, APOE, AQP4 as top features.",
    interpretation:
      "The Astrocyte_2 program is learnable across individuals. SHAP validation, rediscovering NB01 markers through an independent ML path, is the strongest evidence for biological reality.",
    link: { to: "/classifier", label: "Run classifier →" },
  },
  {
    nb: "05",
    title: "Taxonomy Validation",
    finding:
      "Cross-referencing 50,000 cells against the Allen WHB official taxonomy confirms Astrocyte_2 maps to the Astrocyte supercluster.",
    keyResult:
      '40% of Astrocyte_2 maps to WHB "Astrocyte" supercluster. Subcluster: Astro_52_3085. Taxonomy-independent validation of manual annotation.',
    interpretation:
      "Astrocyte_2 is not an annotation artifact, it corresponds to a real population recognized by the Allen Institute reference taxonomy.",
    link: { to: "/atlas", label: "Explore in Atlas →" },
  },
  {
    nb: "06",
    title: "Disease Comparison (SEA-AD)",
    finding:
      "The neuroprotective program is progressively lost as AD pathology accumulates across 84 SEA-AD donors.",
    keyResult: "comparison_table",
    interpretation:
      "Four converging metrics confirm program loss in disease. APOE4 carriers show additional depletion, connecting the top Astrocyte_2 marker to genetic risk.",
    link: { to: "/disease", label: "View disease panel →" },
  },
  {
    nb: "07",
    title: "Ligand-Receptor Communication",
    finding:
      "Astrocyte_2 communicates with cortical and hippocampal neurons through a synaptogenic program distinct from canonical Astrocyte.",
    keyResult:
      "14 Astrocyte_2-unique LR pairs (EFNA5→EPHA6, APOE→SORL1, VEGFA→GRIN2B) vs 5 canonical Astrocyte-unique pairs (C3→GRM7, TNFSF10→TNFRSF10B). Only 1 shared interaction.",
    interpretation:
      "Astrocyte_2 signals through synapse refinement and lipid transport; canonical Astrocyte signals through complement-mediated inflammation. The near-complete separation of communication profiles provides functional mechanistic evidence for the Astrocyte_2 program.",
    link: { to: "/lr", label: "Open L-R Explorer →" },
  },
];

export const NB06_COMPARISONS = [
  { comparison: "Normal vs Dementia", direction: "↓ dementia", p: "3.96×10⁻¹⁷⁷", effect: "r = −0.126" },
  { comparison: "ADNC High vs Not AD", direction: "↓ High ADNC", p: "Kruskal p < 0.001", effect: "-" },
  { comparison: "APOE4 carrier vs non", direction: "↓ carrier", p: "8.22×10⁻⁴⁷", effect: "-" },
  { comparison: "CPS correlation", direction: "↓ progression", p: "4.94×10⁻²⁸⁸", effect: "r = −0.139" },
];

export const METHODS_TABLE = [
  { step: "Clustering", method: "Leiden", tool: "Scanpy", param: "resolution=0.5" },
  { step: "Batch correction", method: "scVI", tool: "scvi-tools", param: "n_latent=20, batch_key=library_label" },
  { step: "Classification", method: "MLP", tool: "scikit-learn", param: "hidden=(64,32), donor-aware split" },
  { step: "Interpretability", method: "SHAP", tool: "shap", param: "KernelExplainer, 500 background" },
  { step: "LR analysis", method: "LIANA rank aggregate", tool: "liana 1.7.3", param: "resource=consensus, expr_prop=0.1" },
  { step: "Disease validation", method: "Mann-Whitney U", tool: "scipy", param: "SEA-AD MTG, 84 donors" },
];
