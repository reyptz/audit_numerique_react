import { useEffect, useState } from "react";
import { CooperativeAPI, Cooperatives, Membres, Utilisateurs } from "../api";
import Select from "../components/Select";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { Membre, Cooperative, Utilisateur } from "../models";
import { useAuth } from "../store/auth";

type Form = {
  utilisateur: string;
  cooperative: string;
  actif: boolean;
};

export default function MembresPage() {
  const { user } = useAuth();
  const [coops, setCoops] = useState<Cooperative[]>([]);
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [rows, setRows] = useState<Membre[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMembre, setSelectedMembre] = useState<Membre | null>(null);
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
    defaultValues: { utilisateur: "", cooperative: "", actif: true },
  });

  const canManage = user?.is_staff || user?.role === "tresorier";

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      Cooperatives.list().then((data) => {
        setCoops(data);
        if (data.length === 0) {
          setError("Aucune coopérative disponible. Veuillez en créer une d'abord.");
          toast.error("Aucune coopérative disponible");
        }
      }),
      Utilisateurs.list().then((data) => {
        setUsers(data);
        if (data.length === 0) {
          setError("Aucun utilisateur disponible. Veuillez en créer un d'abord.");
          toast.error("Aucun utilisateur disponible");
        }
      }),
      Membres.list().then(setRows),
    ])
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
    if (!data.cooperative || !data.utilisateur) {
      toast.error("Veuillez sélectionner un utilisateur et une coopérative");
      return;
    }
    setIsLoading(true);
    try {
      await Membres.create({
        utilisateur: Number(data.utilisateur),
        cooperative: Number(data.cooperative),
        actif: data.actif,
      });
      toast.success("Membre créé !");
      reset({ utilisateur: "", cooperative: "", actif: true });
      setIsCreateModalOpen(false);
      fetchData();
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(`Erreur lors de la création du membre : ${message}`);
      toast.error(`Erreur lors de la création : ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit: SubmitHandler<Form> = async (data) => {
    if (!canManage || !selectedMembre) return;
    if (!data.cooperative || !data.utilisateur) {
      toast.error("Veuillez sélectionner un utilisateur et une coopérative");
      return;
    }
    setIsLoading(true);
    try {
      const updatedMembre = await Membres.update(selectedMembre.id, {
        utilisateur: Number(data.utilisateur),
        cooperative: Number(data.cooperative),
        actif: data.actif,
      });
      setRows(rows.map((row) => (row.id === selectedMembre.id ? updatedMembre : row)));
      setIsEditModalOpen(false);
      setSelectedMembre(null);
      reset({ utilisateur: "", cooperative: "", actif: true });
      toast.success("Membre modifié !");
      setError(null);
    } catch {
      setError("Erreur lors de la modification du membre");
      toast.error("Erreur lors de la modification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canManage || !selectedMembre) return;
    setIsLoading(true);
    try {
      await Membres.remove(selectedMembre.id);
      setRows(rows.filter((row) => row.id !== selectedMembre.id));
      setIsDeleteModalOpen(false);
      setSelectedMembre(null);
      toast.success("Membre supprimé !");
      setError(null);
    } catch {
      setError("Erreur lors de la suppression du membre");
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (membre: Membre) => {
    if (!canManage) {
      toast.error("Accès refusé");
      return;
    }
    setSelectedMembre(membre);
    setValue("utilisateur", String(membre.utilisateur));
    setValue("cooperative", String(membre.cooperative));
    setValue("actif", membre.actif);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (membre: Membre) => {
    if (!canManage) {
      toast.error("Accès refusé");
      return;
    }
    setSelectedMembre(membre);
    setIsDeleteModalOpen(true);
  };

  if (!user) {
    return <p className="p-8 text-center">Connexion requise.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Membres</h1>
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
              className={`px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 ${
                coops.length === 0 || users.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={coops.length === 0 || users.length === 0}
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
              <th className="p-3">Utilisateur</th>
              <th className="p-3">Coopérative</th>
              <th className="p-3">Actif</th>
              <th className="p-3">Date d'adhésion</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-t border-neutral-200 dark:border-neutral-800">
                <td className="p-3">{m.id}</td>
                <td className="p-3">
                  {users.find((u) => u.id === m.utilisateur)?.username || `#${m.utilisateur}`}
                </td>
                <td className="p-3">{coops.find((c) => c.id === m.cooperative)?.nom || `#${m.cooperative}`}</td>
                <td className="p-3">{m.actif ? "Oui" : "Non"}</td>
                <td className="p-3">{new Date(m.date_adhesion).toLocaleDateString()}</td>
                <td className="p-3">
                  {canManage && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(m)}
                        className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteModal(m)}
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
                  Aucun membre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {rows.map((membre) => (
            <div
              key={membre.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
            >
              <h3 className="text-lg font-semibold">Membre #{membre.id}</h3>
              <p>
                <strong>Utilisateur:</strong>{" "}
                {users.find((u) => u.id === membre.utilisateur)?.username || `#${membre.utilisateur}`}
              </p>
              <p>
                <strong>Coopérative:</strong>{" "}
                {coops.find((c) => c.id === membre.cooperative)?.nom || `#${membre.cooperative}`}
              </p>
              <p>
                <strong>Actif:</strong> {membre.actif ? "Oui" : "Non"}
              </p>
              <p>
                <strong>Date d'adhésion:</strong> {new Date(membre.date_adhesion).toLocaleDateString()}
              </p>
              {canManage && (
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => openEditModal(membre)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(membre)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {rows.length === 0 && <div className="col-span-full text-center">Aucun membre.</div>}
        </div>
      )}

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Créer Membre</h2>
            {coops.length === 0 && (
              <p className="text-red-500 mb-4">Aucune coopérative disponible. Veuillez en créer une d'abord.</p>
            )}
            {users.length === 0 && (
              <p className="text-red-500 mb-4">Aucun utilisateur disponible. Veuillez en créer un d'abord.</p>
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Utilisateur</label>
                <Select
                  {...register("utilisateur", { required: "L'utilisateur est requis" })}
                  onChange={(v) => setValue("utilisateur", v)}
                  options={users.map((u) => ({ label: `${u.username} (#${u.id})`, value: String(u.id) }))}
                  placeholder="Sélectionnez un utilisateur"
                />
                {errors.utilisateur && (
                  <p className="text-red-500 text-sm mt-1">{errors.utilisateur.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Coopérative</label>
                <Select
                  {...register("cooperative", { required: "La coopérative est requise" })}
                  onChange={(v) => setValue("cooperative", v)}
                  options={coops.map((c) => ({ label: c.nom, value: String(c.id) }))}
                  placeholder="Sélectionnez une coopérative"
                />
                {errors.cooperative && (
                  <p className="text-red-500 text-sm mt-1">{errors.cooperative.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Actif</label>
                <input
                  type="checkbox"
                  {...register("actif")}
                  className="rounded border-neutral-300 dark:border-neutral-700"
                />
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
                    isLoading || coops.length === 0 || users.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading || coops.length === 0 || users.length === 0}
                >
                  {isLoading ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedMembre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Modifier Membre #{selectedMembre.id}</h2>
            <form onSubmit={handleSubmit(handleEdit)}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Utilisateur</label>
                <Select
                  {...register("utilisateur", { required: "L'utilisateur est requis" })}
                  onChange={(v) => setValue("utilisateur", v)}
                  options={users.map((u) => ({ label: `${u.username} (#${u.id})`, value: String(u.id) }))}
                  placeholder="Sélectionnez un utilisateur"
                  value={String(selectedMembre.utilisateur)}
                />
                {errors.utilisateur && (
                  <p className="text-red-500 text-sm mt-1">{errors.utilisateur.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Coopérative</label>
                <Select
                  {...register("cooperative", { required: "La coopérative est requise" })}
                  onChange={(v) => setValue("cooperative", v)}
                  options={coops.map((c) => ({ label: c.nom, value: String(c.id) }))}
                  placeholder="Sélectionnez une coopérative"
                  value={String(selectedMembre.cooperative)}
                />
                {errors.cooperative && (
                  <p className="text-red-500 text-sm mt-1">{errors.cooperative.message}</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Actif</label>
                <input
                  type="checkbox"
                  {...register("actif")}
                  className="rounded border-neutral-300 dark:border-neutral-700"
                />
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
      {isDeleteModalOpen && selectedMembre && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>
              Êtes-vous sûr de vouloir supprimer le membre #{selectedMembre.id} (
              {users.find((u) => u.id === selectedMembre.utilisateur)?.username || `#${selectedMembre.utilisateur}`}) ?
            </p>
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