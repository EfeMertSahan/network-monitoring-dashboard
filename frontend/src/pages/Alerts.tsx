import {
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCw,
  Search,
  TriangleAlert,
} from "lucide-react";

import { useAlerts } from "../hooks/useAlerts";
import { useDevices } from "../hooks/useDevices";

type AlertStatusFilter =
  | "open"
  | "resolved"
  | "all";

function Alerts() {
  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<AlertStatusFilter>(
      "open",
    );

  const [
    levelFilter,
    setLevelFilter,
  ] = useState("All");

  const [
    typeFilter,
    setTypeFilter,
  ] = useState("All");

  const [
    deviceFilter,
    setDeviceFilter,
  ] = useState("All");

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const limit = 20;

  const isResolved =
    statusFilter === "all"
      ? undefined
      : statusFilter === "open"
        ? false
        : true;

  const {
    data: devices,
  } = useDevices();

  const {
    data: alerts,
    loading,
    error,
    total,
    totalPages,
    refresh,
    resolve,
  } = useAlerts({
    isResolved,
    level:
      levelFilter === "All"
        ? undefined
        : levelFilter,
    alertType:
      typeFilter === "All"
        ? undefined
        : typeFilter,
    deviceId:
      deviceFilter === "All"
        ? undefined
        : Number(deviceFilter),
    page,
    limit,
  });

  const filteredAlerts =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      if (
        normalizedSearch.length ===
        0
      ) {
        return alerts;
      }

      return alerts.filter(
        (alert) =>
          alert.message
            .toLowerCase()
            .includes(
              normalizedSearch,
            ) ||
          alert.alert_type
            .toLowerCase()
            .includes(
              normalizedSearch,
            ),
      );
    }, [
      alerts,
      search,
    ]);

  const criticalCount =
    alerts.filter(
      (alert) =>
        alert.level.toLowerCase() ===
        "critical",
    ).length;

  const warningCount =
    alerts.filter(
      (alert) =>
        alert.level.toLowerCase() ===
        "warning",
    ).length;

  const infoCount =
    alerts.filter(
      (alert) =>
        alert.level.toLowerCase() ===
        "info",
    ).length;

  const pageStart =
    total === 0
      ? 0
      : (page - 1) * limit + 1;

  const pageEnd = Math.min(
    page * limit,
    total,
  );

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
                Monitoring
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Alarm Merkezi
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Cihazlardan gelen aktif ve
                geçmiş alarm kayıtlarını yönetin.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void refresh()
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />

              {loading
                ? "Yükleniyor..."
                : "Yenile"}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AlertSummaryCard
            title="Total"
            value={total}
            icon={
              <AlertCircle className="h-5 w-5" />
            }
            valueClass="text-slate-100"
          />

          <AlertSummaryCard
            title="Critical"
            value={criticalCount}
            icon={
              <TriangleAlert className="h-5 w-5" />
            }
            valueClass="text-red-400"
          />

          <AlertSummaryCard
            title="Warning"
            value={warningCount}
            icon={
              <TriangleAlert className="h-5 w-5" />
            }
            valueClass="text-amber-400"
          />

          <AlertSummaryCard
            title="Info"
            value={infoCount}
            icon={
              <Info className="h-5 w-5" />
            }
            valueClass="text-cyan-400"
          />
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Alarm mesajı veya tipi ara..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10"
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target
                      .value as AlertStatusFilter,
                  );
                  setPage(1);
                }}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/40"
              >
                <option value="open">
                  Açık Alarmlar
                </option>

                <option value="resolved">
                  Çözülmüş Alarmlar
                </option>

                <option value="all">
                  Tüm Alarmlar
                </option>
              </select>

              <select
                value={levelFilter}
                onChange={(event) => {
                  setLevelFilter(
                    event.target.value,
                  );
                  setPage(1);
                }}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/40"
              >
                <option value="All">
                  Tüm Seviyeler
                </option>

                <option value="Critical">
                  Critical
                </option>

                <option value="Warning">
                  Warning
                </option>

                <option value="Info">
                  Info
                </option>
              </select>

              <select
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(
                    event.target.value,
                  );
                  setPage(1);
                }}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/40"
              >
                <option value="All">
                  Tüm Alarm Tipleri
                </option>

                <option value="HighCPU">
                  HighCPU
                </option>

                <option value="HighRAM">
                  HighRAM
                </option>

                <option value="HighDisk">
                  HighDisk
                </option>

                <option value="HighLatency">
                  HighLatency
                </option>

                <option value="HighPacketLoss">
                  HighPacketLoss
                </option>
              </select>

              <select
                value={deviceFilter}
                onChange={(event) => {
                  setDeviceFilter(
                    event.target.value,
                  );
                  setPage(1);
                }}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/40"
              >
                <option value="All">
                  Tüm Cihazlar
                </option>

                {devices.map(
                  (device) => (
                    <option
                      key={device.id}
                      value={device.id}
                    >
                      {
                        device.hostname
                      }
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
          <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Alert Records
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {pageStart}–{pageEnd} /{" "}
                {total} kayıt
              </p>
            </div>

            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-[11px] font-medium text-rose-300">
              {statusFilter ===
              "open"
                ? "ACTIVE"
                : statusFilter ===
                    "resolved"
                  ? "RESOLVED"
                  : "ALL"}
            </span>
          </div>

          {filteredAlerts.length ===
          0 ? (
            <div className="px-6 py-14 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />

              <p className="mt-4 text-sm font-semibold text-slate-300">
                Alarm bulunamadı
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Seçtiğiniz filtrelere uygun
                kayıt bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left">
                <thead className="border-b border-slate-800 bg-slate-950/50">
                  <tr>
                    <Header>
                      Severity
                    </Header>

                    <Header>
                      Device
                    </Header>

                    <Header>
                      Type
                    </Header>

                    <Header>
                      Message
                    </Header>

                    <Header>
                      Created
                    </Header>

                    <Header>
                      Status
                    </Header>

                    <Header>
                      Action
                    </Header>
                  </tr>
                </thead>

                <tbody>
                  {filteredAlerts.map(
                    (alert) => {
                      const device =
                        devices.find(
                          (
                            item,
                          ) =>
                            item.id ===
                            alert.device_id,
                        );

                      return (
                        <AlertRow
                          key={
                            alert.id
                          }
                          alert={
                            alert
                          }
                          deviceName={
                            device?.hostname ??
                            `Device #${alert.device_id}`
                          }
                          onResolve={() =>
                            void resolve(
                              alert.id,
                            )
                          }
                        />
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {totalPages > 1 && (
          <section className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
            <p className="text-xs text-slate-500">
              Sayfa {page} /{" "}
              {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (
                      value,
                    ) =>
                      Math.max(
                        1,
                        value - 1,
                      ),
                  )
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Önceki
              </button>

              <button
                type="button"
                disabled={
                  page >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (
                      value,
                    ) =>
                      Math.min(
                        totalPages,
                        value + 1,
                      ),
                  )
                }
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sonraki
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

interface AlertSummaryCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  valueClass: string;
}

function AlertSummaryCard({
  title,
  value,
  icon,
  valueClass,
}: AlertSummaryCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          {title}
        </p>

        <span className="text-slate-500">
          {icon}
        </span>
      </div>

      <p
        className={`mt-3 text-2xl font-bold ${valueClass}`}
      >
        {value}
      </p>
    </article>
  );
}

function AlertRow({
  alert,
  deviceName,
  onResolve,
}: {
  alert: {
    id: number;
    device_id: number;
    alert_type: string;
    level: string;
    message: string;
    is_resolved: boolean;
    created_at: string;
    resolved_at: string | null;
  };
  deviceName: string;
  onResolve: () => void;
}) {
  return (
    <tr className="border-b border-slate-800/80 transition hover:bg-slate-800/30">
      <td className="px-5 py-4">
        <SeverityBadge
          level={alert.level}
        />
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-medium text-slate-200">
          {deviceName}
        </p>

        <p className="mt-0.5 text-[11px] text-slate-600">
          ID: {alert.device_id}
        </p>
      </td>

      <td className="px-5 py-4">
        <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-400">
          {alert.alert_type}
        </span>
      </td>

      <td className="max-w-md px-5 py-4 text-xs text-slate-300">
        {alert.message}
      </td>

      <td className="px-5 py-4 text-xs text-slate-500">
        {formatDate(
          alert.created_at,
        )}
      </td>

      <td className="px-5 py-4">
        {alert.is_resolved ? (
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">
            Resolved
          </span>
        ) : (
          <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] text-rose-300">
            Active
          </span>
        )}
      </td>

      <td className="px-5 py-4">
        {!alert.is_resolved && (
          <button
            type="button"
            onClick={onResolve}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-[11px] font-medium text-slate-300 transition hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-300"
          >
            Resolve
          </button>
        )}
      </td>
    </tr>
  );
}

function SeverityBadge({
  level,
}: {
  level: string;
}) {
  const normalized =
    level.toLowerCase();

  if (normalized === "critical") {
    return (
      <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-300">
        ● Critical
      </span>
    );
  }

  if (normalized === "warning") {
    return (
      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-300">
        ● Warning
      </span>
    );
  }

  return (
    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
      ● Info
    </span>
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

function formatDate(
  value: string,
): string {
  return new Date(
    value,
  ).toLocaleString("tr-TR");
}

export default Alerts;