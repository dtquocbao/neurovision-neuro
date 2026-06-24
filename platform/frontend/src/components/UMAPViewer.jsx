import Plot from "react-plotly.js";

const PALETTE = [
  "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

const HIGHLIGHT_COLOR = "#f59e0b";

export default function UMAPViewer({
  cells,
  colorBy = "cell_type",
  height = 520,
  highlightCellType = null,
  colorscale = "Viridis",
}) {
  if (!cells?.length) {
    return <div className="card text-slate-400">No cells to display.</div>;
  }

  const colorValues = cells.map((c) => c[colorBy] ?? "NA");
  const isNumeric = colorBy === "AD_support_score";
  const categories = [...new Set(colorValues.map(String))];
  const colorMap = Object.fromEntries(
    categories.map((cat, i) => [
      cat,
      cat === highlightCellType ? HIGHLIGHT_COLOR : PALETTE[i % PALETTE.length],
    ])
  );

  const traces = isNumeric
    ? [
        {
          type: "scattergl",
          mode: "markers",
          x: cells.map((c) => c.UMAP1),
          y: cells.map((c) => c.UMAP2),
          marker: {
            size: highlightCellType
              ? cells.map((c) => (c.cell_type === highlightCellType ? 6 : 3))
              : 4,
            color: cells.map((c) => c.AD_support_score),
            colorscale,
            opacity: highlightCellType
              ? cells.map((c) => (c.cell_type === highlightCellType ? 0.9 : 0.25))
              : 0.7,
            colorbar: { title: "AD score" },
          },
          text: cells.map(
            (c) =>
              `${c.cell_type}<br>${c.anatomical_division_label ?? ""}<br>score: ${c.AD_support_score?.toFixed(2)}`
          ),
          hoverinfo: "text",
        },
      ]
    : categories.map((cat) => {
        const subset = cells.filter((c) => String(c[colorBy]) === cat);
        const isHighlight = highlightCellType && cat === highlightCellType;
        const dimmed = highlightCellType && cat !== highlightCellType;
        return {
          type: "scattergl",
          mode: "markers",
          name: cat,
          x: subset.map((c) => c.UMAP1),
          y: subset.map((c) => c.UMAP2),
          marker: {
            size: isHighlight ? 7 : dimmed ? 3 : 4,
            color: colorMap[cat],
            opacity: dimmed ? 0.25 : 0.75,
          },
          text: subset.map(
            (c) =>
              `${c.cell_type}<br>${c.anatomical_division_label ?? ""}<br>score: ${c.AD_support_score?.toFixed(2)}`
          ),
          hoverinfo: "text",
        };
      });

  return (
    <Plot
      data={traces}
      layout={{
        paper_bgcolor: "transparent",
        plot_bgcolor: "#0f172a",
        font: { color: "#cbd5e1" },
        height,
        margin: { l: 40, r: 20, t: 30, b: 40 },
        xaxis: { title: "UMAP1", gridcolor: "#334155" },
        yaxis: { title: "UMAP2", gridcolor: "#334155" },
        legend: isNumeric ? undefined : { orientation: "h", y: -0.15 },
        showlegend: !isNumeric,
      }}
      config={{ displayModeBar: true, responsive: true }}
      className="w-full"
    />
  );
}
