import { useEffect, useState } from "react";
import { fetchDiseaseReference, uploadDiseaseCompare } from "../api/client";
import UploadPanel from "../components/UploadPanel";
import ViolinPlot from "../components/ViolinPlot";
import { ADNCHeatmap, CPSScatter, GradientChart } from "../components/DiseaseCharts";

export default function Disease() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reference, setReference] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiseaseReference().then(setReference).catch(() => {});
  }, []);

  async function handleUpload(file) {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadDiseaseCompare(file);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail ?? err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const ref = result?.reference ?? reference;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Disease Comparison Dashboard</h2>
        <p className="text-slate-400">
          Stratify AD support score by disease metadata (NB06). Upload CSV/h5ad with score column or expression to compute score.
        </p>
      </div>

      {ref && (
        <div className="card border-amber-500/30 text-sm text-slate-300">
          <strong className="text-amber-200">SEA-AD reference (NB06):</strong>{" "}
          normal median {ref.disease_summary?.normal?.median?.toFixed(3)} vs dementia{" "}
          {ref.disease_summary?.dementia?.median?.toFixed(3)} (67k astrocytes, 84 donors)
        </div>
      )}

      <UploadPanel
        onUpload={handleUpload}
        loading={loading}
        hint="Include metadata: disease, Braak stage, ADNC, APOE4 status, CPS. Or provide expression to auto-compute AD score."
      />

      {loading && <p className="text-blue-400">Analyzing disease stratification…</p>}
      {error && <div className="card text-red-400">{typeof error === "string" ? error : JSON.stringify(error)}</div>}

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card text-center">
              <p className="text-xs text-slate-400">Cells analyzed</p>
              <p className="text-xl font-bold text-white">{result.n_cells}</p>
            </div>
            {result.columns_used?.map((c) => (
              <div key={c} className="card text-center">
                <p className="text-xs text-slate-400">Column used</p>
                <p className="text-sm font-medium text-green-400">{c}</p>
              </div>
            ))}
          </div>

          {result.columns_missing?.length > 0 && (
            <div className="card border-amber-500/40 text-amber-200 text-sm">
              Missing columns (skipped): {result.columns_missing.join(", ")}
            </div>
          )}

          {result.disease_violin && (
            <>
              <ViolinPlot violinData={result.disease_violin} />
              {result.disease_summary && (
                <div className="card overflow-x-auto">
                  <h3 className="mb-3 text-sm font-medium text-slate-300">Disease summary vs SEA-AD reference</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-slate-400">
                        <th className="py-2 text-left">Group</th>
                        <th className="py-2">Your median</th>
                        <th className="py-2">SEA-AD ref</th>
                        <th className="py-2">n</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(result.disease_summary).map(([grp, stats]) => (
                        <tr key={grp} className="border-t border-slate-700">
                          <td className="py-2 text-white">{grp}</td>
                          <td className="py-2 text-blue-300">{stats.median.toFixed(3)}</td>
                          <td className="py-2 text-amber-300">
                            {ref?.disease_summary?.[grp]?.median?.toFixed(3) ?? "—"}
                          </td>
                          <td className="py-2 text-slate-400">{stats.n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {result.braak_gradient && (
            <GradientChart
              data={result.braak_gradient}
              title="Braak stage gradient"
              reference={ref?.braak_medians}
            />
          )}

          {result.adnc_stats && (
            <ADNCHeatmap adncStats={result.adnc_stats} reference={ref?.adnc_medians} />
          )}

          {result.apoe4_violin && <ViolinPlot violinData={result.apoe4_violin} />}

          {result.cps_scatter && (
            <CPSScatter
              points={result.cps_scatter}
              correlation={result.cps_correlation}
              referenceMedian={ref?.disease_summary?.dementia?.median}
            />
          )}
        </>
      )}
    </div>
  );
}
