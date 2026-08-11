import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  positive = true,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
          <Icon size={20} />
        </span>
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              positive ? "text-success" : "text-danger"
            }`}
          >
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
