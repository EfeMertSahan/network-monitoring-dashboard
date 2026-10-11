import {
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  Activity,
  Search,
  Server,
} from "lucide-react";

import { Link } from "react-router";

import { useDeviceHealth } from "../hooks/useDeviceHealth";
import type {
  DeviceHealth,
  DeviceStatus,
} from "../types/device";

function Devices() {
  const {
    data: devices,
    loading,
    error,
    refresh,
  } = useDeviceHealth();

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | DeviceStatus>("All");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const deviceTypes = useMemo(() => {
    return Array.from(
      new Set(
        devices.map(
          (device) =>
            device.device_type,
        ),
      ),
    ).sort();
  }, [devices]);

  const filteredDevices =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return devices.filter(
        (device) => {
          const matchesSearch =
            normalizedSearch.length === 0 ||
            device.hostname
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            device.ip_address
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            device.location
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            statusFilter === "All" ||
            device.status ===
              statusFilter;

          const matchesType =
            typeFilter === "All" ||
            device.device_type ===
              typeFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType
          );
        },
      );
    }, [
      devices,
      search,
      statusFilter,
      typeFilter,
    ]);

  const onlineCount = devices.filter(
    (device) =>
      device.status === "Online",
  ).length;

  const offlineCount = devices.filter(
    (device) =>
      device.status === "Offline",
  ).length;

  const pendingCount = devices.filter(
    (device) =>
      device.status === "Pending",
  ).length;

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Infrastructure
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                Cihazlar
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                İzlenen ağ cihazlarını ve son
                sağlık durumlarını yönetin.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void refresh()
              }
              disabled={loading}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Yenileniyor..."
                : "↻ Yenile"}
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-5 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Total Devices"
            value={devices.length}
            icon={
              <Server className="h-4 w-4" />
            }
          />

          <SummaryCard
            title="Online"
            value={onlineCount}
            icon={
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
            }
            valueClass="text-emerald-400"
          />

          <SummaryCard
            title="Offline"
            value={offlineCount}
            icon={
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            }
            valueClass="text-red-400"
          />

          <SummaryCard
            title="Pending"
            value={pendingCount}
            icon={
              <Activity className="h-4 w-4 text-amber-400" />
            }
            valueClass="text-amber-400"
          />
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Cihaz adı, IP veya konum ara..."
                className="w-full rounded-lg border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as
                      | "All"
                      | DeviceStatus,
                  )
                }
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/40"
              >
                <option value="All">
                  All Status
                </option>

                <option value="Online">
                  Online
                </option>

                <option value="Offline">
                  Offline
                </option>

                <option value="Pending">
                  Pending
                </option>
              </select>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(
                    event.target.value,
                  )
                }
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/40"
              >
                <option value="All">
                  All Types
                </option>

                {deviceTypes.map(
                  (type) => (
                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Device Inventory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredDevices.length} cihaz
                gösteriliyor
              </p>
            </div>

            <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-400">
              Live data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-left">
              <thead className="border-b border-slate-800 bg-slate-950/50">
                <tr>
                  <Header>
                    Device
                  </Header>

                  <Header>
                    Status
                  </Header>

                  <Header>
                    Type
                  </Header>

                  <Header>
                    CPU
                  </Header>

                  <Header>
                    RAM
                  </Header>

                  <Header>
                    Disk
                  </Header>

                  <Header>
                    Latency
                  </Header>

                  <Header>
                    Packet Loss
                  </Header>

                  <Header>
                    Location
                  </Header>
                </tr>
              </thead>

              <tbody>
                {filteredDevices.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-12 text-center"
                    >
                      <p className="text-sm font-medium text-slate-300">
                        Cihaz bulunamadı
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Arama veya filtre
                        kriterlerini
                        değiştirin.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map(
                    (device) => (
                      <DeviceRow
                        key={device.id}
                        device={device}
                      />
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  valueClass?: string;
}

function SummaryCard({
  title,
  value,
  icon,
  valueClass = "text-slate-100",
}: SummaryCardProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-slate-500">
          {title}
        </p>

        <span className="text-slate-400">
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

function DeviceRow({
  device,
}: {
  device: DeviceHealth;
}) {
  return (
    <tr className="border-b border-slate-800/80 transition hover:bg-slate-800/30">
      <td className="px-5 py-4">
        <Link
          to={`/devices/${device.id}`}
          className="group block"
        >
          <div className="flex items-center gap-3">
            <span
              className={`h-2 w-2 rounded-full ${statusDot(
                device.status,
              )}`}
            />

            <div>
              <p className="text-sm font-semibold text-slate-200 transition group-hover:text-cyan-300">
                {device.hostname}
              </p>

              <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                {device.ip_address}
              </p>
            </div>
          </div>
        </Link>
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          status={device.status}
        />
      </td>

      <td className="px-5 py-4 text-xs text-slate-400">
        {device.device_type}
      </td>

      <td className="px-5 py-4">
        <Metric
          value={device.cpu_usage}
          unit="%"
          warning={
            device.cpu_usage !== null &&
            device.cpu_usage >= 80
          }
        />
      </td>

      <td className="px-5 py-4">
        <Metric
          value={device.ram_usage}
          unit="%"
          warning={
            device.ram_usage !== null &&
            device.ram_usage >= 80
          }
        />
      </td>

      <td className="px-5 py-4">
        <Metric
          value={
            device.disk_usage_percent
          }
          unit="%"
          decimals={1}
          warning={
            device.disk_usage_percent !==
              null &&
            device.disk_usage_percent >=
              80
          }
        />
      </td>

      <td className="px-5 py-4">
        <Metric
          value={device.latency_ms}
          unit=" ms"
          decimals={1}
          warning={
            device.latency_ms !== null &&
            device.latency_ms >= 100
          }
        />
      </td>

      <td className="px-5 py-4">
        <Metric
          value={device.packet_loss}
          unit="%"
          decimals={1}
          warning={
            device.packet_loss !== null &&
            device.packet_loss >= 20
          }
        />
      </td>

      <td className="px-5 py-4 text-xs text-slate-400">
        {device.location}
      </td>
    </tr>
  );
}

function Metric({
  value,
  unit,
  warning,
  decimals = 0,
}: {
  value: number | null;
  unit: string;
  warning: boolean;
  decimals?: number;
}) {
  if (value === null) {
    return (
      <span className="text-xs text-slate-600">
        -
      </span>
    );
  }

  return (
    <span
      className={`font-mono text-xs font-medium ${
        warning
          ? "text-amber-400"
          : "text-slate-300"
      }`}
    >
      {value.toFixed(decimals)}
      {unit}
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

function StatusBadge({
  status,
}: {
  status: DeviceStatus;
}) {
  const styles: Record<
    DeviceStatus,
    string
  > = {
    Online:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    Offline:
      "border-red-500/20 bg-red-500/10 text-red-300",
    Pending:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      ● {status}
    </span>
  );
}

function statusDot(
  status: DeviceStatus,
): string {
  switch (status) {
    case "Online":
      return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]";

    case "Offline":
      return "bg-red-400";

    case "Pending":
      return "bg-amber-400";
  }
}

export default Devices;