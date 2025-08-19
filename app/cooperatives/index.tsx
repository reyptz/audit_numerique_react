import { useEffect, useState } from "react";
import { Cooperatives } from "../api";
import toast from "react-hot-toast";
import { useAuth } from "../store/auth";
import { useForm } from "react-hook-form";
import type { Cooperative } from "../models";

type Form = { nom: string; description: string };

export default function CooperativesPage() {
  const [rows, setRows] = useState<Cooperative[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCooperative, setSelectedCooperative] = useState<Cooperative | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const { user } = useAuth();
  const { register, handleSubmit, reset, setValue } = useForm<Form>();

  const fetchAll = () =>
    Cooperatives.list()
      .then(setRows)
      .catch((err) => setError("Failed to load cooperatives"));

  useEffect(() => {
    fetchAll();
  }, []);

  const onSubmit = async (data: Form) => {
    try {
      await Cooperatives.create({ ...data, admin: user?.id ?? null });
      toast.success("Coopérative créée !");
      reset({ nom: "", description: "" });
      fetchAll();
      setError(null);
    } catch {
      setError("Erreur lors de la création");
      toast.error("Erreur lors de la création");
    }
  };

  const handleEdit = async (data: Form) => {
    if (!selectedCooperative) return;
    try {
      const updatedCooperative = await Cooperatives.update(selectedCooperative.id, {
        ...data,
        admin: selectedCooperative.admin,
      });
      setRows(rows.map((row) => (row.id === selectedCooperative.id ? updatedCooperative : row)));
      setIsEditModalOpen(false);
      setSelectedCooperative(null);
      reset({ nom: "", description: "" });
      toast.success("Coopérative modifiée !");
      setError(null);
    } catch {
      setError("Erreur lors de la modification");
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = async () => {
    if (!selectedCooperative) return;
    try {
      await Cooperatives.remove(selectedCooperative.id);
      setRows(rows.filter((row) => row.id !== selectedCooperative.id));
      setIsDeleteModalOpen(false);
      setSelectedCooperative(null);
      toast.success("Coopérative supprimée !");
      setError(null);
    } catch {
      setError("Erreur lors de la suppression");
      toast.error("Erreur lors de la suppression");
    }
  };

  const openEditModal = (cooperative: Cooperative) => {
    setSelectedCooperative(cooperative);
    setValue("nom", cooperative.nom);
    setValue("description", cooperative.description);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (cooperative: Cooperative) => {
    setSelectedCooperative(cooperative);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Coopératives</h1>
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

      {user?.is_staff && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-8 grid md:grid-cols-3 gap-3"
        >
          <input
            {...register("nom", { required: true })}
            className="rounded-xl border px-3 py-2"
            placeholder="Nom"
          />
          <input
            {...register("description")}
            className="rounded-xl border px-3 py-2"
            placeholder="Description"
          />
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
              <th className="p-3">Nom</th>
              <th className="p-3">Description</th>
              <th className="p-3">Admin</th>
              {user?.is_staff && <th className="p-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr
                key={c.id}
                className="border-t border-neutral-200 dark:border-neutral-800"
              >
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.nom}</td>
                <td className="p-3">{c.description || "N/A"}</td>
                <td className="p-3">{c.admin ? `#${c.admin}` : "N/A"}</td>
                {user?.is_staff && (
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
                )}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  className="p-3 text-center"
                  colSpan={user?.is_staff ? 5 : 4}
                >
                  Aucune coopérative.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {rows.map((cooperative) => (
            <div
              key={cooperative.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
            >
              <h3 className="text-lg font-semibold">Coopérative #{cooperative.id}</h3>
              <p>
                <strong>Nom:</strong> {cooperative.nom}
              </p>
              <p>
                <strong>Description:</strong> {cooperative.description || "N/A"}
              </p>
              <p>
                <strong>Admin:</strong> {cooperative.admin ? `#${cooperative.admin}` : "N/A"}
              </p>
              <p>
                <strong>Date de création:</strong>{" "}
                {new Date(cooperative.date_creation).toLocaleDateString()}
              </p>
              {user?.is_staff && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => openEditModal(cooperative)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(cooperative)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {rows.length === 0 && (
            <div className="col-span-full text-center">Aucune coopérative.</div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCooperative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Modifier Coopérative #{selectedCooperative.id}
            </h2>
            <form
              onSubmit={handleSubmit(handleEdit)}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium">Nom</label>
                <input
                  {...register("nom", { required: true })}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  placeholder="Nom"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <input
                  {...register("description")}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  placeholder="Description"
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
      {isDeleteModalOpen && selectedCooperative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>
              Êtes-vous sûr de vouloir supprimer la coopérative #{selectedCooperative.id} (
              {selectedCooperative.nom}) ?
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