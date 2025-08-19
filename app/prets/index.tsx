import { useEffect, useState } from "react";
import { CooperativeAPI, Cooperatives, Prets } from "../api";
import Select from "../components/Select";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { Pret, Cooperative, Membre } from "../models";
import { useAuth } from "../store/auth";
import { money } from "../lib/format";

type Form = {
  cooperative: string;
  membre: string;
  montant: string;
  taux_interet: string;
  date_echeance: string;
  motif: string;
};

export default function PretsPage() {
  const { user } = useAuth();
  const [coops, setCoops] = useState<Cooperative[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [rows, setRows] = useState<Pret[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPret, setSelectedPret] = useState<Pret | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<Form>({
    defaultValues: {
      cooperative: "",
      membre: "",
      montant: "",
      taux_interet: "",
      date_echeance: "",
      motif: "",
    },
  });

  const canManage = user?.role === "tresorier";

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([Cooperatives.list().then(setCoops), Prets.list().then(setRows)])
      .catch(() => {
        setError("Erreur lors du chargement des données");
        toast.error("Erreur lors du chargement");
      })
      .finally(() => setIsLoading(false));
  };

  const fetchMembres = (cooperativeId: string) => {
    if (!cooperativeId) {
      setMembres([]);
      return;
    }
    setIsLoading(true);
    CooperativeAPI.membres(Number(cooperativeId))
      .then(setMembres)
      .catch(() => {
        setError("Erreur lors du chargement des membres");
        toast.error("Erreur lors du chargement des membres");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit: SubmitHandler<Form> = async (data) => {
    if (!canManage) {
      toast.error("Accès refusé");
      return;
    }
    setIsLoading(true);
    try {
      await Prets.create({
        membre: Number(data.membre),
        montant: data.montant,
        taux_interet: data.taux_interet,
        date_echeance: data.date_echeance,
        motif: data.motif,
        statut: "demande",
      });
      toast.success("Prêt créé !");
      reset({ cooperative: "", membre: "", montant: "", taux_interet: "", date_echeance: "", motif: "" });
      setIsCreateModalOpen(false);
      fetchData();
      setError(null);
    } catch {
      setError("Erreur lors de la création du prêt");
      toast.error("Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit: SubmitHandler<Form> = async (data) => {
    if (!canManage || !selectedPret) return;
    setIsLoading(true);
    try {
      const updatedPret = await Prets.update(selectedPret.id, {
        membre: Number(data.membre),
        montant: data.montant,
        taux_interet: data.taux_interet,
        date_echeance: data.date_echeance,
        motif: data.motif,
        statut: selectedPret.statut,
      });
      setRows(rows.map((row) => (row.id === selectedPret.id ? updatedPret : row)));
      setIsEditModalOpen(false);
      setSelectedPret(null);
      reset({ cooperative: "", membre: "", montant: "", taux_interet: "", date_echeance: "", motif: "" });
      toast.success("Prêt modifié !");
      setError(null);
    } catch {
      setError("Erreur lors de la modification du prêt");
      toast.error("Erreur lors de la modification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canManage || !selectedPret) return;
    setIsLoading(true);
    try {
      await Prets.remove(selectedPret.id);
      setRows(rows.filter((row) => row.id !== selectedPret.id));
      setIsDeleteModalOpen(false);
      setSelectedPret(null);
      toast.success("Prêt supprimé !");
      setError(null);
    } catch {
      setError("Erreur lors de la suppression du prêt");
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (pret: Pret) => {
    if (!canManage) {
      toast.error("Accès refusé");
      return;
    }
    setSelectedPret(pret);
    const coop = membres.find((m) => m.id === pret.membre)?.cooperative;
    setValue("cooperative", String(coop || ""));
    fetchMembres(String(coop || ""));
    setValue("membre", String(pret.membre));
    setValue("montant", pret.montant);
    setValue("taux_interet", pret.taux_interet);
    setValue("date_echeance", pret.date_echeance || "");
    setValue("motif", pret.motif);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (pret: Pret) => {
    if (!canManage) {
      toast.error("Accès refusé");
      return;
    }
    setSelectedPret(pret);
    setIsDeleteModalOpen(true);
  };

  if (!user) {
    return <p className="p-8 text-center">Connexion requise.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Prêts</h1>
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
          {canManage && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              Créer
            </button>
          )}
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {isLoading && <p className="text-center text-neutral-500">Chargement...</p>}

      {viewMode === "table" && (
        <table className="w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3">Membre</th>
              <th className="p-3">Coopérative</th>
              <th className="p-3">Montant</th>
              <th className="p-3">Taux d’intérêt</th>
              <th className="p-3">Échéance</th>
              <th className="p-3">Motif</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="p-3">{p.id}</td>
                <td className="p-3">#{p.membre}</td>
                <td className="p-3">
                  {coops.find((c) => c.id === membres.find((m) => m.id === p.membre)?.cooperative)?.nom ||
                    `#${membres.find((m) => m.id === p.membre)?.cooperative || "N/A"}`}
                </td>
                <td className="p-3">{money(p.montant)}</td>
                <td className="p-3">{p.taux_interet}%</td>
                <td className="p-3">{p.date_echeance ? new Date(p.date_echeance).toLocaleDateString() : "N/A"}</td>
                <td className="p-3">{p.motif}</td>
                <td className="p-3">{p.statut}</td>
                <td className="p-3">
                  {canManage && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(p)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-center" colSpan={9}>
                  Aucun prêt.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {rows.map((pret) => (
            <div
              key={pret.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
            >
              <h3 className="text-lg font-semibold">Prêt #{pret.id}</h3>
              <p>
                <strong>Membre:</strong> #{pret.membre}
              </p>
              <p>
                <strong>Coopérative:</strong>{" "}
                {coops.find((c) => c.id === membres.find((m) => m.id === pret.membre)?.cooperative)?.nom ||
                  `#${membres.find((m) => m.id === pret.membre)?.cooperative || "N/A"}`}
              </p>
              <p>
                <strong>Montant:</strong> {money(pret.montant)}
              </p>
              <p>
                <strong>Taux d’intérêt:</strong> {pret.taux_interet}%
              </p>
              <p>
                <strong>Échéance:</strong>{" "}
                {pret.date_echeance ? new Date(pret.date_echeance).toLocaleDateString() : "N/A"}
              </p>
              <p>
                <strong>Motif:</strong> {pret.motif}
              </p>
              <p>
                <strong>Statut:</strong> {pret.statut}
              </p>
              {canManage && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => openEditModal(pret)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(pret)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {rows.length === 0 && <div className="col-span-full text-center">Aucun prêt.</div>}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Créer Prêt</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Coopérative</label>
                <Select
                  onChange={(v) => {
                    setValue("cooperative", v);
                    fetchMembres(v);
                  }}
                  options={coops.map((c) => ({ label: c.nom, value: c.id }))}
                  placeholder="Coopérative"
                />
                {errors.cooperative && (
                  <p className="text-red-500 text-sm mt-1">{errors.cooperative.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Membre</label>
                <Select
                  onChange={(v) => setValue("membre", v)}
                  options={membres.map((m) => ({ label: `Membre #${m.id}`, value: m.id }))}
                  placeholder="Membre"
                />
                {errors.membre && <p className="text-red-500 text-sm mt-1">{errors.membre.message}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Montant</label>
                <input
                  {...register("montant", {
                    required: "Le montant est requis",
                    pattern: { value: /^\d+(\.\d+)?$/, message: "Montant invalide" },
                  })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${
                    errors.montant ? "border-red-500" : ""
                  }`}
                  placeholder="Montant"
                />
                {errors.montant && <p className="text-red-500 text-sm mt-1">{errors.montant.message}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Taux d’intérêt (%)</label>
                <input
                  {...register("taux_interet", {
                    required: "Le taux est requis",
                    pattern: { value: /^\d+(\.\d+)?$/, message: "Taux invalide" },
                  })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${
                    errors.taux_interet ? "border-red-500" : ""
                  }`}
                  placeholder="Taux d’intérêt"
                />
                {errors.taux_interet && (
                  <p className="text-red-500 text-sm mt-1">{errors.taux_interet.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Date d’échéance</label>
                <input
                  type="date"
                  {...register("date_echeance", { required: "La date est requise" })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${
                    errors.date_echeance ? "border-red-500" : ""
                  }`}
                  placeholder="Date d’échéance"
                />
                {errors.date_echeance && (
                  <p className="text-red-500 text-sm mt-1">{errors.date_echeance.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Motif</label>
                <input
                  {...register("motif", { required: "Le motif est requis" })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${
                    errors.motif ? "border-red-500" : ""
                  }`}
                  placeholder="Motif"
                />
                {errors.motif && <p className="text-red-500 text-sm mt-1">{errors.motif.message}</p>}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedPret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Modifier Prêt #{selectedPret.id}</h2>
            <form onSubmit={handleSubmit(handleEdit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Coopérative</label>
                <Select
                  onChange={(v) => {
                    setValue("cooperative", v);
                    fetchMembres(v);
                  }}
                  options={coops.map((c) => ({ label: c.nom, value: c.id }))}
                  placeholder="Coopérative"
                  value={String(membres.find((m) => m.id === selectedPret.membre)?.cooperative || "")}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Membre</label>
                <Select
                  onChange={(v) => setValue("membre", v)}
                  options={membres.map((m) => ({ label: `Membre #${m.id}`, value: m.id }))}
                  placeholder="Membre"
                  value={String(selectedPret.membre)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Montant</label>
                <input
                  {...register("montant", {
                    required: "Le montant est requis",
                    pattern: { value: /^\d+(\.\d+)?$/, message: "Montant invalide" },
                  })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${
                    errors.montant ? "border-red-500" : ""
                  }`}
                  placeholder="Montant"
                />
                {errors.montant && <p className="text-red-500 text-sm mt-1">{errors.montant.message}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Taux d’intérêt (%)</label>
                <input
                  {...register("taux_interet", {
                    required: "Le taux est requis",
                    pattern: { value: /^\d+(\.\d+)?$/, message: "Taux invalide" },
                  })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${
                    errors.taux_interet ? "border-red-500" : ""
                  }`}
                  placeholder="Taux d’intérêt"
                />
                {errors.taux_interet && (
                  <p className="text-red-500 text-sm mt-1">{errors.taux_interet.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Date d’échéance</label>
                <input
                  type="date"
                  {...register("date_echeance", { required: "La date est requise" })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${
                    errors.date_echeance ? "border-red-500" : ""
                  }`}
                  placeholder="Date d’échéance"
                />
                {errors.date_echeance && (
                  <p className="text-red-500 text-sm mt-1">{errors.date_echeance.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Motif</label>
                <input
                  {...register("motif", { required: "Le motif est requis" })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${
                    errors.motif ? "border-red-500" : ""
                  }`}
                  placeholder="Motif"
                />
                {errors.motif && <p className="text-red-500 text-sm mt-1">{errors.motif.message}</p>}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedPret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>Êtes-vous sûr de vouloir supprimer le prêt #{selectedPret.id} (Membre #{selectedPret.membre}) ?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}