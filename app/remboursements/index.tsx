import { useEffect, useState } from "react";
import { Remboursements, Prets } from "../api";
import Select from "../components/Select";
import toast from "react-hot-toast";
import { useAuth } from "../store/auth";
import { useForm } from "react-hook-form";
import type { Remboursement, MethodePaiement } from "../models";

type Form = { pretId: string; montant: string; methode_paiement: MethodePaiement };

export default function RemboursementsPage() {
  const [rows, setRows] = useState<Remboursement[]>([]);
  const [prets, setPrets] = useState<{ id: number; membre: number }[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRemboursement, setSelectedRemboursement] = useState<Remboursement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const { user } = useAuth();
  const { register, handleSubmit, setValue, reset } = useForm<Form>({
    defaultValues: { pretId: "", montant: "", methode_paiement: "especes" },
  });

  const fetchAll = () =>
    Remboursements.list()
      .then(setRows)
      .catch(() => setError("Erreur lors du chargement des remboursements"));

  const fetchPrets = () =>
    Prets.list()
      .then(setPrets)
      .catch(() => setError("Erreur lors du chargement des prêts"));

  useEffect(() => {
    fetchAll();
    fetchPrets();
  }, []);

  const onSubmit = async (data: Form) => {
    try {
      await Remboursements.create({
        pret: Number(data.pretId),
        montant: data.montant,
        methode_paiement: data.methode_paiement,
      });
      toast.success("Remboursement ajouté !");
      reset({ pretId: "", montant: "", methode_paiement: "especes" });
      fetchAll();
      setError(null);
    } catch {
      setError("Erreur lors de l'ajout du remboursement");
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleEdit = async (data: Form) => {
    if (!selectedRemboursement) return;
    try {
      const updatedRemboursement = await Remboursements.update(selectedRemboursement.id, {
        pret: Number(data.pretId),
        montant: data.montant,
        methode_paiement: data.methode_paiement,
      });
      setRows(
        rows.map((row) => (row.id === selectedRemboursement.id ? updatedRemboursement : row)),
      );
      setIsEditModalOpen(false);
      setSelectedRemboursement(null);
      reset({ pretId: "", montant: "", methode_paiement: "especes" });
      toast.success("Remboursement modifié !");
      setError(null);
    } catch {
      setError("Erreur lors de la modification du remboursement");
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = async () => {
    if (!selectedRemboursement) return;
    try {
      await Remboursements.remove(selectedRemboursement.id);
      setRows(rows.filter((row) => row.id !== selectedRemboursement.id));
      setIsDeleteModalOpen(false);
      setSelectedRemboursement(null);
      toast.success("Remboursement supprimé !");
      setError(null);
    } catch {
      setError("Erreur lors de la suppression du remboursement");
      toast.error("Erreur lors de la suppression");
    }
  };

  const openEditModal = (remboursement: Remboursement) => {
    setSelectedRemboursement(remboursement);
    setValue("pretId", String(remboursement.pret));
    setValue("montant", remboursement.montant);
    setValue("methode_paiement", remboursement.methode_paiement);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (remboursement: Remboursement) => {
    setSelectedRemboursement(remboursement);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Remboursements</h1>
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
          className="mb-8 grid md:grid-cols-3 gap-3"
        >
          <Select
            onChange={(v) => setValue("pretId", v)}
            placeholder="Prêt"
            options={prets.map((p) => ({ label: `#${p.id} (Membre #${p.membre})`, value: p.id }))}
          />
          <input
            {...register("montant", { required: true })}
            className="rounded-xl border px-3 py-2"
            placeholder="Montant"
          />
          <select
            {...register("methode_paiement", { required: true })}
            className="rounded-xl border px-3 py-2"
          >
            <option value="especes">Espèces</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="virement">Virement</option>
            <option value="autre">Autre</option>
          </select>
          <button className="rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700">
            Ajouter
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
              <th className="p-3">Prêt</th>
              <th className="p-3">Montant</th>
              <th className="p-3">Méthode</th>
              <th className="p-3">Date</th>
              {(user?.role === "tresorier" || user?.is_staff) && (
                <th className="p-3">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-t border-neutral-200 dark:border-neutral-800"
              >
                <td className="p-3">{r.id}</td>
                <td className="p-3">#{r.pret}</td>
                <td className="p-3">{r.montant}</td>
                <td className="p-3">{r.methode_paiement}</td>
                <td className="p-3">{new Date(r.date_paiement).toLocaleDateString()}</td>
                {(user?.role === "tresorier" || user?.is_staff) && (
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(r)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(r)}
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
                  colSpan={user?.role === "tresorier" || user?.is_staff ? 6 : 5}
                >
                  Aucun remboursement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {rows.map((remboursement) => (
            <div
              key={remboursement.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
            >
              <h3 className="text-lg font-semibold">Remboursement #{remboursement.id}</h3>
              <p>
                <strong>Prêt:</strong> #{remboursement.pret}
              </p>
              <p>
                <strong>Montant:</strong> {remboursement.montant}
              </p>
              <p>
                <strong>Méthode de paiement:</strong> {remboursement.methode_paiement}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(remboursement.date_paiement).toLocaleDateString()}
              </p>
              {(user?.role === "tresorier" || user?.is_staff) && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => openEditModal(remboursement)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(remboursement)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {rows.length === 0 && (
            <div className="col-span-full text-center">Aucun remboursement.</div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {(user?.role === "tresorier" || user?.is_staff) && isEditModalOpen && selectedRemboursement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Modifier Remboursement #{selectedRemboursement.id}
            </h2>
            <form
              onSubmit={handleSubmit(handleEdit)}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium">Prêt</label>
                <Select
                  onChange={(v) => setValue("pretId", v)}
                  placeholder="Prêt"
                  options={prets.map((p) => ({ label: `#${p.id} (Membre #${p.membre})`, value: p.id }))}
                  value={String(selectedRemboursement.pret)}
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
                <label className="block text-sm font-medium">Méthode de paiement</label>
                <select
                  {...register("methode_paiement", { required: true })}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                >
                  <option value="especes">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="virement">Virement</option>
                  <option value="autre">Autre</option>
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {(user?.role === "tresorier" || user?.is_staff) && isDeleteModalOpen && selectedRemboursement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>
              Êtes-vous sûr de vouloir supprimer le remboursement #{selectedRemboursement.id} (Prêt #
              {selectedRemboursement.pret}) ?
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