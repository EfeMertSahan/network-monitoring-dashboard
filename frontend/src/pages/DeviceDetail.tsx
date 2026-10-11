import {
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  ArrowLeft,
  Cpu,
  Database,
  HardDrive,
  Network,
  Server,
  Timer,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router";

import CpuChart from "../charts/CpuChart";
import DiskChart from "../charts/DiskChart";
import NetworkChart from "../charts/NetworkChart";
import RamChart from "../charts/RamChart";

import ActiveAlertsPanel from "../components/dashboard/ActiveAlertsPanel";
import MetricPanel from "../components/dashboard/MetricPanel";

import { useAlerts } from "../hooks/useAlerts";
import { useDevice } from "../hooks/useDevice";
import { useMetrics } from "../hooks/useMetrics";

import type { MetricPeriod } from "../types/metrics";

function DeviceDetail() {
  const { deviceId } =
    useParams<{
      deviceId: string;
    }>();

  const numericDeviceId =
    deviceId &&
    /^\d+$/.test(deviceId)
      ? Number(deviceId)
      : null;

  const [period, setPeriod] =
    useState<MetricPeriod>("1h");

  const {
    data: device,
    loading: deviceLoading,
    error: deviceError,
  } = useDevice(
    numericDeviceId,
  );

  const {
    data: metrics,
    loading: metricsLoading,
    error: metricsError,
  } = useMetrics(
    numericDeviceId,
    period,
  );

  const {
    data: alerts,
    loading: alertsLoading,
  } = useAlerts({
    isResolved: false,
    deviceId: numericDeviceId,
    limit: 20,
  });

  if (numericDeviceId === null) {
    return (
      <ErrorState
        title="Geçersiz cihaz ID"
        description="URL içerisindeki cihaz ID değeri geçerli değil."
      />
    );
  }

  if (
    deviceLoading &&
    device === null
  ) {
    return (
      <LoadingState />
    );
  }

  if (deviceError || !device) {
    return (
      <ErrorState
        title="Cihaz bulunamadı"
        description={
          deviceError ??
          "İstenen cihaz mevcut değil."
        }
      />
    );
  }

  const latestMetric =
    metrics.length > 0
      ? metrics[
          metrics.length - 1
        ]
      : null;

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6">
          <Link
            to="/devices"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Devices
          </Link>
        </div>

        <header className="mb-6 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <Server className="h-6 w-6" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {device.hostname}
                  </h1>

                  <StatusBadge
                    status={
                      device.status
                    }
                  />
                </div>

                <p className="mt-2 font-mono text-sm text-slate-400">
                  {device.ip_address}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {device.device_type}
                  {" • "}
                  {device.location}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      period === value
                        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
          </div>
        </header>

        {metricsError && (
          <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {metricsError}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailCard
            title="CPU"
            value={
              latestMetric?.cpu_usage !==
                null &&
              latestMetric?.cpu_usage !==
                undefined
                ? `${latestMetric.cpu_usage}%`
                : "-"
            }
            icon={
              <Cpu className="h-5 w-5" />
            }
            accent="text-cyan-400"
          />

          <DetailCard
            title="RAM"
            value={
              latestMetric?.ram_usage !==
                null &&
              latestMetric?.ram_usage !==
                undefined
                ? `${latestMetric.ram_usage}%`
                : "-"
            }
            icon={
              <Database className="h-5 w-5" />
            }
            accent="text-emerald-400"
          />

          <DetailCard
            title="Disk"
            value={getDiskUsage(
              latestMetric,
            )}
            icon={
              <HardDrive className="h-5 w-5" />
            }
            accent="text-amber-400"
          />

          <DetailCard
            title="Latency"
            value={
              latestMetric?.latency_ms !==
                null &&
              latestMetric?.latency_ms !==
                undefined
                ? `${latestMetric.latency_ms.toFixed(1)} ms`
                : "-"
            }
            icon={
              <Network className="h-5 w-5" />
            }
            accent="text-violet-400"
          />
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          <CpuChart
            metrics={metrics}
          />

          <RamChart
            metrics={metrics}
          />

          <DiskChart
            metrics={metrics}
          />

          <NetworkChart
            metrics={metrics}
          />
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <MetricPanel
            title="Device Information"
            subtitle="Cihazın genel yapılandırması"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoItem
                label="Hostname"
                value={
                  device.hostname
                }
              />

              <InfoItem
                label="IP Address"
                value={
                  device.ip_address
                }
              />

              <InfoItem
                label="Device Type"
                value={
                  device.device_type
                }
              />

              <InfoItem
                label="Location"
                value={
                  device.location
                }
              />

              <InfoItem
                label="Created At"
                value={formatDate(
                  device.created_at,
                )}
              />

              <InfoItem
                label="Last Checked"
                value={formatDate(
                  device.last_checked,
                )}
              />
            </div>
          </MetricPanel>

          <MetricPanel
            title="Runtime"
            subtitle="Son alınan sistem değerleri"
          >
            <div className="space-y-4">
              <RuntimeItem
                icon={
                  <Timer className="h-4 w-4" />
                }
                label="Uptime"
                value={formatUptime(
                  latestMetric?.uptime_seconds ??
                    null,
                )}
              />

              <RuntimeItem
                icon={
                  <Network className="h-4 w-4" />
                }
                label="Packet Loss"
                value={
                  latestMetric?.packet_loss !==
                    null &&
                  latestMetric?.packet_loss !==
                    undefined
                    ? `${latestMetric.packet_loss.toFixed(1)}%`
                    : "-"
                }
              />

              <RuntimeItem
                icon={
                  <Network className="h-4 w-4" />
                }
                label="Metric Count"
                value={String(
                  metrics.length,
                )}
              />

              <RuntimeItem
                icon={
                  <Server className="h-4 w-4" />
                }
                label="Monitoring"
                value={
                  metricsLoading
                    ? "Loading"
                    : "Active"
                }
              />
            </div>
          </MetricPanel>
        </section>

        <section className="mt-6">
          <ActiveAlertsPanel
            alerts={alerts}
            loading={
              alertsLoading
            }
          />
        </section>
      </div>
    </main>
  );
}

interface DetailCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  accent: string;
}

function DetailCard({
  title,
  value,
  icon,
  accent,
}: DetailCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-lg bg-slate-950 p-2 ${accent}`}
        >
          {icon}
        </span>

        <p className="text-xs uppercase tracking-wider text-slate-500">
          {title}
        </p>
      </div>

      <p className="mt-5 text-2xl font-bold text-slate-100">
        {value}
      </p>
    </article>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-sm text-slate-300">
        {value}
      </p>
    </div>
  );
}

function RuntimeItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-slate-500">
          {icon}
        </span>

        <span className="text-xs text-slate-400">
          {label}
        </span>
      </div>

      <span className="text-sm font-semibold text-slate-200">
        {value}
      </span>
    </div>
  );
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

function getDiskUsage(
  metric:
    | {
        disk_used_gb: number | null;
        disk_total_gb: number | null;
      }
    | null,
): string {
  if (
    !metric ||
    metric.disk_used_gb === null ||
    metric.disk_total_gb === null ||
    metric.disk_total_gb <= 0
  ) {
    return "-";
  }

  const usage =
    (metric.disk_used_gb /
      metric.disk_total_gb) *
    100;

  return `${usage.toFixed(1)}%`;
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "-";
  }

  return new Date(
    value,
  ).toLocaleString("tr-TR");
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

function LoadingState() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050816] text-slate-300">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />

        <p className="mt-4 text-sm">
          Cihaz yükleniyor...
        </p>
      </div>
    </main>
  );
}

function ErrorState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050816] px-6 text-slate-100">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">
          Network Monitor
        </p>

        <h1 className="mt-3 text-2xl font-bold">
          {title}
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          {description}
        </p>

        <Link
          to="/devices"
          className="mt-6 inline-flex rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
        >
          Devices'a dön
        </Link>
      </div>
    </main>
  );
}

export default DeviceDetail;