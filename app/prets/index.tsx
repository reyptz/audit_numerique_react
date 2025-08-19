import { useEffect, useState } from "react";
import { Prets, Membres } from "../api";
import Select from "../components/Select";
import toast from "react-hot-toast";
import { useAuth } from "../store/auth";
import { useForm } from "react-hook-form";
import type { Pret, StatutPret } from "../models";

// Money formatting function
export const money = (n: number | string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "XOF", maximumFractionDigits: 0 })
    .format(typeof n === "string" ? parseFloat(n) : n);

type Form = {
  membreId: string;
  montant: string;
  motif: string;
  taux_interet: string;
  date_echeance?: string;
  statut: StatutPret;
};

export default function PretsPage() {
  const [rows, setRows] = useState<Pret[]>([]);
  const [membres, setMembres] = useState<{ id: number; utilisateur: number }[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPret, setSelectedPret] = useState<Pret | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const { user } = useAuth();
  const { register, handleSubmit, setValue, reset } = useForm<Form>({
    defaultValues: {
      membreId: "",
      montant: "",
      motif: "",
      taux_interet: "",
      date_echeance: "",
      statut: "demande",
    },
  });

  const fetchAll = () =>
    Prets.list()
      .then(setRows)
      .catch(() => setError("Erreur lors du chargement des prêts"));

  const fetchMembres = () =>
    Membres.list()
      .then(setMembres)
      .catch(() => setError("Erreur lors du chargement des membres"));

  useEffect(() => {
    fetchAll();
    fetchMembres();
  }, []);

  const onSubmit = async (data: Form) => {
    try {
      await Prets.create({
        membre: Number(data.membreId),
        montant: data.montant,
        motif: data.motif,
        taux_interet: data.taux_interet,
        date_echeance: data.date_echeance || null,
        statut: data.statut,
      });
      toast.success("Prêt créé !");
      reset({
        membreId: "",
        montant: "",
        motif: "",
        taux_interet: "",
        date_echeance: "",
        statut: "demande",
      });
      fetchAll();
      setError(null);
    } catch {
      setError("Erreur lors de la création du prêt");
      toast.error("Erreur lors de la création");
    }
  };

  const handleEdit = async (data: Form) => {
    if (!selectedPret) return;
    try {
      const updatedPret = await Prets.update(selectedPret.id, {
        membre: Number(data.membreId),
        montant: data.montant,
        motif: data.motif,
        taux_interet: data.taux_interet,
        date_echeance: data.date_echeance || null,
        statut: data.statut,
      });
      setRows(rows.map((row) => (row.id === selectedPret.id ? updatedPret : row)));
      setIsEditModalOpen(false);
      setSelectedPret(null);
      reset({
        membreId: "",
        montant: "",
        motif: "",
        taux_interet: "",
        date_echeance: "",
        statut: "demande",
      });
      toast.success("Prêt modifié !");
      setError(null);
    } catch {
      setError("Erreur lors de la modification du prêt");
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = async () => {
    if (!selectedPret) return;
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
    }
  };

  const openEditModal = (pret: Pret) => {
    setSelectedPret(pret);
    setValue("membreId", String(pret.membre));
    setValue("montant", pret.montant);
    setValue("motif", pret.motif);
    setValue("taux_interet", pret.taux_interet);
    setValue("date_echeance", pret.date_echeance || "");
    setValue("statut", pret.statut);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (pret: Pret) => {
    setSelectedPret(pret);
    setIsDeleteModalOpen(true);
  };

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
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {(user?.role === "tresorier" || user?.is_staff) && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-8 grid md:grid-cols-4 gap-3"
        >
          <Select
            onChange={(v) => setValue("membreId", v)}
            placeholder="Membre"
            options={membres.map((m) => ({ label: `#${m.id} (Utilisateur #${m.utilisateur})`, value: m.id }))}
          />
          <input
            {...register("montant", { required: true })}
            className="rounded-xl border px-3 py-2"
            placeholder="Montant"
          />
          <input
            {...register("motif")}
            className="rounded-xl border px-3 py-2"
            placeholder="Motif"
          />
          <input
            {...register("taux_interet", { required: true })}
            className="rounded-xl border px-3 py-2"
            placeholder="Taux d'intérêt (%)"
          />
          <input
            {...register("date_echeance")}
            type="date"
            className="rounded-xl border px-3 py-2"
            placeholder="Date d'échéance"
          />
          <select
            {...register("statut", { required: true })}
            className="rounded-xl border px-3 py-2"
          >
            <option value="demande">Demande</option>
            <option value="approuve">Approuvé</option>
            <option value="rejete">Rejeté</option>
            <option value="en_cours">En cours</option>
            <option value="rembourse">Remboursé</option>
            <option value="en_retard">En retard</option>
          </select>
          <button className="rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700">
            Créer
          </button>
        </form>
      )}

      {viewMode === "table" && (
        <table
          className="w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
        >
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3">Membre</th>
              <th className="p-3">Montant</th>
              <th className="p-3">Taux d'intérêt</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Date de demande</th>
              {(user?.role === "tresorier" || user?.is_staff) && (
                <th className="p-3">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.id}
                className="border-t border-neutral-200 dark:border-neutral-800"
              >
                <td className="p-3">{p.id}</td>
                <td className="p-3">#{p.membre}</td>
                <td className="p-3">{money(p.montant)}</td>
                <td className="p-3">{p.taux_interet}%</td>
                <td className="p-3">{p.statut}</td>
                <td className="p-3">{new Date(p.date_demande).toLocaleDateString()}</td>
                {(user?.role === "tresorier" || user?.is_staff) && (
                  <td className="p-3">
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
                  </td>
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  className="p-3 text-center"
                  colSpan={user?.role === "tresorier" || user?.is_staff ? 7 : 6}
                >
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
                <strong>Montant:</strong> {money(pret.montant)}
              </p>
              <p>
                <strong>Taux d'intérêt:</strong> {pret.taux_interet}%
              </p>
              <p>
                <strong>Statut:</strong> {pret.statut}
              </p>
              <p>
                <strong>Date de demande:</strong>{" "}
                {new Date(pret.date_demande).toLocaleDateString()}
              </p>
              <p>
                <strong>Date d'échéance:</strong>{" "}
                {pret.date_echeance ? new Date(pret.date_echeance).toLocaleDateString() : "N/A"}
              </p>
              <p>
                <strong>Motif:</strong> {pret.motif || "N/A"}
              </p>
              {(user?.role === "tresorier" || user?.is_staff) && (
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
          {rows.length === 0 && (
            <div className="col-span-full text-center">Aucun prêt.</div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {(user?.role === "tresorier" || user?.is_staff) && isEditModalOpen && selectedPret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Modifier Prêt #{selectedPret.id}
            </h2>
            <form
              onSubmit={handleSubmit(handleEdit)}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium">Membre</label>
                <Select
                  onChange={(v) => setValue("membreId", v)}
                  placeholder="Membre"
                  options={membres.map((m) => ({ label: `#${m.id} (Utilisateur #${m.utilisateur})`, value: m.id }))}
                  value={String(selectedPret.membre)}
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
                <label className="block text-sm font-medium">Motif</label>
                <input
                  {...register("motif")}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  placeholder="Motif"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Taux d'intérêt (%)</label>
                <input
                  {...register("taux_interet", { required: true })}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  placeholder="Taux d'intérêt (%)"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Date d'échéance</label>
                <input
                  {...register("date_echeance")}
                  type="date"
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  placeholder="Date d'échéance"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Statut</label>
                <select
                  {...register("statut", { required: true })}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                >
                  <option value="demande">Demande</option>
                  <option value="approuve">Approuvé</option>
                  <option value="rejete">Rejeté</option>
                  <option value="en_cours">En cours</option>
                  <option value="rembourse">Remboursé</option>
                  <option value="en_retard">En retard</option>
                </select>
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
                  En salvaged Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {(user?.role === "tresorier" || user?.is_staff) && isDeleteModalOpen && selectedPret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>
              Êtes-vous sûr de vouloir supprimer le prêt #{selectedPret.id} (Membre #{selectedPret.membre}) ?
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