import { useEffect, useState } from "react";
import { Cooperatives, Utilisateurs } from "../api";
import Select from "../components/Select";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { Cooperative, Utilisateur } from "../models";
import { useAuth } from "../store/auth";

type Form = {
  nom: string;
  description: string;
  admin: string;
};

export default function CooperativesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Cooperative[]>([]);
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCooperative, setSelectedCooperative] = useState<Cooperative | null>(null);
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
      nom: "",
      description: "",
      admin: "",
    },
  });

  const canManage = user?.is_staff;

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([Cooperatives.list().then(setRows), Utilisateurs.list().then(setUsers)])
      .catch(() => {
        setError("Erreur lors du chargement des données");
        toast.error("Erreur lors du chargement");
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
      await Cooperatives.create({
        nom: data.nom,
        description: data.description,
        admin: data.admin ? Number(data.admin) : null,
      });
      toast.success("Coopérative créée !");
      reset({ nom: "", description: "", admin: "" });
      setIsCreateModalOpen(false);
      fetchData();
      setError(null);
    } catch {
      setError("Erreur lors de la création de la coopérative");
      toast.error("Erreur lors de la création");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit: SubmitHandler<Form> = async (data) => {
    if (!canManage || !selectedCooperative) return;
    setIsLoading(true);
    try {
      const updatedCooperative = await Cooperatives.update(selectedCooperative.id, {
        nom: data.nom,
        description: data.description,
        admin: data.admin ? Number(data.admin) : null,
      });
      setRows(rows.map((row) => (row.id === selectedCooperative.id ? updatedCooperative : row)));
      setIsEditModalOpen(false);
      setSelectedCooperative(null);
      reset({ nom: "", description: "", admin: "" });
      toast.success("Coopérative modifiée !");
      setError(null);
    } catch {
      setError("Erreur lors de la modification de la coopérative");
      toast.error("Erreur lors de la modification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canManage || !selectedCooperative) return;
    setIsLoading(true);
    try {
      await Cooperatives.remove(selectedCooperative.id);
      setRows(rows.filter((row) => row.id !== selectedCooperative.id));
      setIsDeleteModalOpen(false);
      setSelectedCooperative(null);
      toast.success("Coopérative supprimée !");
      setError(null);
    } catch {
      setError("Erreur lors de la suppression de la coopérative");
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (cooperative: Cooperative) => {
    if (!canManage) {
      toast.error("Accès refusé");
      return;
    }
    setSelectedCooperative(cooperative);
    setValue("nom", cooperative.nom);
    setValue("description", cooperative.description);
    setValue("admin", cooperative.admin ? String(cooperative.admin) : "");
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (cooperative: Cooperative) => {
    if (!canManage) {
      toast.error("Accès refusé");
      return;
    }
    setSelectedCooperative(cooperative);
    setIsDeleteModalOpen(true);
  };

  if (!user) {
    return <p className="p-8 text-center">Connexion requise.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Coopératives</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 rounded ${viewMode === "table" ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`px-3 py-1 rounded ${viewMode === "card" ? "bg-blue-500 text-white" : "bg-gray-300"
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
              <th className="p-3">Nom</th>
              <th className="p-3">Description</th>
              <th className="p-3">Admin</th>
              <th className="p-3">Date de création</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.nom}</td>
                <td className="p-3">{c.description}</td>
                <td className="p-3">
                  {c.admin ? users.find((u) => u.id === c.admin)?.username || `#${c.admin}` : "N/A"}
                </td>
                <td className="p-3">{new Date(c.date_creation).toLocaleDateString()}</td>
                <td className="p-3">
                  {canManage && (
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
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-center" colSpan={6}>
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
                <strong>Description:</strong> {cooperative.description}
              </p>
              <p>
                <strong>Admin:</strong>{" "}
                {cooperative.admin ? users.find((u) => u.id === cooperative.admin)?.username || `#${cooperative.admin}` : "N/A"}
              </p>
              <p>
                <strong>Date de création:</strong> {new Date(cooperative.date_creation).toLocaleDateString()}
              </p>
              {canManage && (
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
          {rows.length === 0 && <div className="col-span-full text-center">Aucune coopérative.</div>}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Créer Coopérative</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Nom</label>
                <input
                  {...register("nom", { required: "Le nom est requis" })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${errors.nom ? "border-red-500" : ""}`}
                  placeholder="Nom"
                />
                {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  {...register("description", { required: "La description est requise" })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${errors.description ? "border-red-500" : ""}`}
                  placeholder="Description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Admin</label>
                <Select
                  onChange={(v) => setValue("admin", v)}
                  options={[{ label: "Aucun", value: "" }, ...users.map((u) => ({ label: `${u.username} (#${u.id})`, value: u.id }))]}
                  placeholder="Admin"
                />
                {errors.admin && <p className="text-red-500 text-sm mt-1">{errors.admin.message}</p>}
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
                  className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
      {isEditModalOpen && selectedCooperative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Modifier Coopérative #{selectedCooperative.id}</h2>
            <form onSubmit={handleSubmit(handleEdit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Nom</label>
                <input
                  {...register("nom", { required: "Le nom est requis" })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${errors.nom ? "border-red-500" : ""}`}
                  placeholder="Nom"
                />
                {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  {...register("description", { required: "La description est requise" })}
                  className={`w-full p-2 border rounded dark:bg-neutral-700 ${errors.description ? "border-red-500" : ""}`}
                  placeholder="Description"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Admin</label>
                <Select
                  onChange={(v) => setValue("admin", v)}
                  options={[{ label: "Aucun", value: "" }, ...users.map((u) => ({ label: `${u.username} (#${u.id})`, value: u.id }))]}
                  placeholder="Admin"
                  value={selectedCooperative.admin ? String(selectedCooperative.admin) : ""}
                />
                {errors.admin && <p className="text-red-500 text-sm mt-1">{errors.admin.message}</p>}
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
                  className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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
      {isDeleteModalOpen && selectedCooperative && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>Êtes-vous sûr de vouloir supprimer la coopérative #{selectedCooperative.id} ({selectedCooperative.nom}) ?</p>
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
                className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
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