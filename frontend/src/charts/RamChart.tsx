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

interface RamChartProps {
  metrics: MetricsResponse[];
}

function RamChart({
  metrics,
}: RamChartProps) {
  const chartData = metrics
    .filter(
      (metric) => metric.ram_usage !== null,
    )
    .map((metric) => ({
      timestamp: metric.timestamp,
      value: metric.ram_usage,
    }));

  return (
    <MetricPanel
      title="RAM Usage"
      subtitle="Bellek kullanım yüzdesi"
    >
      <div className="h-[340px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="ramGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#34d399"
                  stopOpacity={0.4}
                />

                <stop
                  offset="100%"
                  stopColor="#34d399"
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
                "RAM",
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
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#ramGradient)"
              name="RAM"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </MetricPanel>
  );
}

export default RamChart;