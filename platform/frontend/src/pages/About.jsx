const findings = [
  { nb: "NB01", finding: "Astrocyte_2 discovered; 51% cortex, 28% hippocampus" },
  { nb: "NB02", finding: "99.9% Q4 neuroprotective score vs 2.9% canonical Astrocyte" },
  { nb: "NB03", finding: "96% Q4 AD score; regional gradient across 368 donors" },
  { nb: "NB04", finding: "scVI + MLP AUROC 0.999; SHAP → SLC1A2, CST3" },
  { nb: "NB05", finding: "Allen Astrocyte supercluster confirms Astrocyte_2 identity" },
  { nb: "NB06", finding: "AD score ↓ in dementia; APOE4 carriers depleted" },
  { nb: "NB07", finding: "EFNA5→EPHA6, APOE→SORL1 top LR pairs" },
];

export default function About() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Project Story</h2>
        <p className="mt-3 text-slate-300 leading-relaxed">
          NeuroVision Neuro wraps seven Jupyter notebooks analyzing the Allen Whole Human Brain
          atlas and SEA-AD disease cohort into an interactive research platform. The central
          discovery is <strong className="text-blue-300">Astrocyte_2</strong> a forebrain-enriched
          astrocyte state with elevated synaptic-support and AD-associated gene expression that
          declines in Alzheimer's disease.
        </p>
      </div>

      <div className="card">
        <h3 className="mb-4 font-semibold text-white">Notebook findings</h3>
        <table className="w-full text-sm">
          <tbody>
            {findings.map(({ nb, finding }) => (
              <tr key={nb} className="border-t border-slate-700 first:border-0">
                <td className="py-2 pr-4 font-mono text-blue-400">{nb}</td>
                <td className="py-2 text-slate-300">{finding}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 className="mb-2 font-semibold text-white">References</h3>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-400">
          <li>Siletti K, et al. Transcriptomic diversity of cell types across the adult human brain. <em>Nature</em> 2023.</li>
          <li>Gabitto MI, et al. Integrated multimodal cell atlas of Alzheimer's disease. <em>Nature Neuroscience</em> 2024.</li>
          <li>Dimitrov D, et al. LIANA+ framework. <em>Nature Communications</em> 2022.</li>
        </ul>
      </div>

      <p className="text-sm text-slate-500">
        Source code: neuro-ai-brain-cell-atlas repository · Platform MVP: Atlas, AD Score, L-R Explorer
      </p>
    </div>
  );
}
