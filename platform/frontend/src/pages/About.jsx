const findings = [
  { nb: "NB01", finding: "Astrocyte_2 discovered; 51% cortex, 28% hippocampus" },
  { nb: "NB02", finding: "96% Q4 neuroprotective score vs 13% canonical Astrocyte" },
  { nb: "NB03", finding: "AD score regional gradient across 368 donors" },
  { nb: "NB04", finding: "scVI + MLP AUROC 0.999; SHAP → SLC1A2, APOE" },
  { nb: "NB05", finding: "Allen Astrocyte supercluster confirms Astrocyte_2 identity" },
  { nb: "NB06", finding: "AD score ↓ in dementia (p=3.96e-177); APOE4 carriers depleted" },
  { nb: "NB07", finding: "EFNA5→EPHA6, APOE→SORL1 top LR pairs; 14 vs 5 unique" },
];

export default function About() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white">Project Story</h2>
        <p className="mt-3 text-slate-300 leading-relaxed">
          This project began as a portfolio for PhD applications to BCM, Rice University,
          and UTHealth, targeting neuroscience and cancer research programs. The goal was
          to demonstrate that software engineering experience (SaaS, full-stack development)
          could be combined with rigorous bioinformatics and ML to produce scientifically
          credible research.
        </p>
        <p className="mt-4 text-slate-300 leading-relaxed">
          The central finding, that a forebrain-enriched astrocyte state with a coherent
          neuroprotective program is progressively lost in Alzheimer's disease, emerged
          from 7 iterative notebooks combining single-cell transcriptomics, donor-aware
          machine learning, taxonomy validation, disease cohort comparison, and
          ligand-receptor communication analysis.
        </p>
        <p className="mt-4 text-slate-300 leading-relaxed">
          The platform you are using is the interactive wrapper around those findings.
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
          <li>Wolf FA, et al. SCANPY. <em>Genome Biology</em> 2018.</li>
          <li>Lopez R, et al. Deep generative modeling for single-cell transcriptomics. <em>Nature Methods</em> 2018.</li>
        </ul>
      </div>
    </div>
  );
}
