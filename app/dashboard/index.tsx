import { useEffect, useMemo, useState } from "react";
import { Cooperatives, CooperativeAPI, Membres, Cotisations } from "../api";
import { money } from "../lib/format";
import StatsCard from "../components/StatsCard";
import AggregatesBar from "../components/AggregatesBar";
import Select from "../components/Select";
import toast from "react-hot-toast";
import { connectAuditWS } from "../lib/ws";
import CoopStatsCard from "./CoopStatsCard";

export default function Dashboard() {
  const [coops, setCoops] = useState<{id:number; nom:string}[]>([]);
  const [coopId, setCoopId] = useState<number|''>('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    Cooperatives.list().then((d:any[]) => setCoops(d.map(c=>({id:c.id, nom:c.nom}))));
  }, []);

  useEffect(() => {
    const ws = connectAuditWS((m) => {
      if (m?.type === "audit" && m?.message) toast(m.message, { icon: "🔔" });
    });
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (!coopId) return;
    setLoading(true);
    CooperativeAPI.statistiques(Number(coopId))
      .then(setStats)
      .catch(()=> toast.error("Impossible de charger les statistiques"))
      .finally(()=> setLoading(false));
  }, [coopId]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Cotisations",   value: Number(stats.total_cotisations || 0) },
      { name: "Prêts",         value: Number(stats.total_prets || 0) },
      { name: "Remboursements",value: Number(stats.total_remboursements || 0) },
      { name: "Solde",         value: Number(stats.solde || 0) },
    ];
  }, [stats]);

  const [newCotisation, setNewCotisation] = useState({ membreId: "", montant: "", type: "reguliere" as const });
  const [membres, setMembres] = useState<{id:number; utilisateur:number}[]>([]);

  useEffect(() => {
    if (!coopId) return;
    // Charger membres de la coop pour la saisie rapide de cotisation
    CooperativeAPI.membres(Number(coopId)).then((d:any[]) => setMembres(d));
  }, [coopId]);

  const submitCotisation = async () => {
    if (!newCotisation.membreId || !newCotisation.montant) return toast.error("Membre et montant requis");
    try {
      await Cotisations.create({
        membre: Number(newCotisation.membreId),
        montant: newCotisation.montant,
        type: newCotisation.type,
        statut: "en_attente",
      } as any);
      toast.success("Cotisation enregistrée");
      setNewCotisation({ membreId: "", montant: "", type: "reguliere" });
      // refresh stats
      if (coopId) {
        const s = await CooperativeAPI.statistiques(Number(coopId));
        setStats(s);
      }
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Select
          value={coopId}
          onChange={(v)=> setCoopId(v ? Number(v) : '')}
          options={coops.map(c=>({label:c.nom, value:c.id}))}
          placeholder="Choisir une coopérative"
        />
      </div>

      <CoopStatsCard coopId={1} />   {/* ou sélection dynamique */}
      {/* autres widgets… */}

      {!coopId && <p className="text-neutral-600">Sélectionnez une coopérative pour voir les statistiques.</p>}

      {coopId && (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatsCard label="Membres" value={stats?.nb_membres ?? (loading ? "…" : "0")} />
            <StatsCard label="Actifs" value={stats?.nb_membres_actifs ?? (loading ? "…" : "0")} />
            <StatsCard label="Cotisations" value={stats? money(stats.total_cotisations): (loading ? "…" : money(0))} />
            <StatsCard label="Solde" value={stats? money(stats.solde): (loading ? "…" : money(0))} />
          </div>

          <AggregatesBar data={chartData} />

          <div className="mt-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <h2 className="font-semibold mb-3">Saisie rapide — Cotisation</h2>
            <div className="grid md:grid-cols-4 gap-3">
              <Select
                value={newCotisation.membreId}
                onChange={(v)=> setNewCotisation(s=>({ ...s, membreId: v }))}
                options={membres.map(m=>({ label:`Membre #${m.id}`, value:m.id }))}
                placeholder="Membre"
              />
              <input className="rounded-xl border px-3 py-2 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
                     placeholder="Montant" value={newCotisation.montant}
                     onChange={e=> setNewCotisation(s=>({ ...s, montant: e.target.value }))}/>
              <Select
                value={newCotisation.type}
                onChange={(v)=> setNewCotisation(s=>({ ...s, type: v }))}
                options={[
                  {label:'Régulière', value:'reguliere'},
                  {label:'Exceptionnelle', value:'exceptionnelle'},
                  {label:'Solidarité', value:'solidarite'}
                ]}
                placeholder="Type"
              />
              <button onClick={submitCotisation}
                className="rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700">
                Enregistrer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}