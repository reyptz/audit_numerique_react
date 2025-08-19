import { useEffect, useMemo, useState } from "react";
import { Cooperatives, CooperativeAPI, Membres, Cotisations } from "../api";
import { money } from "../lib/format";
import StatsCard from "../components/StatsCard";
import AggregatesBar from "../components/AggregatesBar";
import Select from "../components/Select";
import toast from "react-hot-toast";
import { connectAuditWS } from "../lib/ws";
import CoopStatsCard from "./CoopStatsCard";
import { useForm } from "react-hook-form";
import type { Cotisation, TypeCotisation } from "../models";

type CotisationForm = { membreId: string; montant: string; type: TypeCotisation };

export default function Dashboard() {
  const [coops, setCoops] = useState<{ id: number; nom: string }[]>([]);
  const [coopId, setCoopId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [membres, setMembres] = useState<{ id: number; utilisateur: number }[]>([]);
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCotisation, setSelectedCotisation] = useState<Cotisation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const { register, handleSubmit, reset, setValue } = useForm<CotisationForm>({
    defaultValues: { membreId: "", montant: "", type: "reguliere" },
  });

  useEffect(() => {
    Cooperatives.list()
      .then((d: any[]) => setCoops(d.map((c) => ({ id: c.id, nom: c.nom }))))
      .catch(() => setError("Erreur lors du chargement des coopératives"));
  }, []);

  useEffect(() => {
    const ws = connectAuditWS((m) => {
      if (m?.type === "audit" && m?.message) toast(m.message, { icon: "🔔" });
    });
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (!coopId) {
      setStats(null);
      setMembres([]);
      setCotisations([]);
      return;
    }
    setLoading(true);
    Promise.all([
      CooperativeAPI.statistiques(Number(coopId)).then(setStats),
      CooperativeAPI.membres(Number(coopId)).then(setMembres),
      Cotisations.list({ membre__cooperative: Number(coopId) }).then(setCotisations),
    ])
      .catch(() => {
        setError("Erreur lors du chargement des données");
        toast.error("Impossible de charger les statistiques");
      })
      .finally(() => setLoading(false));
  }, [coopId]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Cotisations", value: Number(stats.total_cotisations || 0) },
      { name: "Prêts", value: Number(stats.total_prets || 0) },
      { name: "Remboursements", value: Number(stats.total_remboursements || 0) },
      { name: "Solde", value: Number(stats.solde || 0) },
    ];
  }, [stats]);

  const onSubmit = async (data: CotisationForm) => {
    try {
      const newCotisation = await Cotisations.create({
        membre: Number(data.membreId),
        montant: data.montant,
        type: data.type,
        statut: "en_attente",
      });
      setCotisations([...cotisations, newCotisation]);
      reset({ membreId: "", montant: "", type: "reguliere" });
      setIsAddModalOpen(false);
      toast.success("Cotisation enregistrée");
      // Refresh stats
      if (coopId) {
        const s = await CooperativeAPI.statistiques(Number(coopId));
        setStats(s);
      }
      setError(null);
    } catch {
      setError("Erreur lors de l'enregistrement de la cotisation");
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleEdit = async (data: CotisationForm) => {
    if (!selectedCotisation) return;
    try {
      const updatedCotisation = await Cotisations.update(selectedCotisation.id, {
        membre: Number(data.membreId),
        montant: data.montant,
        type: data.type,
        statut: selectedCotisation.statut,
      });
      setCotisations(cotisations.map((c) => (c.id === selectedCotisation.id ? updatedCotisation : c)));
      setIsEditModalOpen(false);
      setSelectedCotisation(null);
      reset({ membreId: "", montant: "", type: "reguliere" });
      toast.success("Cotisation modifiée");
      // Refresh stats
      if (coopId) {
        const s = await CooperativeAPI.statistiques(Number(coopId));
        setStats(s);
      }
      setError(null);
    } catch {
      setError("Erreur lors de la modification de la cotisation");
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = async () => {
    if (!selectedCotisation) return;
    try {
      await Cotisations.remove(selectedCotisation.id);
      setCotisations(cotisations.filter((c) => c.id !== selectedCotisation.id));
      setIsDeleteModalOpen(false);
      setSelectedCotisation(null);
      toast.success("Cotisation supprimée");
      // Refresh stats
      if (coopId) {
        const s = await CooperativeAPI.statistiques(Number(coopId));
        setStats(s);
      }
      setError(null);
    } catch {
      setError("Erreur lors de la suppression de la cotisation");
      toast.error("Erreur lors de la suppression");
    }
  };

  const openEditModal = (cotisation: Cotisation) => {
    setSelectedCotisation(cotisation);
    setValue("membreId", String(cotisation.membre));
    setValue("montant", cotisation.montant);
    setValue("type", cotisation.type);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (cotisation: Cotisation) => {
    setSelectedCotisation(cotisation);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Select
          value={coopId}
          onChange={(v) => setCoopId(v ? Number(v) : "")}
          options={coops.map((c) => ({ label: c.nom, value: c.id }))}
          placeholder="Choisir une coopérative"
        />
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {!coopId && <p className="text-neutral-600">Sélectionnez une coopérative pour voir les statistiques.</p>}

      {coopId && (
        <>
          <CoopStatsCard coopId={Number(coopId)} />

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <StatsCard label="Membres" value={stats?.nb_membres ?? (loading ? "…" : "0")} />
            <StatsCard label="Actifs" value={stats?.nb_membres_actifs ?? (loading ? "…" : "0")} />
            <StatsCard
              label="Cotisations"
              value={stats ? money(stats.total_cotisations) : loading ? "…" : money(0)}
            />
            <StatsCard label="Solde" value={stats ? money(stats.solde) : loading ? "…" : money(0)} />
          </div>

          <AggregatesBar data={chartData} />

          <div className="mt-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold">Saisie rapide — Cotisation</h2>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Ajouter
              </button>
            </div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Cotisations récentes</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 rounded ${
                    viewMode === "table" ? "bg-blue-500 text-white" : "bg-gray-300"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-3 py-1 rounded ${
                    viewMode === "card" ? "bg-blue-500 text-white" : "bg-gray-300"
                  }`}
                >
                  Card
                </button>
              </div>
            </div>
            {viewMode === "table" && (
              <table className="w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
                <thead className="bg-neutral-50 dark:bg-neutral-900">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Membre</th>
                    <th className="p-3">Montant</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cotisations.map((c) => (
                    <tr key={c.id} className="border-t border-neutral-200 dark:border-neutral-800">
                      <td className="p-3">{c.id}</td>
                      <td className="p-3">#{c.membre}</td>
                      <td className="p-3">{money(c.montant)}</td>
                      <td className="p-3">{c.type}</td>
                      <td className="p-3">{new Date(c.date_paiement).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(c)}
                            className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(c)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {cotisations.length === 0 && (
                    <tr>
                      <td className="p-3" colSpan={6}>
                        Aucune cotisation récente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
            {viewMode === "card" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cotisations.map((c) => (
                  <div
                    key={c.id}
                    className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
                  >
                    <h3 className="text-lg font-semibold">Cotisation #{c.id}</h3>
                    <p><strong>Membre:</strong> #{c.membre}</p>
                    <p><strong>Montant:</strong> {money(c.montant)}</p>
                    <p><strong>Type:</strong> {c.type}</p>
                    <p><strong>Date:</strong> {new Date(c.date_paiement).toLocaleDateString()}</p>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(c)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {cotisations.length === 0 && <p className="col-span-full text-center">Aucune cotisation récente.</p>}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Ajouter Cotisation</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Membre</label>
                <Select
                  onChange={(v) => setValue("membreId", v)}
                  options={membres.map((m) => ({ label: `Membre #${m.id}`, value: m.id }))}
                  placeholder="Membre"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Montant</label>
                <input
                  {...register("montant", { required: true })}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  placeholder="Montant"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Type</label>
                <Select
                  onChange={(v) => setValue("type", v as TypeCotisation)}
                  options={[
                    { label: "Régulière", value: "reguliere" },
                    { label: "Exceptionnelle", value: "exceptionnelle" },
                    { label: "Solidarité", value: "solidarite" },
                  ]}
                  placeholder="Type"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCotisation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Modifier Cotisation #{selectedCotisation.id}</h2>
            <form onSubmit={handleSubmit(handleEdit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Membre</label>
                <Select
                  onChange={(v) => setValue("membreId", v)}
                  options={membres.map((m) => ({ label: `Membre #${m.id}`, value: m.id }))}
                  placeholder="Membre"
                  value={String(selectedCotisation.membre)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Montant</label>
                <input
                  {...register("montant", { required: true })}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  placeholder="Montant"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Type</label>
                <Select
                  onChange={(v) => setValue("type", v as TypeCotisation)}
                  options={[
                    { label: "Régulière", value: "reguliere" },
                    { label: "Exceptionnelle", value: "exceptionnelle" },
                    { label: "Solidarité", value: "solidarite" },
                  ]}
                  placeholder="Type"
                  value={selectedCotisation.type}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedCotisation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>
              Êtes-vous sûr de vouloir supprimer la cotisation #{selectedCotisation.id} (Membre #{selectedCotisation.membre}) ?
            </p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}