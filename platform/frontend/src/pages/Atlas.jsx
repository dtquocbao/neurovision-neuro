import { useEffect, useState } from "react";
import { fetchAtlas } from "../api/client";
import UMAPViewer from "../components/UMAPViewer";

export default function Atlas() {
  const [cells, setCells] = useState([]);
  const [meta, setMeta] = useState(null);
  const [colorBy, setColorBy] = useState("cell_type");
  const [cellType, setCellType] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchAtlas({
      limit: 5000,
      ...(cellType && { cell_type: cellType }),
      ...(region && { region }),
    })
      .then((data) => {
        setCells(data.cells);
        setMeta(data.meta);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [cellType, region]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Brain Cell Atlas Browser</h2>
        <p className="text-slate-400">
          Precomputed UMAP from NB01–05 (50k WHB subsample). Showing up to 5,000 cells.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="text-xs text-slate-400">Color by</label>
          <select
            className="input mt-1 w-full"
            value={colorBy}
            onChange={(e) => setColorBy(e.target.value)}
          >
            {(meta?.color_by_options ?? ["cell_type", "AD_support_score"]).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">Cell type filter</label>
          <select className="input mt-1 w-full" value={cellType} onChange={(e) => setCellType(e.target.value)}>
            <option value="">All</option>
            {(meta?.cell_types ?? []).map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-400">Region filter</label>
          <select className="input mt-1 w-full" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">All</option>
            {(meta?.regions ?? []).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <p className="text-sm text-slate-400">
            {loading ? "Loading…" : `${meta?.n_returned ?? 0} / ${meta?.n_total ?? 0} cells`}
          </p>
        </div>
      </div>

      {error && <div className="card text-red-400">{error}</div>}
      {!loading && !error && (
        <div className="card p-2">
          <UMAPViewer cells={cells} colorBy={colorBy} />
        </div>
      )}
    </div>
  );
}
