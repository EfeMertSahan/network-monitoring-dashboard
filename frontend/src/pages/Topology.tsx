import {
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import {
  Activity,
  ArrowRight,
  CircleGauge,
  Cpu,
  HardDrive,
  Map,
  Network,
  Router,
  Search,
  Server,
} from "lucide-react";

import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { Link } from "react-router";

import { useDeviceHealth } from "../hooks/useDeviceHealth";
import { useTopology } from "../hooks/useTopology";

import type {
  DeviceHealth,
  DeviceStatus,
} from "../types/device";

type StatusFilter =
  | "All"
  | DeviceStatus;

interface DeviceNodeData
  extends Record<string, unknown> {
  hostname: string;
  ipAddress: string;
  status: DeviceStatus;
  deviceType: string;
  location: string;
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  latency: number | null;
}

type DeviceFlowNode = Node<
  DeviceNodeData,
  "device"
>;

const nodeTypes = {
  device: DeviceTopologyNode,
};

function Topology() {
  const {
    data: devices,
    loading: devicesLoading,
    error: devicesError,
    refresh: refreshDevices,
  } = useDeviceHealth();

  const {
    links,
    loading: linksLoading,
    error: linksError,
    refresh: refreshLinks,
  } = useTopology();

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("All");

  const [typeFilter, setTypeFilter] =
    useState("All");

  const [
    selectedDeviceId,
    setSelectedDeviceId,
  ] = useState<number | null>(null);

  const deviceTypes = useMemo(
    () =>
      Array.from(
        new Set(
          devices.map(
            (device) =>
              device.device_type,
          ),
        ),
      ).sort(),
    [devices],
  );

  const filteredDevices =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return devices.filter(
        (device) => {
          const matchesSearch =
            normalizedSearch === "" ||
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

  const visibleDeviceIds =
    useMemo(
      () =>
        new Set(
          filteredDevices.map(
            (device) =>
              device.id,
          ),
        ),
      [filteredDevices],
    );

  const visibleLinks =
    useMemo(
      () =>
        links.filter(
          (link) =>
            visibleDeviceIds.has(
              link.source_device_id,
            ) &&
            visibleDeviceIds.has(
              link.target_device_id,
            ),
        ),
      [links, visibleDeviceIds],
    );

  const flowNodes =
    useMemo<DeviceFlowNode[]>(
      () =>
        createFlowNodes(
          filteredDevices,
          selectedDeviceId,
        ),
      [
        filteredDevices,
        selectedDeviceId,
      ],
    );

  const flowEdges =
    useMemo<Edge[]>(
      () =>
        createFlowEdges(
          visibleLinks,
        ),
      [visibleLinks],
    );

  const onlineCount =
    devices.filter(
      (device) =>
        device.status === "Online",
    ).length;

  const offlineCount =
    devices.filter(
      (device) =>
        device.status === "Offline",
    ).length;

  const pendingCount =
    devices.filter(
      (device) =>
        device.status === "Pending",
    ).length;

  const selectedDevice =
    devices.find(
      (device) =>
        device.id ===
        selectedDeviceId,
    ) ?? null;

  const handleRefresh = async () => {
    await Promise.all([
      refreshDevices(),
      refreshLinks(),
    ]);
  };

  const loading =
    devicesLoading ||
    linksLoading;

  const error =
    devicesError ||
    linksError;

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Infrastructure
              </p>

              <h1 className="mt-1 flex items-center gap-3 text-2xl font-bold tracking-tight">
                <Map className="h-6 w-6 text-cyan-400" />

                Ağ Topolojisi
              </h1>

              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Ağ cihazlarını ve gerçek
                cihaz bağlantılarını interaktif
                network graph üzerinde izleyin.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void handleRefresh()
              }
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium transition hover:border-slate-600 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <TopologySummaryCard
            title="Total Devices"
            value={devices.length}
            icon={
              <Network className="h-5 w-5" />
            }
            valueClass="text-slate-100"
          />

          <TopologySummaryCard
            title="Online"
            value={onlineCount}
            icon={
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            }
            valueClass="text-emerald-400"
          />

          <TopologySummaryCard
            title="Offline"
            value={offlineCount}
            icon={
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            }
            valueClass="text-red-400"
          />

          <TopologySummaryCard
            title="Pending"
            value={pendingCount}
            icon={
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            }
            valueClass="text-amber-400"
          />

          <TopologySummaryCard
            title="Connections"
            value={links.length}
            icon={
              <Router className="h-5 w-5" />
            }
            valueClass="text-cyan-400"
          />
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
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

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as StatusFilter,
                )
              }
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-cyan-500/40"
            >
              <option value="All">
                Tüm Durumlar
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
                Tüm Cihaz Tipleri
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
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/70">
            <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  Network Graph
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredDevices.length} cihaz
                  {" • "}
                  {visibleLinks.length} bağlantı
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                <Legend
                  color="bg-emerald-400"
                  label="Online"
                />

                <Legend
                  color="bg-red-400"
                  label="Offline"
                />

                <Legend
                  color="bg-amber-400"
                  label="Pending"
                />

                <Legend
                  color="bg-cyan-400"
                  label="Link Up"
                />
              </div>
            </div>

            <div className="h-[620px] bg-[#030712]">
              <ReactFlow
                nodes={flowNodes}
                edges={flowEdges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{
                  padding: 0.2,
                }}
                minZoom={0.25}
                maxZoom={2}
                onNodeClick={(
                  _event,
                  node,
                ) => {
                  setSelectedDeviceId(
                    Number(node.id),
                  );
                }}
                proOptions={{
                  hideAttribution:
                    true,
                }}
              >
                <Background
                  gap={24}
                  size={1}
                />

                <Controls
                  showInteractive={
                    false
                  }
                />

                <MiniMap
                  pannable
                  zoomable
                  nodeColor={(
                    node,
                  ) => {
                    const status =
                      (
                        node.data as DeviceNodeData
                      ).status;

                    if (
                      status ===
                      "Online"
                    ) {
                      return "#34d399";
                    }

                    if (
                      status ===
                      "Offline"
                    ) {
                      return "#f87171";
                    }

                    return "#fbbf24";
                  }}
                  style={{
                    background:
                      "#080d1d",
                    border:
                      "1px solid #1e293b",
                    borderRadius:
                      "10px",
                  }}
                  maskColor="rgba(3, 7, 18, 0.75)"
                  nodeStrokeColor="#0f172a"
                  nodeStrokeWidth={1}
                />
              </ReactFlow>
            </div>
          </section>

          <SelectedDevicePanel
            device={selectedDevice}
            links={links}
          />
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Connection Inventory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Veritabanındaki gerçek topology
                bağlantıları
              </p>
            </div>

            <Network className="h-5 w-5 text-cyan-400" />
          </div>

          {links.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed border-slate-800 px-5 py-10 text-center">
              <Network className="mx-auto h-8 w-8 text-slate-700" />

              <p className="mt-3 text-sm text-slate-400">
                Henüz topology bağlantısı
                bulunmuyor.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {links.map(
                (link) => {
                  const source =
                    devices.find(
                      (device) =>
                        device.id ===
                        link.source_device_id,
                    );

                  const target =
                    devices.find(
                      (device) =>
                        device.id ===
                        link.target_device_id,
                    );

                  return (
                    <ConnectionCard
                      key={link.id}
                      sourceName={
                        source?.hostname ??
                        `Device #${link.source_device_id}`
                      }
                      targetName={
                        target?.hostname ??
                        `Device #${link.target_device_id}`
                      }
                      linkType={
                        link.link_type
                      }
                      status={
                        link.status
                      }
                    />
                  );
                },
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-4">
          <div className="flex gap-3">
            <Network className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

            <div>
              <p className="text-sm font-medium text-slate-300">
                Topology verisi gerçek bağlantılardan
                geliyor
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Graf üzerindeki bağlantılar
                PostgreSQL içindeki device_links
                tablosundan alınır. Yeni bağlantılar
                backend API üzerinden eklendiğinde
                topology otomatik olarak güncellenir.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function DeviceTopologyNode({
  data,
}: NodeProps<DeviceFlowNode>) {
  const isRouter =
    data.deviceType
      .toLowerCase()
      .includes("router");

  return (
    <div
      className={`min-w-[245px] rounded-xl border bg-[#080d1d] px-4 py-3 shadow-xl ${
        data.status ===
        "Online"
          ? "border-emerald-500/30"
          : data.status ===
              "Offline"
            ? "border-red-500/25"
            : "border-amber-500/25"
      }`}
    >
      <Handle
        type="target"
        position={
          Position.Left
        }
        className="!h-2.5 !w-2.5 !border-2 !border-slate-950 !bg-cyan-400"
      />

      <Handle
        type="source"
        position={
          Position.Right
        }
        className="!h-2.5 !w-2.5 !border-2 !border-slate-950 !bg-cyan-400"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
              isRouter
                ? "bg-violet-500/10 text-violet-400"
                : "bg-cyan-500/10 text-cyan-400"
            }`}
          >
            {isRouter ? (
              <Router className="h-4 w-4" />
            ) : (
              <Server className="h-4 w-4" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-100">
              {data.hostname}
            </p>

            <p className="mt-1 font-mono text-[10px] text-slate-500">
              {data.ipAddress}
            </p>
          </div>
        </div>

        <span
          className={`mt-1 h-2.5 w-2.5 rounded-full ${statusDot(
            data.status,
          )}`}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniMetric
          label="CPU"
          value={formatPercent(
            data.cpu,
          )}
        />

        <MiniMetric
          label="RAM"
          value={formatPercent(
            data.ram,
          )}
        />

        <MiniMetric
          label="Latency"
          value={
            data.latency ===
            null
              ? "-"
              : `${data.latency.toFixed(1)}ms`
          }
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <StatusBadge
          status={data.status}
        />

        <span className="text-[10px] text-slate-600">
          {data.location}
        </span>
      </div>
    </div>
  );
}

function createFlowNodes(
  devices: DeviceHealth[],
  selectedDeviceId: number | null,
): DeviceFlowNode[] {
  const columns = Math.max(
    1,
    Math.ceil(
      Math.sqrt(
        devices.length,
      ),
    ),
  );

  return devices.map(
    (device, index) => {
      const column =
        index % columns;

      const row =
        Math.floor(
          index / columns,
        );

      return {
        id: String(
          device.id,
        ),

        type: "device",

        position: {
          x: column * 330,
          y: row * 220,
        },

        data: {
          hostname:
            device.hostname,

          ipAddress:
            device.ip_address,

          status:
            device.status,

          deviceType:
            device.device_type,

          location:
            device.location,

          cpu:
            device.cpu_usage,

          ram:
            device.ram_usage,

          disk:
            device.disk_usage_percent,

          latency:
            device.latency_ms,
        },

        className:
          device.id ===
          selectedDeviceId
            ? "ring-2 ring-cyan-400/50 rounded-xl"
            : "",
      };
    },
  );
}

function createFlowEdges(
  links: {
    id: number;
    source_device_id: number;
    target_device_id: number;
    link_type: string;
    status: string;
  }[],
): Edge[] {
  return links.map(
    (link) => {
      const isUp =
        link.status.toLowerCase() ===
        "up";

      return {
        id: String(
          link.id,
        ),

        source: String(
          link.source_device_id,
        ),

        target: String(
          link.target_device_id,
        ),

        type: "smoothstep",

        animated: isUp,

        label: link.link_type,

        style: {
          stroke: isUp
            ? "#22d3ee"
            : "#64748b",

          strokeWidth: isUp
            ? 2.5
            : 1.5,
        },

        labelStyle: {
          fill: "#94a3b8",
          fontSize: 10,
        },

        labelBgStyle: {
          fill: "#080d1d",
          fillOpacity: 0.9,
        },

        markerEnd: {
          type:
            MarkerType.ArrowClosed,

          color: isUp
            ? "#22d3ee"
            : "#64748b",
        },
      };
    },
  );
}

interface SelectedDevicePanelProps {
  device: DeviceHealth | null;
  links: {
    source_device_id: number;
    target_device_id: number;
    link_type: string;
    status: string;
  }[];
}

function SelectedDevicePanel({
  device,
  links,
}: SelectedDevicePanelProps) {
  if (!device) {
    return (
      <section className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-6">
        <div className="grid min-h-64 place-items-center text-center">
          <div>
            <Network className="mx-auto h-8 w-8 text-slate-700" />

            <p className="mt-4 text-sm font-medium text-slate-400">
              Cihaz seçin
            </p>

            <p className="mt-1 text-xs text-slate-600">
              Network graph üzerinden bir cihaz
              seçtiğinizde detayları burada
              görüntülenir.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const deviceLinks =
    links.filter(
      (link) =>
        link.source_device_id ===
          device.id ||
        link.target_device_id ===
          device.id,
    );

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Selected Device
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-100">
            {device.hostname}
          </h2>

          <p className="mt-1 font-mono text-[11px] text-slate-500">
            {device.ip_address}
          </p>
        </div>

        <StatusBadge
          status={device.status}
        />
      </div>

      <div className="mt-5 space-y-3">
        <SelectedMetric
          icon={
            <Cpu className="h-4 w-4" />
          }
          label="CPU Usage"
          value={formatPercent(
            device.cpu_usage,
          )}
        />

        <SelectedMetric
          icon={
            <Activity className="h-4 w-4" />
          }
          label="RAM Usage"
          value={formatPercent(
            device.ram_usage,
          )}
        />

        <SelectedMetric
          icon={
            <HardDrive className="h-4 w-4" />
          }
          label="Disk Usage"
          value={formatPercent(
            device.disk_usage_percent,
          )}
        />

        <SelectedMetric
          icon={
            <Network className="h-4 w-4" />
          }
          label="Latency"
          value={
            device.latency_ms ===
            null
              ? "-"
              : `${device.latency_ms.toFixed(1)} ms`
          }
        />

        <SelectedMetric
          icon={
            <CircleGauge className="h-4 w-4" />
          }
          label="Packet Loss"
          value={
            device.packet_loss ===
            null
              ? "-"
              : `${device.packet_loss.toFixed(1)}%`
          }
        />
      </div>

      <div className="mt-5 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Connections
          </p>

          <span className="text-xs font-semibold text-cyan-400">
            {deviceLinks.length}
          </span>
        </div>

        {deviceLinks.length ===
        0 ? (
          <p className="mt-3 text-xs text-slate-600">
            Bu cihaz için topology bağlantısı
            bulunmuyor.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {deviceLinks.map(
              (link, index) => {
                const isSource =
                  link.source_device_id ===
                  device.id;

                const otherDeviceId =
                  isSource
                    ? link.target_device_id
                    : link.source_device_id;

                return (
                  <div
                    key={`${link.source_device_id}-${link.target_device_id}-${index}`}
                    className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-300">
                        {isSource
                          ? "→"
                          : "←"}{" "}
                        Device #
                        {otherDeviceId}
                      </span>

                      <span
                        className={`text-[10px] ${
                          link.status.toLowerCase() ===
                          "up"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {link.status}
                      </span>
                    </div>

                    <p className="mt-1 text-[10px] text-slate-600">
                      {link.link_type}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>

      <Link
        to={`/devices/${device.id}`}
        className="mt-5 flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-cyan-500/30 hover:text-cyan-300"
      >
        Cihaz detayını aç
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}

function ConnectionCard({
  sourceName,
  targetName,
  linkType,
  status,
}: {
  sourceName: string;
  targetName: string;
  linkType: string;
  status: string;
}) {
  const isUp =
    status.toLowerCase() ===
    "up";

  return (
    <article className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-slate-200">
            {sourceName}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-600">
            Source
          </p>
        </div>

        <ArrowRight
          className={`h-4 w-4 shrink-0 ${
            isUp
              ? "text-cyan-400"
              : "text-slate-600"
          }`}
        />

        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-xs font-medium text-slate-200">
            {targetName}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-600">
            Target
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] text-slate-500">
          {linkType}
        </span>

        <span
          className={`text-[10px] font-medium ${
            isUp
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          ● {status}
        </span>
      </div>
    </article>
  );
}

interface TopologySummaryCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  valueClass: string;
}

function TopologySummaryCard({
  title,
  value,
  icon,
  valueClass,
}: TopologySummaryCardProps) {
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

function SelectedMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-3">
      <div className="flex items-center gap-2">
        <span className="text-slate-600">
          {icon}
        </span>

        <span className="text-xs text-slate-400">
          {label}
        </span>
      </div>

      <span className="font-mono text-xs font-medium text-slate-200">
        {value}
      </span>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md bg-slate-900/80 px-2 py-2">
      <p className="text-[9px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 font-mono text-[11px] text-slate-300">
        {value}
      </p>
    </div>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${color}`}
      />

      {label}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: DeviceStatus;
}) {
  if (status === "Online") {
    return (
      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">
        ● Online
      </span>
    );
  }

  if (status === "Offline") {
    return (
      <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-medium text-red-300">
        ● Offline
      </span>
    );
  }

  return (
    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-300">
      ● Pending
    </span>
  );
}

function statusDot(
  status: DeviceStatus,
): string {
  if (status === "Online") {
    return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]";
  }

  if (status === "Offline") {
    return "bg-red-400";
  }

  return "bg-amber-400";
}

function formatPercent(
  value: number | null,
): string {
  if (value === null) {
    return "-";
  }

  return `${value.toFixed(1)}%`;
}

export default Topology;