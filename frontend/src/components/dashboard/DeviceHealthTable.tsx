import type { DeviceHealth } from "../../types/device";

interface DeviceHealthTableProps {
  devices: DeviceHealth[];
  selectedDeviceId: number | null;
  onSelectDevice: (
    deviceId: number,
  ) => void;
}

function DeviceHealthTable({
  devices,
  selectedDeviceId,
  onSelectDevice,
}: DeviceHealthTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
      <div className="flex flex-col gap-2 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Device Health
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Cihazların son monitoring değerleri
          </p>
        </div>

        <span className="text-xs text-slate-500">
          {devices.length} cihaz
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1050px] w-full text-left">
          <thead className="border-b border-slate-800 bg-slate-950/50">
            <tr>
              <TableHeader>Cihaz</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>CPU</TableHeader>
              <TableHeader>RAM</TableHeader>
              <TableHeader>Disk</TableHeader>
              <TableHeader>Latency</TableHeader>
              <TableHeader>Packet Loss</TableHeader>
              <TableHeader>Uptime</TableHeader>
            </tr>
          </thead>

          <tbody>
            {devices.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  Cihaz sağlık verisi bulunamadı.
                </td>
              </tr>
            ) : (
              devices.map((device) => {
                const isSelected =
                  device.id ===
                  selectedDeviceId;

                return (
                  <tr
                    key={device.id}
                    onClick={() =>
                      onSelectDevice(device.id)
                    }
                    className={`cursor-pointer border-b border-slate-800/80 transition ${
                      isSelected
                        ? "bg-cyan-500/5"
                        : "hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 rounded-full ${deviceStatusColor(
                            device.status,
                          )}`}
                        />

                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {device.hostname}
                          </p>

                          <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                            {device.ip_address}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        status={device.status}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <MetricValue
                        value={device.cpu_usage}
                        unit="%"
                        warning={
                          device.cpu_usage !== null &&
                          device.cpu_usage >= 80
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <MetricValue
                        value={device.ram_usage}
                        unit="%"
                        warning={
                          device.ram_usage !== null &&
                          device.ram_usage >= 80
                        }
                      />
                    </td>

                    <td className="px-5 py-4">
                      <MetricValue
                        value={
                          device.disk_usage_percent
                        }
                        unit="%"
                        warning={
                          device.disk_usage_percent !== null &&
                          device.disk_usage_percent >=
                            80
                        }
                        decimals={1}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <MetricValue
                        value={device.latency_ms}
                        unit=" ms"
                        warning={
                          device.latency_ms !== null &&
                          device.latency_ms >= 100
                        }
                        decimals={1}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <MetricValue
                        value={device.packet_loss}
                        unit="%"
                        warning={
                          device.packet_loss !== null &&
                          device.packet_loss >= 20
                        }
                        decimals={1}
                      />
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-400">
                      {formatUptime(
                        device.uptime_seconds,
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface TableHeaderProps {
  children: string;
}

function TableHeader({
  children,
}: TableHeaderProps) {
  return (
    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
}

interface MetricValueProps {
  value: number | null;
  unit: string;
  warning: boolean;
  decimals?: number;
}

function MetricValue({
  value,
  unit,
  warning,
  decimals = 0,
}: MetricValueProps) {
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

function deviceStatusColor(
  status: string,
): string {
  const normalized =
    status.toLowerCase();

  if (normalized === "online") {
    return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]";
  }

  if (normalized === "offline") {
    return "bg-red-400";
  }

  return "bg-amber-400";
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
    (seconds % 86400) / 3600,
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60,
  );

  if (days > 0) {
    return `${days}g ${hours}s`;
  }

  if (hours > 0) {
    return `${hours}s ${minutes}dk`;
  }

  return `${minutes}dk`;
}

export default DeviceHealthTable;