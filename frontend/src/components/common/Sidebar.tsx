import {
  Activity,
  Bell,
  ChevronLeft,
  Gauge,
  LayoutDashboard,
  Network,
  Settings,
  Server,
} from "lucide-react";
import { NavLink } from "react-router";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Devices",
    path: "/devices",
    icon: Server,
  },
  {
    label: "Metrics",
    path: "/metrics",
    icon: Activity,
  },
  {
    label: "Alerts",
    path: "/alerts",
    icon: Bell,
  },
  {
    label: "Topology",
    path: "/topology",
    icon: Network,
  },
];

function Sidebar({
  collapsed,
  onToggle,
}: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-800 bg-[#080d1c] transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        {!collapsed && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Network
            </p>

            <p className="text-sm font-semibold text-slate-100">
              Monitor
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
          aria-label="Menüyü küçült"
        >
          <ChevronLeft
            className={`h-4 w-4 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-300"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />

                {!collapsed && (
                  <span>{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800/70 hover:text-slate-100"
        >
          <Settings className="h-4 w-4 shrink-0" />

          {!collapsed && (
            <span>Ayarlar</span>
          )}
        </button>

        {!collapsed && (
          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

              <span className="text-xs font-medium text-emerald-300">
                Monitoring Live
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;