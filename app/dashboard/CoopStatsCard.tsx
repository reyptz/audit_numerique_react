// app/dashboard/CoopStatsCard.tsx
import { useEffect, useState } from "react";
import { CooperativeAPI } from "../api";
import type { CoopStats } from "../models";

export default function CoopStatsCard({ coopId }: { coopId: number }) {
  const [stats, setStats] = useState<CoopStats | null>(null);

  useEffect(() => {
    CooperativeAPI.statistiques(coopId).then(setStats);
  }, [coopId]);

  if (!stats) return null;

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
      <h3 className="font-semibold mb-4">Statistiques coopérative #{coopId}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <Stat label="Membres" value={stats.nb_membres} />
        <Stat label="Membres actifs" value={stats.nb_membres_actifs} />
        <Stat label="Cotisations (CFA)" value={stats.total_cotisations} />
        <Stat label="Prêts (CFA)" value={stats.total_prets} />
        <Stat label="Remboursements (CFA)" value={stats.total_remboursements} />
        <Stat label="Solde (CFA)" value={stats.solde} accent />
      </div>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: any; accent?: boolean }) {
  return (
    <div>
      <div className="text-neutral-500">{label}</div>
      <div className={`text-lg font-medium ${accent ? "text-brand-700 dark:text-brand-400" : ""}`}>{value}</div>
    </div>
  );
}
