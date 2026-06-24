import { useState } from "react";
import { uploadScore } from "../api/client";
import UploadPanel from "../components/UploadPanel";
import ViolinPlot from "../components/ViolinPlot";

export default function Score() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleUpload(file) {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadScore(file, "cell_id", "cell_type");
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail ?? err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    if (!result?.scores) return;
    const headers = Object.keys(result.scores[0]);
    const rows = result.scores.map((r) => headers.map((h) => r[h]).join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ad_support_scores.csv";
    a.click();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">AD Support Score Calculator</h2>
        <p className="text-slate-400">
          6-gene panel: APOE, CLU, CST3, AQP4, SLC1A2, SPARCL1 (NB02/03).
        </p>
      </div>

      <UploadPanel onUpload={handleUpload} loading={loading} />

      {loading && <p className="text-blue-400">Computing scores…</p>}
      {error && <div className="card text-red-400">{error}</div>}

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Cells", result.summary.n_cells],
              ["Mean score", result.summary.mean?.toFixed(3)],
              ["Median", result.summary.median?.toFixed(3)],
              ["Q4 fraction", result.summary.q4_fraction?.toFixed(3)],
            ].map(([label, val]) => (
              <div key={label} className="card text-center">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-xl font-bold text-white">{val}</p>
              </div>
            ))}
          </div>

          {result.genes_missing?.length > 0 && (
            <div className="card border-amber-500/40 text-amber-200 text-sm">
              Missing genes (proceeding with available): {result.genes_missing.join(", ")}
            </div>
          )}

          <ViolinPlot violinData={result.violin_data} />

          {result.quartile_table && Object.keys(result.quartile_table).length > 0 && (
            <div className="card overflow-x-auto">
              <h3 className="mb-3 text-sm font-medium text-slate-300">Quartile enrichment by cell type</h3>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-slate-400">
                    <th className="py-2">Cell type</th>
                    {Object.keys(Object.values(result.quartile_table)[0] ?? {}).map((q) => (
                      <th key={q} className="py-2">{q}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.quartile_table).map(([ct, qs]) => (
                    <tr key={ct} className="border-t border-slate-700">
                      <td className="py-2 text-white">{ct}</td>
                      {Object.values(qs).map((v, i) => (
                        <td key={i} className="py-2 text-slate-300">{(v * 100).toFixed(1)}%</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button type="button" className="btn-primary" onClick={downloadCSV}>
            Download scored CSV
          </button>
        </>
      )}
    </div>
  );
}
