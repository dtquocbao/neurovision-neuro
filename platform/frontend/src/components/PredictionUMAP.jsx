import Plot from "react-plotly.js";

const PALETTE = {
  Astrocyte_2: "#3b82f6",
  Astrocyte: "#22c55e",
  Other: "#94a3b8",
};

export default function PredictionUMAP({ umapCoords, height = 480 }) {
  if (!umapCoords?.length) {
    return <div className="card text-slate-400">No UMAP coordinates.</div>;
  }

  const classes = [...new Set(umapCoords.map((c) => c.predicted_class))];
  const traces = classes.map((cls) => {
    const subset = umapCoords.filter((c) => c.predicted_class === cls);
    return {
      type: "scattergl",
      mode: "markers",
      name: cls,
      x: subset.map((c) => c.x),
      y: subset.map((c) => c.y),
      marker: { size: 5, color: PALETTE[cls] ?? "#a855f7", opacity: 0.75 },
      text: subset.map((c) => `${c.predicted_class}<br>${c.cell_id}`),
      hoverinfo: "text",
    };
  });

  return (
    <Plot
      data={traces}
      layout={{
        title: { text: "Latent-space UMAP (colored by prediction)", font: { color: "#cbd5e1", size: 14 } },
        paper_bgcolor: "transparent",
        plot_bgcolor: "#0f172a",
        font: { color: "#cbd5e1" },
        height,
        margin: { l: 40, r: 20, t: 40, b: 40 },
        xaxis: { title: "UMAP1", gridcolor: "#334155" },
        yaxis: { title: "UMAP2", gridcolor: "#334155" },
        legend: { orientation: "h", y: -0.12 },
      }}
      config={{ displayModeBar: true, responsive: true }}
      className="w-full"
    />
  );
}
