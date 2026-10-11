import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DeviceStatusChartProps {
  total: number;
  online: number;
  offline: number;
  pending: number;
}

interface StatusItem {
  name: string;
  value: number;
  color: string;
}

function DeviceStatusChart({
  total,
  online,
  offline,
  pending,
}: DeviceStatusChartProps) {
  const data: StatusItem[] = [
    {
      name: "Online",
      value: online,
      color: "#34d399",
    },
    {
      name: "Offline",
      value: offline,
      color: "#fb7185",
    },
    {
      name: "Pending",
      value: pending,
      color: "#fbbf24",
    },
  ];

  const availability =
    total > 0
      ? (online / total) * 100
      : 0;

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Device Status
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            İzlenen cihazların mevcut durum dağılımı
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Availability
          </p>

          <p className="mt-1 text-lg font-bold text-emerald-400">
            {availability.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[220px_1fr]">
        <div className="relative h-52">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="82%"
                paddingAngle={3}
                stroke="none"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  color: "#e2e8f0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-100">
                {total}
              </p>

              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Total
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3">
          <StatusRow
            label="Online"
            value={online}
            total={total}
            color="bg-emerald-400"
          />

          <StatusRow
            label="Offline"
            value={offline}
            total={total}
            color="bg-rose-400"
          />

          <StatusRow
            label="Pending"
            value={pending}
            total={total}
            color="bg-amber-400"
          />
        </div>
      </div>
    </section>
  );
}

interface StatusRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
}

function StatusRow({
  label,
  value,
  total,
  color,
}: StatusRowProps) {
  const percentage =
    total > 0
      ? (value / total) * 100
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${color}`}
          />

          <span className="text-slate-400">
            {label}
          </span>
        </div>

        <span className="font-medium text-slate-200">
          {value}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

export default DeviceStatusChart;