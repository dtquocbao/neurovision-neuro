import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];

export default function ViolinPlot({ violinData }) {
  if (!violinData || !Object.keys(violinData).length) {
    return <div className="card text-slate-400">No violin data.</div>;
  }

  const chartData = Object.entries(violinData).map(([cellType, values]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = sorted[Math.floor(sorted.length / 2)] ?? 0;
    return { cellType, median: mid, count: values.length };
  });

  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-medium text-slate-300">
        AD Support Score by Cell Type (median)
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData}>
          <XAxis dataKey="cellType" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-25} textAnchor="end" height={70} />
          <YAxis tick={{ fill: "#94a3b8" }} />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid #475569" }}
          />
          <Bar dataKey="median" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
