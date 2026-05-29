import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  delta?: number | null;
  icon: LucideIcon;
  accent?: "default" | "success";
  children?: ReactNode;
}

export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
  accent = "default",
  children,
}: MetricCardProps) {
  const valueColor = accent === "success" ? "text-[#10B981]" : "text-[#F8FAFC]";
  return (
    <div className="card-glow rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#94A3B8]">
          {label}
        </p>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[rgba(99,102,241,0.10)] text-[#A78BFA]">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p
        className={`mt-3 font-[Geist] text-2xl font-bold leading-none tracking-[-0.025em] tabular-nums ${valueColor}`}
      >
        {value}
      </p>
      {typeof delta === "number" && (
        <p
          className={`mt-2 text-xs font-medium tabular-nums ${
            delta >= 0 ? "text-[#10B981]" : "text-[#EF4444]"
          }`}
        >
          {delta >= 0 ? "+" : ""}
          {delta}% vs ontem
        </p>
      )}
      {children}
    </div>
  );
}