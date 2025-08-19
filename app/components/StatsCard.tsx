import type { ReactNode } from "react";
import { money, percent } from "../lib/format";

export default function StatsCard({ label, value, icon }: { label:string; value:string; icon?:ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

export function StatsCardWithIcon({ label, value, icon }: { label:string; value:string; icon:ReactNode }) {
  return (
    <StatsCard label={label} value={value} icon={icon} />
  );
}
