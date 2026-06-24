import { useState } from "react";
import { uploadClassify } from "../api/client";
import UploadPanel from "../components/UploadPanel";
import PredictionUMAP from "../components/PredictionUMAP";
import { ConfidenceHistogram } from "../components/DiseaseCharts";

export default function Classifier() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleUpload(file) {
    setLoading(true);
    setError(null);
    try {
      const data = await uploadClassify(file, "cell_id", "cell_type");
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail ?? err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    if (!result?.predictions) return;
    const headers = Object.keys(result.predictions[0]);
    const rows = result.predictions.map((r) => headers.map((h) => r[h]).join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cell_state_predictions.csv";
    a.click();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Cell State Predictor</h2>
        <p className="text-slate-400">
          scVI latent embedding → MLP classifier (NB04, AUROC 0.999). Predicts Astrocyte_2 / Astrocyte / Other.
        </p>
      </div>

      <UploadPanel
        onUpload={handleUpload}
        loading={loading}
        hint="CSV or h5ad with gene expression. Requires NB04 models in platform/backend/models/."
      />

      {loading && <p className="text-blue-400">Running scVI + MLP inference… (may take up to 30s)</p>}
      {error && <div className="card text-red-400">{typeof error === "string" ? error : JSON.stringify(error)}</div>}

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="card text-center">
              <p className="text-xs text-slate-400">Cells classified</p>
              <p className="text-xl font-bold text-white">{result.n_cells}</p>
            </div>
            {Object.entries(result.class_distribution ?? {}).map(([cls, frac]) => (
              <div key={cls} className="card text-center">
                <p className="text-xs text-slate-400">{cls}</p>
                <p className="text-xl font-bold text-blue-400">{(frac * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>

          <ConfidenceHistogram histogram={result.confidence_histogram} />
          <PredictionUMAP umapCoords={result.umap_coords} />

          <div className="card overflow-x-auto max-h-64 overflow-y-auto">
            <h3 className="mb-3 text-sm font-medium text-slate-300">Predictions (first 100 rows)</h3>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-slate-400">
                  <th className="py-2">Cell ID</th>
                  <th className="py-2">Class</th>
                  <th className="py-2">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {result.predictions.slice(0, 100).map((r) => (
                  <tr key={r.cell_id} className="border-t border-slate-700">
                    <td className="py-1 text-slate-300 font-mono text-xs">{r.cell_id}</td>
                    <td className="py-1 text-white">{r.predicted_class}</td>
                    <td className="py-1 text-blue-300">{r.confidence.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="btn-primary" onClick={downloadCSV}>
            Download predictions CSV
          </button>
        </>
      )}
    </div>
  );
}
