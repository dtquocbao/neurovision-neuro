import { useEffect, useMemo, useState } from "react";
import { fetchLRInteractions } from "../api/client";
import {
  LR_SUMMARY,
  getLrAnnotation,
  classifyLrPair,
} from "../data/scientificContent";

const UNIQUENESS_LABELS = {
  all: "All interactions",
  astro2_unique: "Astrocyte_2-unique (14)",
  astro_unique: "Canonical Astrocyte-unique (5)",
  shared: "Shared (1)",
};

const UNIQUENESS_BADGE = {
  astro2_unique: "bg-blue-600/20 text-blue-300",
  astro_unique: "bg-red-600/20 text-red-300",
  shared: "bg-amber-600/20 text-amber-300",
  other: "bg-slate-700 text-slate-400",
};

export default function LR() {
  const [data, setData] = useState(null);
  const [source, setSource] = useState("Astrocyte_2");
  const [target, setTarget] = useState("");
  const [ligand, setLigand] = useState("");
  const [astro2Only, setAstro2Only] = useState(false);
  const [uniqueness, setUniqueness] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLRInteractions({
      source: source || undefined,
      target: target || undefined,
      ligand: ligand || undefined,
      astrocyte_2_only: astro2Only,
      top_n: 100,
    })
      .then(setData)
      .finally(() => setLoading(false));
  }, [source, target, ligand, astro2Only]);

  const filtered = useMemo(() => {
    const rows = data?.interactions ?? [];
    if (uniqueness === "all") return rows;
    return rows.filter(
      (row) => classifyLrPair(row.ligand_complex, row.receptor_complex) === uniqueness
    );
  }, [data, uniqueness]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Ligand-Receptor Explorer</h2>
        <p className="text-slate-400">
          Astrocyte_2 communicates through synaptogenic and lipid-transport axes distinct from
          canonical Astrocyte complement signaling (NB07).
        </p>
      </div>

      <div className="card grid gap-3 text-sm text-slate-300 md:grid-cols-2 lg:grid-cols-3">
        <p><span className="text-blue-400">Astrocyte_2 → Neuron:</span> {LR_SUMMARY.astro2ToNeuron} interactions</p>
        <p><span className="text-blue-400">Neuron → Astrocyte_2:</span> {LR_SUMMARY.neuronToAstro2} interactions</p>
        <p><span className="text-green-400">Astrocyte_2-unique:</span> {LR_SUMMARY.astro2Unique} (synaptogenic/neuroprotective)</p>
        <p><span className="text-red-400">Canonical Astrocyte-unique:</span> {LR_SUMMARY.astroUnique} (complement/inflammatory)</p>
        <p><span className="text-amber-400">Shared:</span> {LR_SUMMARY.shared}</p>
        <p><span className="text-white">Top interaction:</span> {LR_SUMMARY.topPair} (magnitude_rank {LR_SUMMARY.topRank})</p>
      </div>

      <div className="card grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
        <div>
          <label className="text-xs text-slate-400">Astrocyte_2 vs Astrocyte</label>
          <select className="input mt-1 w-full" value={uniqueness} onChange={(e) => setUniqueness(e.target.value)}>
            {Object.entries(UNIQUENESS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={astro2Only}
              onChange={(e) => setAstro2Only(e.target.checked)}
            />
            Involving Astrocyte_2
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
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">Target</th>
                <th className="py-2 pr-3">Ligand → Receptor</th>
                <th className="py-2 pr-3">Class</th>
                <th className="py-2 pr-3">Biology</th>
                <th className="py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const cls = classifyLrPair(row.ligand_complex, row.receptor_complex);
                const note = getLrAnnotation(row.ligand_complex, row.receptor_complex);
                return (
                  <tr key={i} className="border-t border-slate-700/80">
                    <td className="py-2 pr-3 text-white">{row.source}</td>
                    <td className="py-2 pr-3 text-slate-300">{row.target}</td>
                    <td className="py-2 pr-3">
                      <span className="text-blue-300">{row.ligand_complex}</span>
                      <span className="text-slate-500"> → </span>
                      <span className="text-green-300">{row.receptor_complex}</span>
                    </td>
                    <td className="py-2 pr-3">
                      {cls !== "other" && (
                        <span className={`rounded px-1.5 py-0.5 text-xs ${UNIQUENESS_BADGE[cls]}`}>
                          {cls.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td className="max-w-xs py-2 pr-3 text-xs text-slate-400">{note || "-"}</td>
                    <td className="py-2 text-slate-300">
                      {row.lr_means?.toFixed(3) ?? row.magnitude_rank}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">{filtered.length} interactions shown</p>
        </div>
      )}
    </div>
  );
}
