import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import MetricPanel from "../components/dashboard/MetricPanel";
import type { MetricsResponse } from "../types/metrics";
import {
  formatChartDateTime,
  formatChartTime,
} from "../utils/formatters";

interface CpuChartProps {
  metrics: MetricsResponse[];
}

function CpuChart({
  metrics,
}: CpuChartProps) {
  const chartData = metrics
    .filter(
      (metric) => metric.cpu_usage !== null,
    )
    .map((metric) => ({
      timestamp: metric.timestamp,
      value: metric.cpu_usage,
    }));

  const values = chartData.map(
    (item) => item.value as number,
  );

  const current =
    values.length > 0
      ? values[values.length - 1]
      : null;

  const average =
    values.length > 0
      ? values.reduce(
          (sum, value) => sum + value,
          0,
        ) / values.length
      : null;

  const minimum =
    values.length > 0
      ? Math.min(...values)
      : null;

  const maximum =
    values.length > 0
      ? Math.max(...values)
      : null;

  return (
    <MetricPanel
      title="CPU Usage"
      subtitle="İşlemci kullanımının zaman içerisindeki değişimi"
    >
      <div className="mb-4 grid grid-cols-4 gap-2">
        <Stat label="Current" value={current} suffix="%" />
        <Stat label="Average" value={average} suffix="%" />
        <Stat label="Min" value={minimum} suffix="%" />
        <Stat label="Max" value={maximum} suffix="%" />
      </div>

      <div className="h-72">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="cpuGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#22d3ee"
                  stopOpacity={0.45}
                />

                <stop
                  offset="100%"
                  stopColor="#22d3ee"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#1e293b"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="timestamp"
              tickFormatter={formatChartTime}
              stroke="#64748b"
              tick={{ fontSize: 11 }}
            />

            <YAxis
              domain={[0, 100]}
              stroke="#64748b"
              tick={{ fontSize: 11 }}
            />

            <Tooltip
              labelFormatter={formatChartDateTime}
              formatter={(value) => [
                `${value}%`,
                "CPU",
              ]}
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "10px",
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#22d3ee"
              strokeWidth={2}
              fill="url(#cpuGradient)"
              name="CPU"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </MetricPanel>
  );
}

interface StatProps {
  label: string;
  value: number | null;
  suffix: string;
}

function Stat({
  label,
  value,
  suffix,
}: StatProps) {
  return (
    <div className="rounded-lg bg-slate-950/70 p-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-100">
        {value === null
          ? "-"
          : `${value.toFixed(1)}${suffix}`}
      </p>
    </div>
  );
}

export default CpuChart;