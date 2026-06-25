import { useEffect, useState } from "react";
import { fetchAtlas } from "../api/client";
import UMAPViewer from "../components/UMAPViewer";
import { ATLAS_STORY } from "../data/scientificContent";

export default function Atlas() {
  const [cells, setCells] = useState([]);
  const [meta, setMeta] = useState(null);
  const [storyStep, setStoryStep] = useState(0);
  const [freeExplore, setFreeExplore] = useState(false);
  const [colorBy, setColorBy] = useState("cell_type");
  const [cellType, setCellType] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const activeStory = ATLAS_STORY[storyStep];
  const displayColorBy = freeExplore ? colorBy : activeStory?.colorBy ?? "cell_type";
  const highlight = freeExplore ? null : activeStory?.highlight ?? null;
  const colorscale = freeExplore ? "Viridis" : activeStory?.colorscale ?? "Viridis";

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

  function goToStep(idx) {
    setStoryStep(idx);
    setFreeExplore(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Brain Cell Atlas</h2>
        <p className="text-slate-400">
          Guided story through 50k WHB nuclei (NB01–05), then free exploration.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {!freeExplore && (
          <aside className="card space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-400">
              Guided story
            </h3>
            {ATLAS_STORY.map((step, idx) => (
              <button
                key={step.step}
                type="button"
                onClick={() => goToStep(idx)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  storyStep === idx
                    ? "border-blue-500/60 bg-blue-600/10"
                    : "border-slate-700 hover:border-slate-500"
                }`}
              >
                <p className="text-xs text-slate-500">Step {step.step}</p>
                <p className="text-sm font-medium text-white">{step.title}</p>
              </button>
            ))}
            <p className="text-xs leading-relaxed text-slate-400">{activeStory?.annotation}</p>
            <button
              type="button"
              className="btn-primary w-full text-sm"
              onClick={() => setFreeExplore(true)}
            >
              Free explore →
            </button>
          </aside>
        )}

        <div className="space-y-4">
          {freeExplore && (
            <div className="card flex flex-wrap items-end gap-4">
              <p className="w-full text-sm text-green-400">Free explore mode</p>
              <div className="min-w-[140px] flex-1">
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
              <div className="min-w-[140px] flex-1">
                <label className="text-xs text-slate-400">Cell type filter</label>
                <select className="input mt-1 w-full" value={cellType} onChange={(e) => setCellType(e.target.value)}>
                  <option value="">All</option>
                  {(meta?.cell_types ?? []).map((ct) => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
              <div className="min-w-[140px] flex-1">
                <label className="text-xs text-slate-400">Region filter</label>
                <select className="input mt-1 w-full" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="">All</option>
                  {(meta?.regions ?? []).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                onClick={() => setFreeExplore(false)}
              >
                ← Back to story
              </button>
              <p className="text-sm text-slate-400">
                {loading ? "Loading…" : `${meta?.n_returned ?? 0} / ${meta?.n_total ?? 0} cells`}
              </p>
            </div>
          )}

          {!freeExplore && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white">{activeStory?.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{activeStory?.annotation}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={storyStep === 0}
                  className="rounded-lg border border-slate-600 px-3 py-1 text-sm text-slate-300 disabled:opacity-40"
                  onClick={() => goToStep(storyStep - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={storyStep >= ATLAS_STORY.length - 1}
                  className="rounded-lg border border-slate-600 px-3 py-1 text-sm text-slate-300 disabled:opacity-40"
                  onClick={() => goToStep(storyStep + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="card text-slate-400">Loading atlas data…</div>
          )}
          {error && (
            <div className="card space-y-2 text-red-400">
              <p>{error}</p>
              <p className="text-sm text-slate-500">
                Backend health check:{" "}
                <a
                  href="https://rockydant-neurovision-neuro-api.hf.space/api/health"
                  className="text-blue-400 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  HF Space /api/health
                </a>
              </p>
            </div>
          )}
          {!loading && !error && (
            <div className="card p-2">
              <UMAPViewer
                cells={cells}
                colorBy={displayColorBy}
                highlightCellType={highlight}
                colorscale={colorscale}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
