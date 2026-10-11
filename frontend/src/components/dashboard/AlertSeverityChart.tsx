import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface AlertSeverityChartProps {
  critical: number;
  warning: number;
  info: number;
}

interface AlertSeverityItem {
  name: string;
  value: number;
  color: string;
}

function AlertSeverityChart({
  critical,
  warning,
  info,
}: AlertSeverityChartProps) {
  const total =
    critical + warning + info;

  const data: AlertSeverityItem[] = [
    {
      name: "Critical",
      value: critical,
      color: "#ef4444",
    },
    {
      name: "Warning",
      value: warning,
      color: "#f59e0b",
    },
    {
      name: "Info",
      value: info,
      color: "#22d3ee",
    },
  ];

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Alert Severity
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Aktif alarm seviyelerinin dağılımı
          </p>
        </div>

        <div className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
          {total} aktif
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
                Alerts
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <AlertRow
            label="Critical"
            value={critical}
            total={total}
            color="bg-red-400"
            textColor="text-red-300"
          />

          <AlertRow
            label="Warning"
            value={warning}
            total={total}
            color="bg-amber-400"
            textColor="text-amber-300"
          />

          <AlertRow
            label="Info"
            value={info}
            total={total}
            color="bg-cyan-400"
            textColor="text-cyan-300"
          />
        </div>
      </div>
    </section>
  );
}

interface AlertRowProps {
  label: string;
  value: number;
  total: number;
  color: string;
  textColor: string;
}

function AlertRow({
  label,
  value,
  total,
  color,
  textColor,
}: AlertRowProps) {
  const percentage =
    total > 0
      ? (value / total) * 100
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${color}`}
          />

          <span
            className={`text-xs font-medium ${textColor}`}
          >
            {label}
          </span>
        </div>

        <span className="text-sm font-bold text-slate-100">
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

      <p className="mt-1 text-[10px] text-slate-600">
        {percentage.toFixed(1)}%
      </p>
    </div>
  );
}

export default AlertSeverityChart;