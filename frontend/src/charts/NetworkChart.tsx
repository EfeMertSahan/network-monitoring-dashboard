import {
  CartesianGrid,
  Line,
  LineChart,
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

interface NetworkChartProps {
  metrics: MetricsResponse[];
}

function NetworkChart({
  metrics,
}: NetworkChartProps) {
  const chartData = metrics
    .filter(
      (metric) =>
        metric.latency_ms !== null ||
        metric.packet_loss !== null,
    )
    .map((metric) => ({
      timestamp: metric.timestamp,
      latency: metric.latency_ms,
      packetLoss: metric.packet_loss,
    }));

  return (
    <MetricPanel
      title="Network Health"
      subtitle="Latency ve packet loss zaman serisi"
    >
      <div className="h-[340px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart data={chartData}>
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
              yAxisId="latency"
              stroke="#a78bfa"
              tick={{ fontSize: 11 }}
              label={{
                value: "ms",
                angle: -90,
                position: "insideLeft",
                fill: "#a78bfa",
              }}
            />

            <YAxis
              yAxisId="loss"
              orientation="right"
              stroke="#fb7185"
              tick={{ fontSize: 11 }}
              label={{
                value: "%",
                angle: 90,
                position: "insideRight",
                fill: "#fb7185",
              }}
            />

            <Tooltip
              labelFormatter={formatChartDateTime}
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "10px",
              }}
            />

            <Line
              yAxisId="latency"
              type="monotone"
              dataKey="latency"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={false}
              name="Latency"
              connectNulls
            />

            <Line
              yAxisId="loss"
              type="monotone"
              dataKey="packetLoss"
              stroke="#fb7185"
              strokeWidth={2}
              dot={false}
              name="Packet Loss"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </MetricPanel>
  );
}

export default NetworkChart;