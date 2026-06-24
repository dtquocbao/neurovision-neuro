import { useEffect, useState } from "react";
import { fetchDiseaseReference, uploadDiseaseCompare } from "../api/client";
import UploadPanel from "../components/UploadPanel";
import ViolinPlot from "../components/ViolinPlot";
import { ADNCHeatmap, CPSScatter, GradientChart } from "../components/DiseaseCharts";

function SeaADReferencePanel({ ref }) {
  if (!ref) return null;

  return (
    <section className="card border-amber-500/30 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-amber-200">SEA-AD Reference Cohort (NB06)</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          In the SEA-AD MTG cohort (84 donors, 67,419 astrocytes), the AD-associated
          neuroprotective program is significantly lower in dementia donors and declines
          with increasing neuropathological severity. Upload your own data below to compare
          against this reference.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white">Normal vs Dementia</h4>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-slate-400">
              <th className="py-1 text-left">Group</th>
              <th className="py-1">Median AD score</th>
              <th className="py-1">n</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(ref.disease_summary ?? {}).map(([grp, stats]) => (
              <tr key={grp} className="border-t border-slate-700">
                <td className="py-2 capitalize text-white">{grp}</td>
                <td className="py-2 text-blue-300">{stats.median?.toFixed(3)}</td>
                <td className="py-2 text-slate-400">{stats.n?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {ref.statistics?.normal_vs_dementia && (
          <p className="mt-2 text-xs text-slate-500">
            p = {ref.statistics.normal_vs_dementia.p}, rank-biserial r ={" "}
            {ref.statistics.normal_vs_dementia.rank_biserial}
          </p>
        )}
      </div>

      <div>
        <h4 className="text-sm font-medium text-white">ADNC gradient</h4>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-slate-400">
              <th className="py-1 text-left">ADNC</th>
              <th className="py-1">Median score</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(ref.adnc_medians ?? {}).map(([level, median]) => (
              <tr key={level} className="border-t border-slate-700">
                <td className="py-2 text-white">{level}</td>
                <td className="py-2 text-blue-300">{median.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ref.apoe4 && (
        <div>
          <h4 className="text-sm font-medium text-white">APOE4 effect</h4>
          <p className="mt-2 text-sm text-slate-300">
            Carrier median: <strong className="text-blue-300">{ref.apoe4.carrier_median}</strong>{" "}
            (n={ref.apoe4.carrier_n?.toLocaleString()}) · Non-carrier median:{" "}
            <strong className="text-blue-300">{ref.apoe4.non_carrier_median}</strong>{" "}
            (n={ref.apoe4.non_carrier_n?.toLocaleString()})
          </p>
          <p className="mt-1 text-xs text-slate-500">p = {ref.apoe4.p}</p>
        </div>
      )}

      <p className="text-sm text-slate-400">
        Braak stage: scores decline from Braak 0 → Braak VI (Kruskal-Wallis p &lt; 0.001)
      </p>

      {ref.braak_medians && (
        <GradientChart
          data={Object.entries(ref.braak_medians).map(([label, median]) => ({
            label,
            median,
            mean: median,
            n: 0,
          }))}
          title="SEA-AD Braak stage gradient (reference medians)"
        />
      )}
    </section>
  );
}

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
        <h2 className="text-2xl font-bold text-white">Disease Comparison</h2>
        <p className="text-slate-400">
          The neuroprotective astrocyte program declines with AD pathology (NB06). Compare your
          cohort against the SEA-AD reference below.
        </p>
      </div>

      <SeaADReferencePanel ref={ref} />

      <div>
        <h3 className="mb-3 text-lg font-semibold text-white">Compare your data</h3>
        <UploadPanel
          onUpload={handleUpload}
          loading={loading}
          hint="Include metadata: disease, Braak stage, ADNC, APOE4 status, CPS. Or provide expression to auto-compute AD score."
        />
      </div>

      {loading && <p className="text-blue-400">Analyzing disease stratification…</p>}
      {error && <div className="card text-red-400">{typeof error === "string" ? error : JSON.stringify(error)}</div>}

      {result && (
        <>
          <h3 className="text-lg font-semibold text-white">Your upload vs SEA-AD reference</h3>
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
                            {ref?.disease_summary?.[grp]?.median?.toFixed(3) ?? "-"}
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
              title="Your Braak stage gradient"
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
