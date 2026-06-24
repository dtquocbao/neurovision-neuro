import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, ScatterChart, Scatter, ReferenceLine,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];

export function GradientChart({ data, title, yLabel = "Median AD score", reference }) {
  if (!data?.length) return null;

  const chartData = data.map((d) => ({
    label: d.label,
    median: d.median,
    ref: reference?.[d.label],
  }));

  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-medium text-slate-300">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#334155" />
          <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fill: "#94a3b8" }} label={{ value: yLabel, angle: -90, position: "insideLeft", fill: "#94a3b8" }} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569" }} />
          <Line type="monotone" dataKey="median" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Your data" />
          {reference && (
            <Line type="monotone" dataKey="ref" stroke="#f59e0b" strokeDasharray="4 4" dot={{ r: 3 }} name="SEA-AD ref" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ADNCHeatmap({ adncStats, reference }) {
  if (!adncStats?.length) return null;

  const chartData = adncStats.map((d) => ({
    label: d.label,
    median: d.median,
    ref: reference?.[d.label],
  }));

  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-medium text-slate-300">ADNC stratification (median AD score)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <XAxis dataKey="label" tick={{ fill: "#94a3b8" }} />
          <YAxis tick={{ fill: "#94a3b8" }} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569" }} />
          <Bar dataKey="median" name="Your data" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
          {reference && (
            <Bar dataKey="ref" name="SEA-AD ref" fill="#f59e0b" opacity={0.5} radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CPSScatter({ points, correlation, referenceMedian }) {
  if (!points?.length) return null;

  return (
    <div className="card">
      <h3 className="mb-1 text-sm font-medium text-slate-300">
        Continuous Pseudo-progression Score vs AD score
      </h3>
      {correlation != null && (
        <p className="mb-3 text-xs text-slate-400">Pearson r = {correlation.toFixed(3)}</p>
      )}
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart>
          <CartesianGrid stroke="#334155" />
          <XAxis type="number" dataKey="cps" name="CPS" tick={{ fill: "#94a3b8" }} />
          <YAxis type="number" dataKey="score" name="AD score" tick={{ fill: "#94a3b8" }} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569" }} />
          {referenceMedian != null && (
            <ReferenceLine y={referenceMedian} stroke="#f59e0b" strokeDasharray="4 4" label="SEA-AD dementia median" />
          )}
          <Scatter data={points} fill="#3b82f6" opacity={0.5} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConfidenceHistogram({ histogram }) {
  if (!histogram) return null;
  const chartData = Object.entries(histogram).map(([bin, count]) => ({ bin, count }));

  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-medium text-slate-300">Prediction confidence</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData}>
          <XAxis dataKey="bin" tick={{ fill: "#94a3b8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#94a3b8" }} />
          <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #475569" }} />
          <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
