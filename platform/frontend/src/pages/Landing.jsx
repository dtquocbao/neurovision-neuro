import { Link } from "react-router-dom";
import { Activity, Upload, GitBranch, ArrowRight, Layers, Heart } from "lucide-react";
import { HERO_FINDING, FINDING_CARDS, STATS } from "../data/scientificContent";

const tools = [
  {
    to: "/atlas",
    icon: Activity,
    title: "Atlas Browser",
    desc: "Guided 4-step story through the UMAP, then free exploration.",
  },
  {
    to: "/score",
    icon: Upload,
    title: "AD Support Score",
    desc: "Compute the 6-gene neuroprotective program score on your data.",
  },
  {
    to: "/classifier",
    icon: Layers,
    title: "Cell State Classifier",
    desc: "Donor-aware scVI + MLP predicts Astrocyte_2 (AUROC 0.999).",
  },
  {
    to: "/disease",
    icon: Heart,
    title: "Disease Comparison",
    desc: "Compare against SEA-AD reference: Braak, ADNC, APOE4.",
  },
  {
    to: "/lr",
    icon: GitBranch,
    title: "L-R Explorer",
    desc: "Astrocyte_2 communication axes with biological annotations.",
  },
];

export default function Landing() {
  return (
    <div className="space-y-12">
      <section className="card border-blue-500/30 bg-gradient-to-br from-neuro-card to-slate-900">
        <p className="text-sm uppercase tracking-widest text-blue-400">Central finding</p>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-100 md:text-xl">
          {HERO_FINDING}
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-lg bg-slate-900/60 p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{s.value}</p>
              <p className="text-xs font-medium text-slate-300">{s.label}</p>
              <p className="mt-1 text-xs text-slate-500">{s.context}</p>
            </div>
          ))}
        </div>
        <Link
          to="/findings"
          className="mt-6 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
        >
          Read all 7 notebook findings <ArrowRight size={14} />
        </Link>
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold text-white">Key findings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FINDING_CARDS.map((f) => (
            <div key={f.title} className="card border-slate-600/50">
              <span className="text-xs font-mono text-blue-400">{f.nb}</span>
              <h3 className="mt-1 text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold text-white">Explore the data</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </section>
    </div>
  );
}
