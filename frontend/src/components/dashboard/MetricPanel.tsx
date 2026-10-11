import type { ReactNode } from "react";

interface MetricPanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

function MetricPanel({
  title,
  subtitle,
  children,
}: MetricPanelProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-xl">
      <div className="border-b border-slate-800 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-100">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="p-4">
        {children}
      </div>
    </section>
  );
}

export default MetricPanel;