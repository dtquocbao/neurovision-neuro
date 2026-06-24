import { Link } from "react-router-dom";
import {
  NOTEBOOK_FINDINGS,
  NB06_COMPARISONS,
  METHODS_TABLE,
} from "../data/scientificContent";

export default function Findings() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-white">Key Findings</h2>
        <p className="mt-2 text-slate-400">
          Full scientific results from NB01–NB07. A committee member or PI can read this page
          without running any notebooks.
        </p>
      </div>

      {NOTEBOOK_FINDINGS.map((section) => (
        <article key={section.nb} className="card">
          <span className="inline-block rounded bg-blue-600/20 px-2 py-0.5 text-xs font-mono text-blue-300">
            NB{section.nb}
          </span>
          <h3 className="mt-2 text-xl font-semibold text-white">{section.title}</h3>

          <p className="mt-3 text-slate-200 leading-relaxed">{section.finding}</p>

          <div className="mt-4 rounded-lg bg-slate-900/60 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Key result</p>
            {section.keyResult === "comparison_table" ? (
              <table className="mt-2 w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="py-1 pr-2">Comparison</th>
                    <th className="py-1 pr-2">Direction</th>
                    <th className="py-1 pr-2">p-value</th>
                    <th className="py-1">Effect</th>
                  </tr>
                </thead>
                <tbody>
                  {NB06_COMPARISONS.map((row) => (
                    <tr key={row.comparison} className="border-t border-slate-700">
                      <td className="py-2 text-slate-300">{row.comparison}</td>
                      <td className="py-2 text-amber-300">{row.direction}</td>
                      <td className="py-2 font-mono text-xs text-slate-400">{row.p}</td>
                      <td className="py-2 text-slate-400">{row.effect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-1 text-sm text-slate-300 leading-relaxed">{section.keyResult}</p>
            )}
          </div>

          <p className="mt-4 text-sm italic text-slate-400 leading-relaxed">
            {section.interpretation}
          </p>

          <Link
            to={section.link.to}
            className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300"
          >
            {section.link.label}
          </Link>
        </article>
      ))}

      <section className="card">
        <h3 className="mb-4 text-lg font-semibold text-white">Methods summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-2 pr-3">Step</th>
                <th className="py-2 pr-3">Method</th>
                <th className="py-2 pr-3">Tool</th>
                <th className="py-2">Key parameter</th>
              </tr>
            </thead>
            <tbody>
              {METHODS_TABLE.map((row) => (
                <tr key={row.step} className="border-t border-slate-700">
                  <td className="py-2 text-white">{row.step}</td>
                  <td className="py-2 text-slate-300">{row.method}</td>
                  <td className="py-2 text-blue-300">{row.tool}</td>
                  <td className="py-2 font-mono text-xs text-slate-400">{row.param}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h3 className="mb-3 text-lg font-semibold text-white">References</h3>
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-400">
          <li>Siletti K et al. Transcriptomic diversity of cell types across the adult human brain. <em>Nature</em>. 2023.</li>
          <li>Gabitto MI et al. Integrated multimodal cell atlas of Alzheimer's disease. <em>Nature Neuroscience</em>. 2024.</li>
          <li>Wolf FA et al. SCANPY. <em>Genome Biology</em>. 2018.</li>
          <li>Lopez R et al. Deep generative modeling for single-cell transcriptomics. <em>Nature Methods</em>. 2018.</li>
        </ul>
      </section>
    </div>
  );
}
