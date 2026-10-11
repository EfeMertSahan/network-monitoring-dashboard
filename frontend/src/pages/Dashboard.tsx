import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import ActiveAlertsPanel from "../components/dashboard/ActiveAlertsPanel";
import AlertSeverityChart from "../components/dashboard/AlertSeverityChart";
import DeviceHealthTable from "../components/dashboard/DeviceHealthTable";
import DeviceStatusChart from "../components/dashboard/DeviceStatusChart";
import LiveMetricsPanel from "../components/dashboard/LiveMetricsPanel";

import CpuChart from "../charts/CpuChart";
import DiskChart from "../charts/DiskChart";
import NetworkChart from "../charts/NetworkChart";
import RamChart from "../charts/RamChart";

import { useAlerts } from "../hooks/useAlerts";
import { useDashboard } from "../hooks/useDashboard";
import { useDeviceHealth } from "../hooks/useDeviceHealth";
import { useDevices } from "../hooks/useDevices";
import { useMetrics } from "../hooks/useMetrics";

import type { Device } from "../types/device";
import type { MetricPeriod } from "../types/metrics";

const AUTO_REFRESH_INTERVAL_MS = 30_000;

function Dashboard() {
  const [period, setPeriod] =
    useState<MetricPeriod>("1h");

  const [
    selectedDeviceId,
    setSelectedDeviceId,
  ] = useState<number | null>(null);

  const {
    data: dashboard,
    loading: dashboardLoading,
    error: dashboardError,
    refresh: refreshDashboard,
  } = useDashboard();

  const {
    data: devices,
    loading: devicesLoading,
    error: devicesError,
    refresh: refreshDevices,
  } = useDevices();

  const {
    data: deviceHealth,
    loading: deviceHealthLoading,
    error: deviceHealthError,
    refresh: refreshDeviceHealth,
  } = useDeviceHealth();

  const {
    data: metrics,
    loading: metricsLoading,
    error: metricsError,
    refresh: refreshMetrics,
  } = useMetrics(
    selectedDeviceId,
    period,
  );

  const {
    data: alerts,
    loading: alertsLoading,
    error: alertsError,
    refresh: refreshAlerts,
  } = useAlerts({
    isResolved: false,
    deviceId: selectedDeviceId,
    limit: 20,
  });

  const selectedDevice =
    useMemo<Device | null>(
      () =>
        devices.find(
          (device) =>
            device.id ===
            selectedDeviceId,
        ) ?? null,
      [
        devices,
        selectedDeviceId,
      ],
    );

  useEffect(() => {
    if (devices.length === 0) {
      setSelectedDeviceId(null);
      return;
    }

    const selectedDeviceStillExists =
      devices.some(
        (device) =>
          device.id ===
          selectedDeviceId,
      );

    if (selectedDeviceStillExists) {
      return;
    }

    const onlineDevice =
      devices.find(
        (device) =>
          device.status === "Online",
      );

    const fallbackDevice =
      onlineDevice ?? devices[0];

    setSelectedDeviceId(
      fallbackDevice.id,
    );
  }, [
    devices,
    selectedDeviceId,
  ]);

  const refreshAll =
    useCallback(
      async () => {
        await Promise.all([
          refreshDashboard(),
          refreshDevices(),
          refreshDeviceHealth(),
          refreshMetrics(),
          refreshAlerts(),
        ]);
      },
      [
        refreshDashboard,
        refreshDevices,
        refreshDeviceHealth,
        refreshMetrics,
        refreshAlerts,
      ],
    );

  useEffect(() => {
    const intervalId =
      window.setInterval(() => {
        void refreshAll();
      }, AUTO_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, [refreshAll]);

  const loading =
    dashboardLoading ||
    devicesLoading ||
    deviceHealthLoading ||
    metricsLoading ||
    alertsLoading;

  const error =
    dashboardError ||
    devicesError ||
    deviceHealthError ||
    metricsError ||
    alertsError;

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Network Monitoring
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Ağ İzleme Kontrol Paneli
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Ağ cihazlarının
                performansını,
                sistem kaynaklarını ve
                network sağlığını zaman
                serileri üzerinden izleyin.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-1">
                <select
                  value={
                    selectedDeviceId ?? ""
                  }
                  onChange={(
                    event,
                  ) => {
                    const value =
                      event.target.value;

                    setSelectedDeviceId(
                      value
                        ? Number(value)
                        : null,
                    );
                  }}
                  className="min-w-52 rounded-md border-0 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-cyan-500/30"
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

              <button
                type="button"
                onClick={() =>
                  void refreshAll()
                }
                disabled={loading}
                className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Yenileniyor..."
                  : "↻ Yenile"}
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="mb-5 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">
                İzlenen Cihaz
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-100">
                  {selectedDevice?.hostname ??
                    "Cihaz seçilmedi"}
                </h2>

                {selectedDevice && (
                  <StatusBadge
                    status={
                      selectedDevice.status
                    }
                  />
                )}
              </div>

              {selectedDevice && (
                <p className="mt-1 text-xs text-slate-500">
                  {
                    selectedDevice.ip_address
                  }
                  {" • "}
                  {
                    selectedDevice.location
                  }
                  {" • "}
                  {
                    selectedDevice.device_type
                  }
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

              <span className="text-xs font-medium text-emerald-300">
                Auto refresh: 30s
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <OverviewCard
            label="Toplam Cihaz"
            value={
              dashboard?.total_devices
            }
          />

          <OverviewCard
            label="Çevrimiçi"
            value={
              dashboard?.online_devices
            }
            valueClass="text-emerald-400"
          />

          <OverviewCard
            label="Çevrimdışı"
            value={
              dashboard?.offline_devices
            }
            valueClass="text-red-400"
          />

          <OverviewCard
            label="Bekleyen"
            value={
              dashboard?.pending_devices
            }
            valueClass="text-amber-400"
          />

          <OverviewCard
            label="Açık Alarmlar"
            value={
              dashboard?.open_alerts
            }
            valueClass="text-rose-400"
          />

          <OverviewCard
            label="Kritik Alarmlar"
            value={
              dashboard?.critical_alerts
            }
            valueClass="text-red-300"
          />
        </section>

        <section className="mt-3 grid gap-3 md:grid-cols-3">
          <SmallOverviewCard
            label="Warning"
            value={
              dashboard?.warning_alerts
            }
            valueClass="text-amber-400"
          />

          <SmallOverviewCard
            label="Info"
            value={
              dashboard?.info_alerts
            }
            valueClass="text-cyan-400"
          />

          <SmallOverviewCard
            label="Monitoring"
            value="LIVE"
            valueClass="text-emerald-400"
            live
          />
        </section>

        <LiveMetricsPanel
          metrics={metrics}
          totalDevices={
            dashboard?.total_devices
          }
          onlineDevices={
            dashboard?.online_devices
          }
        />

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          <DeviceStatusChart
            total={
              dashboard?.total_devices ??
              0
            }
            online={
              dashboard?.online_devices ??
              0
            }
            offline={
              dashboard?.offline_devices ??
              0
            }
            pending={
              dashboard?.pending_devices ??
              0
            }
          />

          <AlertSeverityChart
            critical={
              dashboard?.critical_alerts ??
              0
            }
            warning={
              dashboard?.warning_alerts ??
              0
            }
            info={
              dashboard?.info_alerts ??
              0
            }
          />
        </section>

        <section className="mt-8">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Performance Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {selectedDevice
                  ? `${selectedDevice.hostname} • `
                  : ""}
                {periodLabel(
                  period,
                )}
                {" • "}
                {metrics.length} veri
                noktası
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
            </div>
          ) : (
            <div className="grid min-h-80 place-items-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-300">
                  Grafik verisi bulunamadı
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Seçilen zaman aralığında
                  seçili cihaz için kayıtlı
                  metric bulunmuyor.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <DeviceHealthTable
            devices={deviceHealth}
            selectedDeviceId={
              selectedDeviceId
            }
            onSelectDevice={
              setSelectedDeviceId
            }
          />

          <ActiveAlertsPanel
            alerts={alerts}
            loading={alertsLoading}
          />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <InfoPanel
            title="Sistem Durumu"
            value="Aktif"
            description="Monitoring scheduler çalışıyor."
            valueClass="text-emerald-400"
          />

          <InfoPanel
            title="Açık Alarmlar"
            value={
              dashboard
                ? String(
                    dashboard.open_alerts,
                  )
                : "-"
            }
            description="Çözülmemiş alarm sayısı."
            valueClass="text-rose-400"
          />

          <InfoPanel
            title="Veri Akışı"
            value={
              metrics.length > 0
                ? "OK"
                : "BEKLENİYOR"
            }
            description="Seçilen cihazdan metric verisi."
            valueClass="text-cyan-400"
          />
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3">
          <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Otomatik yenileme: 30 saniye
            </span>

            <span>
              Seçili zaman aralığı:{" "}
              {periodLabel(
                period,
              )}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

interface OverviewCardProps {
  label: string;
  value?: number;
  valueClass?: string;
}

function OverviewCard({
  label,
  value,
  valueClass = "text-slate-100",
}: OverviewCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-lg">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-bold ${valueClass}`}
      >
        {value ?? "-"}
      </p>
    </article>
  );
}

interface SmallOverviewCardProps {
  label: string;
  value?: number | string;
  valueClass?: string;
  live?: boolean;
}

function SmallOverviewCard({
  label,
  value,
  valueClass = "text-slate-100",
  live = false,
}: SmallOverviewCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {live && (
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
        )}

        <p
          className={`text-lg font-semibold ${valueClass}`}
        >
          {value ?? "-"}
        </p>
      </div>
    </article>
  );
}

interface InfoPanelProps {
  title: string;
  value: string;
  description: string;
  valueClass: string;
}

function InfoPanel({
  title,
  value,
  description,
  valueClass,
}: InfoPanelProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </article>
  );
}

interface StatusBadgeProps {
  status: string;
}

function StatusBadge({
  status,
}: StatusBadgeProps) {
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

export default Dashboard;