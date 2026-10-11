import {
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";

import type { MetricsResponse } from "../../types/metrics";

interface LiveMetricsPanelProps {
  metrics: MetricsResponse[];
  totalDevices?: number;
  onlineDevices?: number;
}

interface MetricSummary {
  current: number | null;
  average: number | null;
  minimum: number | null;
  maximum: number | null;
  data: Array<{
    value: number;
  }>;
}

function LiveMetricsPanel({
  metrics,
  totalDevices = 0,
  onlineDevices = 0,
}: LiveMetricsPanelProps) {
  const cpu = getSummary(
    metrics,
    (metric) => metric.cpu_usage,
  );

  const ram = getSummary(
    metrics,
    (metric) => metric.ram_usage,
  );

  const disk = getDiskSummary(metrics);

  const latency = getSummary(
    metrics,
    (metric) => metric.latency_ms,
  );

  const packetLoss = getSummary(
    metrics,
    (metric) => metric.packet_loss,
  );

  const availability =
    totalDevices > 0
      ? (onlineDevices / totalDevices) * 100
      : 0;

  return (
    <section className="mt-6">
      <div className="mb-3">
        <h2 className="text-lg font-semibold">
          Live Metrics
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Seçili cihazın anlık sistem ve network
          göstergeleri
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="CPU Usage"
          value={cpu.current}
          unit="%"
          average={cpu.average}
          minimum={cpu.minimum}
          maximum={cpu.maximum}
          data={cpu.data}
          accent="#22d3ee"
          gauge={cpu.current}
        />

        <MetricCard
          title="RAM Usage"
          value={ram.current}
          unit="%"
          average={ram.average}
          minimum={ram.minimum}
          maximum={ram.maximum}
          data={ram.data}
          accent="#34d399"
          gauge={ram.current}
        />

        <MetricCard
          title="Disk Usage"
          value={disk.current}
          unit="%"
          average={disk.average}
          minimum={disk.minimum}
          maximum={disk.maximum}
          data={disk.data}
          accent="#fbbf24"
          gauge={disk.current}
        />

        <MetricCard
          title="Latency"
          value={latency.current}
          unit=" ms"
          average={latency.average}
          minimum={latency.minimum}
          maximum={latency.maximum}
          data={latency.data}
          accent="#a78bfa"
        />

        <MetricCard
          title="Availability"
          value={availability}
          unit="%"
          average={null}
          minimum={null}
          maximum={null}
          data={[]}
          accent="#10b981"
          gauge={availability}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <NetworkMiniCard
          title="Packet Loss"
          value={packetLoss.current}
          unit="%"
          data={packetLoss.data}
          accent="#fb7185"
        />

        <NetworkMiniCard
          title="Online Devices"
          value={onlineDevices}
          unit={`/ ${totalDevices}`}
          data={[]}
          accent="#34d399"
        />

        <NetworkMiniCard
          title="Monitoring Status"
          value={
            metrics.length > 0
              ? 1
              : 0
          }
          unit={
            metrics.length > 0
              ? " LIVE"
              : " WAITING"
          }
          data={[]}
          accent={
            metrics.length > 0
              ? "#34d399"
              : "#fbbf24"
          }
        />
      </div>
    </section>
  );
}

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  average: number | null;
  minimum: number | null;
  maximum: number | null;
  data: Array<{
    value: number;
  }>;
  accent: string;
  gauge?: number | null;
}

function MetricCard({
  title,
  value,
  unit,
  average,
  minimum,
  maximum,
  data,
  accent,
  gauge,
}: MetricCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>

        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: accent,
            boxShadow: `0 0 10px ${accent}`,
          }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-bold text-slate-100">
            {formatValue(value)}

            <span className="ml-1 text-sm font-medium text-slate-500">
              {unit}
            </span>
          </p>

          {average !== null && (
            <p className="mt-1 text-[11px] text-slate-500">
              Avg {formatValue(average)}
              {unit}
            </p>
          )}
        </div>

        {gauge !== undefined && (
          <Gauge
            value={gauge}
            accent={accent}
          />
        )}
      </div>

      {data.length > 1 && (
        <div className="mt-4 h-12">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={accent}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {minimum !== null &&
        maximum !== null && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 text-[10px] text-slate-500">
            <span>
              Min {formatValue(minimum)}
            </span>

            <span>
              Max {formatValue(maximum)}
            </span>
          </div>
        )}
    </article>
  );
}

interface NetworkMiniCardProps {
  title: string;
  value: number | null;
  unit: string;
  data: Array<{
    value: number;
  }>;
  accent: string;
}

function NetworkMiniCard({
  title,
  value,
  unit,
  data,
  accent,
}: NetworkMiniCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>

        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: accent,
            boxShadow: `0 0 10px ${accent}`,
          }}
        />
      </div>

      <p className="mt-3 text-xl font-bold text-slate-100">
        {formatValue(value)}

        <span className="ml-1 text-sm font-medium text-slate-500">
          {unit}
        </span>
      </p>

      {data.length > 1 && (
        <div className="mt-3 h-10">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={accent}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}

interface GaugeProps {
  value: number | null;
  accent: string;
}

function Gauge({
  value,
  accent,
}: GaugeProps) {
  const normalized = Math.max(
    0,
    Math.min(100, value ?? 0),
  );

  return (
    <div
      className="relative h-14 w-14 shrink-0 rounded-full"
      style={{
        background: `conic-gradient(${accent} ${normalized}%, #1e293b ${normalized}% 100%)`,
      }}
    >
      <div className="absolute inset-[5px] grid place-items-center rounded-full bg-slate-900">
        <span className="text-[10px] font-semibold text-slate-300">
          {normalized.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function getSummary(
  metrics: MetricsResponse[],
  getter: (
    metric: MetricsResponse,
  ) => number | null,
): MetricSummary {
  const values = metrics
    .map(getter)
    .filter(
      (value): value is number =>
        value !== null,
    );

  return createSummary(values);
}

function getDiskSummary(
  metrics: MetricsResponse[],
): MetricSummary {
  const values = metrics
    .filter(
      (metric) =>
        metric.disk_used_gb !== null &&
        metric.disk_total_gb !== null &&
        metric.disk_total_gb > 0,
    )
    .map(
      (metric) =>
        ((metric.disk_used_gb as number) /
          (metric.disk_total_gb as number)) *
        100,
    );

  return createSummary(values);
}

function createSummary(
  values: number[],
): MetricSummary {
  if (values.length === 0) {
    return {
      current: null,
      average: null,
      minimum: null,
      maximum: null,
      data: [],
    };
  }

  return {
    current:
      values[values.length - 1],
    average:
      values.reduce(
        (sum, value) => sum + value,
        0,
      ) / values.length,
    minimum: Math.min(...values),
    maximum: Math.max(...values),
    data: values.map((value) => ({
      value,
    })),
  };
}

function formatValue(
  value: number | null,
): string {
  if (value === null) {
    return "-";
  }

  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(1);
}

export default LiveMetricsPanel;