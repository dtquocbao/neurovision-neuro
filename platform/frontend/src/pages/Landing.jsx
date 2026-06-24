import { Link } from "react-router-dom";
import { Activity, Upload, GitBranch, ArrowRight, Layers, Heart } from "lucide-react";

const stats = [
  { label: "Nuclei (WHB)", value: "888k" },
  { label: "Donors", value: "368" },
  { label: "Notebooks", value: "7" },
  { label: "Classifier AUROC", value: "0.999" },
];

const tools = [
  {
    to: "/atlas",
    icon: Activity,
    title: "Atlas Browser",
    desc: "Interactive UMAP of 50k WHB nuclei - color by cell type, AD score, or region.",
  },
  {
    to: "/score",
    icon: Upload,
    title: "AD Support Score",
    desc: "Upload expression data and compute the 6-gene AD-associated astrocyte score.",
  },
  {
    to: "/classifier",
    icon: Layers,
    title: "Cell State Classifier",
    desc: "scVI + MLP predicts Astrocyte_2 / Astrocyte / Other (NB04, AUROC 0.999).",
  },
  {
    to: "/disease",
    icon: Heart,
    title: "Disease Comparison",
    desc: "Stratify AD score by Braak, ADNC, APOE4 with SEA-AD reference overlay (NB06).",
  },
  {
    to: "/lr",
    icon: GitBranch,
    title: "L-R Explorer",
    desc: "Browse Astrocyte_2 ligand-receptor pairs from LIANA (EFNA5→EPHA6, APOE→SORL1).",
  },
];

export default function Landing() {
  return (
    <div className="space-y-10">
      <section className="card border-blue-500/30 bg-gradient-to-br from-neuro-card to-slate-900">
        <p className="text-sm uppercase tracking-widest text-blue-400">RESEARCH PLATFORM</p>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl">
          A Computational Atlas of AD-Associated Astrocyte States
        </h2>
        <p className="mt-4 max-w-2xl text-slate-300 leading-relaxed">
          From Allen WHB single-cell discovery (NB01) through SEA-AD disease validation (NB06)
          and astrocyte, neuron ligand-receptor analysis (NB07), this platform wraps seven
          research notebooks into an interactive web application for scoring, browsing, and
          exploring neuroprotective astrocyte biology.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg bg-slate-900/60 p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map(({ to, icon: Icon, title, desc }) => (
          <Link
            key={to}
            to={to}
            className="card group transition hover:border-blue-500/50 hover:bg-slate-900/40"
          >
            <Icon className="text-blue-400" size={28} />
            <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-400">{desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-blue-400 group-hover:gap-2 transition-all">
              Open <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
