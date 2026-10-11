import {
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  Activity,
  Clock3,
  Database,
  HardDrive,
  Network,
} from "lucide-react";

import { useDevices } from "../hooks/useDevices";
import { useMetrics } from "../hooks/useMetrics";

import CpuChart from "../charts/CpuChart";
import RamChart from "../charts/RamChart";
import DiskChart from "../charts/DiskChart";
import NetworkChart from "../charts/NetworkChart";

import type { MetricPeriod, MetricsResponse } from "../types/metrics";

function Metrics() {
  const [period, setPeriod] =
    useState<MetricPeriod>("1h");

  const [selectedDeviceId, setSelectedDeviceId] =
    useState<number | null>(null);

  const {
    data: devices,
    loading: devicesLoading,
    error: devicesError,
  } = useDevices();

  const {
    data: metrics,
    loading: metricsLoading,
    error: metricsError,
  } = useMetrics(
    selectedDeviceId,
    period,
  );

  const selectedDevice = useMemo(
    () =>
      devices.find(
        (device) =>
          device.id === selectedDeviceId,
      ) ?? null,
    [devices, selectedDeviceId],
  );

  const orderedMetrics = useMemo(() => {
    return [...metrics].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime(),
    );
  }, [metrics]);

  const latestMetric =
    orderedMetrics.length > 0
      ? orderedMetrics[
          orderedMetrics.length - 1
        ]
      : null;

  const cpuStats = calculateStats(
    orderedMetrics,
    (metric) => metric.cpu_usage,
  );

  const ramStats = calculateStats(
    orderedMetrics,
    (metric) => metric.ram_usage,
  );

  const diskStats = calculateDiskStats(
    orderedMetrics,
  );

  const latencyStats = calculateStats(
    orderedMetrics,
    (metric) => metric.latency_ms,
  );

  const packetLossStats =
    calculateStats(
      orderedMetrics,
      (metric) =>
        metric.packet_loss,
    );

  const error =
    devicesError || metricsError;

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Monitoring
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Metrik Analizi
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Seçilen cihazın zaman serisi
                verilerini ve performans
                istatistiklerini ayrıntılı olarak
                inceleyin.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-1">
                <select
                  value={
                    selectedDeviceId ?? ""
                  }
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    setSelectedDeviceId(
                      value
                        ? Number(value)
                        : null,
                    );
                  }}
                  className="min-w-60 rounded-md border-0 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/30"
                  disabled={
                    devicesLoading
                  }
                >
                  {devices.length ===
                  0 ? (
                    <option value="">
                      Cihaz bulunamadı
                    </option>
                  ) : (
                    devices.map(
                      (device) => (
                        <option
                          key={
                            device.id
                          }
                          value={
                            device.id
                          }
                        >
                          {
                            device.hostname
                          }{" "}
                          —{" "}
                          {
                            device.ip_address
                          }
                        </option>
                      ),
                    )
                  )}
                </select>
              </div>

              <div className="flex rounded-lg border border-slate-800 bg-slate-900/80 p-1">
                {(
                  [
                    ["1h", "1 saat"],
                    ["6h", "6 saat"],
                    ["24h", "24 saat"],
                    ["7d", "7 gün"],
                  ] as [
                    MetricPeriod,
                    string,
                  ][]
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setPeriod(
                          value,
                        )
                      }
                      className={`rounded-md px-3 py-2 text-xs font-medium transition ${
                        period === value
                          ? "bg-cyan-500/15 text-cyan-300"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {selectedDevice && (
          <section className="mb-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Selected Device
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-100">
                    {
                      selectedDevice.hostname
                    }
                  </h2>

                  <StatusBadge
                    status={
                      selectedDevice.status
                    }
                  />
                </div>

                <p className="mt-1 font-mono text-xs text-slate-500">
                  {
                    selectedDevice.ip_address
                  }
                  {" • "}
                  {
                    selectedDevice.location
                  }
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  Data Points
                </p>

                <p className="mt-1 text-xl font-bold text-cyan-400">
                  {metrics.length}
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            title="CPU Average"
            value={formatPercentage(
              cpuStats.average,
            )}
            icon={
              <Activity className="h-4 w-4" />
            }
            accent="text-cyan-400"
          />

          <StatCard
            title="RAM Average"
            value={formatPercentage(
              ramStats.average,
            )}
            icon={
              <Database className="h-4 w-4" />
            }
            accent="text-emerald-400"
          />

          <StatCard
            title="Disk Average"
            value={formatPercentage(
              diskStats.average,
            )}
            icon={
              <HardDrive className="h-4 w-4" />
            }
            accent="text-amber-400"
          />

          <StatCard
            title="Latency Average"
            value={formatMilliseconds(
              latencyStats.average,
            )}
            icon={
              <Network className="h-4 w-4" />
            }
            accent="text-violet-400"
          />

          <StatCard
            title="Packet Loss"
            value={formatPercentage(
              packetLossStats.average,
            )}
            icon={
              <Network className="h-4 w-4" />
            }
            accent="text-rose-400"
          />

          <StatCard
            title="Last Check"
            value={formatDateTime(
              latestMetric?.timestamp ??
                null,
            )}
            icon={
              <Clock3 className="h-4 w-4" />
            }
            accent="text-slate-300"
          />
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          <StatsPanel
            title="CPU Statistics"
            current={
              cpuStats.current
            }
            average={
              cpuStats.average
            }
            minimum={
              cpuStats.minimum
            }
            maximum={
              cpuStats.maximum
            }
            unit="%"
            accent="text-cyan-400"
          />

          <StatsPanel
            title="RAM Statistics"
            current={
              ramStats.current
            }
            average={
              ramStats.average
            }
            minimum={
              ramStats.minimum
            }
            maximum={
              ramStats.maximum
            }
            unit="%"
            accent="text-emerald-400"
          />

          <StatsPanel
            title="Disk Statistics"
            current={
              diskStats.current
            }
            average={
              diskStats.average
            }
            minimum={
              diskStats.minimum
            }
            maximum={
              diskStats.maximum
            }
            unit="%"
            accent="text-amber-400"
          />

          <StatsPanel
            title="Latency Statistics"
            current={
              latencyStats.current
            }
            average={
              latencyStats.average
            }
            minimum={
              latencyStats.minimum
            }
            maximum={
              latencyStats.maximum
            }
            unit=" ms"
            accent="text-violet-400"
          />
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Metric Timeline
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {
                  selectedDevice?.hostname ??
                  "Cihaz seçilmedi"
                }
                {" • "}
                {periodLabel(period)}
              </p>
            </div>

            {metricsLoading && (
              <span className="text-xs text-cyan-400">
                Veriler yükleniyor...
              </span>
            )}
          </div>

          {metrics.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <CpuChart
                metrics={orderedMetrics}
              />

              <RamChart
                metrics={orderedMetrics}
              />

              <DiskChart
                metrics={orderedMetrics}
              />

              <NetworkChart
                metrics={orderedMetrics}
              />
            </div>
          ) : (
            <EmptyState />
          )}
        </section>

        <section className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
          <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Metric Records
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Seçilen zaman aralığındaki kayıtlar
              </p>
            </div>

            <span className="text-xs text-slate-500">
              {metrics.length} kayıt
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left">
              <thead className="border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <Header>Timestamp</Header>
                  <Header>CPU</Header>
                  <Header>RAM</Header>
                  <Header>Disk</Header>
                  <Header>Latency</Header>
                  <Header>Packet Loss</Header>
                  <Header>Uptime</Header>
                </tr>
              </thead>

              <tbody>
                {[...orderedMetrics]
                  .reverse()
                  .map((metric) => (
                    <MetricRow
                      key={
                        metric.id
                      }
                      metric={
                        metric
                      }
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  accent: string;
}

function StatCard({
  title,
  value,
  icon,
  accent,
}: StatCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          {title}
        </p>

        <span
          className={accent}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-xl font-bold text-slate-100">
        {value}
      </p>
    </article>
  );
}

interface StatsPanelProps {
  title: string;
  current: number | null;
  average: number | null;
  minimum: number | null;
  maximum: number | null;
  unit: string;
  accent: string;
}

function StatsPanel({
  title,
  current,
  average,
  minimum,
  maximum,
  unit,
  accent,
}: StatsPanelProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">
          {title}
        </h3>

        <span
          className={`text-xs ${accent}`}
        >
          Current
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <ValueBox
          label="Current"
          value={formatMetricValue(
            current,
            unit,
          )}
        />

        <ValueBox
          label="Average"
          value={formatMetricValue(
            average,
            unit,
          )}
        />

        <ValueBox
          label="Min"
          value={formatMetricValue(
            minimum,
            unit,
          )}
        />

        <ValueBox
          label="Max"
          value={formatMetricValue(
            maximum,
            unit,
          )}
        />
      </div>
    </section>
  );
}

function ValueBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-950/70 p-3">
      <p className="text-[9px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function MetricRow({
  metric,
}: {
  metric: MetricsResponse;
}) {
  return (
    <tr className="border-b border-slate-800/80 transition hover:bg-slate-800/30">
      <td className="px-5 py-3 text-xs text-slate-400">
        {formatDateTime(
          metric.timestamp,
        )}
      </td>

      <td className="px-5 py-3">
        {formatMetricValue(
          metric.cpu_usage,
          "%",
        )}
      </td>

      <td className="px-5 py-3">
        {formatMetricValue(
          metric.ram_usage,
          "%",
        )}
      </td>

      <td className="px-5 py-3">
        {formatDiskMetric(
          metric,
        )}
      </td>

      <td className="px-5 py-3">
        {formatMetricValue(
          metric.latency_ms,
          " ms",
        )}
      </td>

      <td className="px-5 py-3">
        {formatMetricValue(
          metric.packet_loss,
          "%",
        )}
      </td>

      <td className="px-5 py-3 text-xs text-slate-400">
        {formatUptime(
          metric.uptime_seconds,
        )}
      </td>
    </tr>
  );
}

function Header({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

function calculateStats(
  metrics: MetricsResponse[],
  getter: (
    metric: MetricsResponse,
  ) => number | null,
) {
  const values = metrics
    .map(getter)
    .filter(
      (value): value is number =>
        value !== null,
    );

  if (values.length === 0) {
    return {
      current: null,
      average: null,
      minimum: null,
      maximum: null,
    };
  }

  return {
    current:
      values[values.length - 1],
    average:
      values.reduce(
        (sum, value) =>
          sum + value,
        0,
      ) / values.length,
    minimum: Math.min(...values),
    maximum: Math.max(...values),
  };
}

function calculateDiskStats(
  metrics: MetricsResponse[],
) {
  const values = metrics
    .filter(
      (metric) =>
        metric.disk_used_gb !==
          null &&
        metric.disk_total_gb !==
          null &&
        metric.disk_total_gb > 0,
    )
    .map(
      (metric) =>
        ((metric.disk_used_gb as number) /
          (metric.disk_total_gb as number)) *
        100,
    );

  if (values.length === 0) {
    return {
      current: null,
      average: null,
      minimum: null,
      maximum: null,
    };
  }

  return {
    current:
      values[values.length - 1],
    average:
      values.reduce(
        (sum, value) =>
          sum + value,
        0,
      ) / values.length,
    minimum: Math.min(...values),
    maximum: Math.max(...values),
  };
}

function formatMetricValue(
  value: number | null,
  unit: string,
): string {
  if (value === null) {
    return "-";
  }

  return `${value.toFixed(
    value >= 10 ? 1 : 2,
  )}${unit}`;
}

function formatPercentage(
  value: number | null,
): string {
  if (value === null) {
    return "-";
  }

  return `${value.toFixed(1)}%`;
}

function formatMilliseconds(
  value: number | null,
): string {
  if (value === null) {
    return "-";
  }

  return `${value.toFixed(1)} ms`;
}

function formatDiskMetric(
  metric: MetricsResponse,
): string {
  if (
    metric.disk_total_gb ===
      null ||
    metric.disk_used_gb ===
      null ||
    metric.disk_total_gb <= 0
  ) {
    return "-";
  }

  const percentage =
    (metric.disk_used_gb /
      metric.disk_total_gb) *
    100;

  return `${percentage.toFixed(
    1,
  )}%`;
}

function formatUptime(
  seconds: number | null,
): string {
  if (seconds === null) {
    return "-";
  }

  const days = Math.floor(
    seconds / 86400,
  );

  const hours = Math.floor(
    (seconds % 86400) /
      3600,
  );

  const minutes = Math.floor(
    (seconds % 3600) /
      60,
  );

  if (days > 0) {
    return `${days}g ${hours}s`;
  }

  if (hours > 0) {
    return `${hours}s ${minutes}dk`;
  }

  return `${minutes}dk`;
}

function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "-";
  }

  return new Date(
    value,
  ).toLocaleString("tr-TR");
}

function periodLabel(
  period: MetricPeriod,
): string {
  switch (period) {
    case "1h":
      return "Son 1 saat";

    case "6h":
      return "Son 6 saat";

    case "24h":
      return "Son 24 saat";

    case "7d":
      return "Son 7 gün";

    default:
      return "Son 1 saat";
  }
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  if (normalized === "online") {
    return (
      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
        ● Online
      </span>
    );
  }

  if (normalized === "offline") {
    return (
      <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-300">
        ● Offline
      </span>
    );
  }

  return (
    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
      ● Pending
    </span>
  );
}

function EmptyState() {
  return (
    <div className="grid min-h-80 place-items-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-300">
          Metric verisi bulunamadı
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Seçilen zaman aralığında kayıt
          bulunmuyor.
        </p>
      </div>
    </div>
  );
}

export default Metrics;