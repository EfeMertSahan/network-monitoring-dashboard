import type { Alert } from "../../types/alert";

interface ActiveAlertsPanelProps {
  alerts: Alert[];
  loading: boolean;
}

function ActiveAlertsPanel({
  alerts,
  loading,
}: ActiveAlertsPanelProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Active Alerts
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Çözülmemiş alarm kayıtları
          </p>
        </div>

        <div className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-300">
          {alerts.length}
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-sm text-slate-500">
          Alarmlar yükleniyor...
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
            ✓
          </div>

          <p className="mt-3 text-sm font-medium text-slate-300">
            Aktif alarm bulunmuyor
          </p>

          <p className="mt-1 text-xs text-slate-500">
            İzlenen cihazlarda şu anda açık alarm yok.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800">
          {alerts.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface AlertRowProps {
  alert: Alert;
}

function AlertRow({
  alert,
}: AlertRowProps) {
  return (
    <div className="px-5 py-4 transition hover:bg-slate-800/30">
      <div className="flex items-start gap-3">
        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${levelColor(
            alert.level,
          )}`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${levelBadge(
                alert.level,
              )}`}
            >
              {alert.level}
            </span>

            <span className="text-[11px] text-slate-500">
              #{alert.id}
            </span>

            <span className="text-[11px] text-slate-500">
              Device #{alert.device_id}
            </span>
          </div>

          <p className="mt-2 text-sm font-medium text-slate-200">
            {alert.message}
          </p>

          <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span>
              {alert.alert_type}
            </span>

            <span>
              {formatAlertDate(
                alert.created_at,
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function levelColor(
  level: string,
): string {
  switch (level.toLowerCase()) {
    case "critical":
      return "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.7)]";

    case "warning":
      return "bg-amber-400";

    case "info":
      return "bg-cyan-400";

    default:
      return "bg-slate-400";
  }
}

function levelBadge(
  level: string,
): string {
  switch (level.toLowerCase()) {
    case "critical":
      return "border-red-500/20 bg-red-500/10 text-red-300";

    case "warning":
      return "border-amber-500/20 bg-amber-500/10 text-amber-300";

    case "info":
      return "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";

    default:
      return "border-slate-500/20 bg-slate-500/10 text-slate-300";
  }
}

function formatAlertDate(
  value: string,
): string {
  return new Date(value).toLocaleString(
    "tr-TR",
    {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export default ActiveAlertsPanel;