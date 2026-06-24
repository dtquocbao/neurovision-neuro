import { useEffect, useState } from "react";
import { fetchLRInteractions } from "../api/client";

export default function LR() {
  const [data, setData] = useState(null);
  const [source, setSource] = useState("Astrocyte_2");
  const [target, setTarget] = useState("");
  const [ligand, setLigand] = useState("");
  const [astro2Only, setAstro2Only] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLRInteractions({
      source: source || undefined,
      target: target || undefined,
      ligand: ligand || undefined,
      astrocyte_2_only: astro2Only,
      top_n: 50,
    })
      .then(setData)
      .finally(() => setLoading(false));
  }, [source, target, ligand, astro2Only]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Ligand-Receptor Explorer</h2>
        <p className="text-slate-400">
          Precomputed LIANA rank_aggregate from NB07. Top pairs: EFNA5→EPHA6, APOE→SORL1.
        </p>
      </div>

      <div className="card grid gap-4 md:grid-cols-4">
        <div>
          <label className="text-xs text-slate-400">Source</label>
          <select className="input mt-1 w-full" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">All</option>
            {(data?.filters?.sources ?? []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">Target</label>
          <select className="input mt-1 w-full" value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">All</option>
            {(data?.filters?.targets ?? []).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">Ligand contains</label>
          <input
            className="input mt-1 w-full"
            placeholder="e.g. APOE"
            value={ligand}
            onChange={(e) => setLigand(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={astro2Only}
              onChange={(e) => setAstro2Only(e.target.checked)}
            />
            Astrocyte_2 only
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-blue-400">Loading interactions…</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="py-2 pr-4">Source</th>
                <th className="py-2 pr-4">Target</th>
                <th className="py-2 pr-4">Ligand</th>
                <th className="py-2 pr-4">Receptor</th>
                <th className="py-2">LR score</th>
              </tr>
            </thead>
            <tbody>
              {(data?.interactions ?? []).map((row, i) => (
                <tr key={i} className="border-t border-slate-700/80">
                  <td className="py-2 pr-4 text-white">{row.source}</td>
                  <td className="py-2 pr-4 text-slate-300">{row.target}</td>
                  <td className="py-2 pr-4 text-blue-300">{row.ligand_complex}</td>
                  <td className="py-2 pr-4 text-green-300">{row.receptor_complex}</td>
                  <td className="py-2 text-slate-300">
                    {row.lr_means?.toFixed(3) ?? row.magnitude_rank}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">{data?.n_returned ?? 0} interactions shown</p>
        </div>
      )}
    </div>
  );
}
