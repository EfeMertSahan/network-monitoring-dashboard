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

interface DiskChartProps {
  metrics: MetricsResponse[];
}

function DiskChart({
  metrics,
}: DiskChartProps) {
  const chartData = metrics
    .filter(
      (metric) =>
        metric.disk_used_gb !== null &&
        metric.disk_total_gb !== null &&
        metric.disk_total_gb > 0,
    )
    .map((metric) => ({
      timestamp: metric.timestamp,
      value:
        ((metric.disk_used_gb as number) /
          (metric.disk_total_gb as number)) *
        100,
    }));

  return (
    <MetricPanel
      title="Disk Usage"
      subtitle="Disk kapasitesinin zaman içerisindeki kullanımı"
    >
      <div className="h-[340px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="diskGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#fbbf24"
                  stopOpacity={0.4}
                />

                <stop
                  offset="100%"
                  stopColor="#fbbf24"
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
                `${Number(value).toFixed(2)}%`,
                "Disk",
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
              stroke="#fbbf24"
              strokeWidth={2}
              fill="url(#diskGradient)"
              name="Disk"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </MetricPanel>
  );
}

export default DiskChart;