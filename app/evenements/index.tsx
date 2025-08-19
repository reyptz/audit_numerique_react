import { useEffect, useState } from "react";
import { EvenementsAPI, Cooperatives } from "../api";
import { useForm } from "react-hook-form";
import Select from "../components/Select";
import toast from "react-hot-toast";
import type { Evenement } from "../models";

type Form = { coopId: string; titre: string; description: string; date_debut: string; date_fin: string };

export default function EvenementsPage() {
  const [rows, setRows] = useState<Evenement[]>([]);
  const [coops, setCoops] = useState<{ id: number; nom: string }[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvenement, setSelectedEvenement] = useState<Evenement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const { register, handleSubmit, setValue, reset } = useForm<Form>({
    defaultValues: { coopId: "", titre: "", description: "", date_debut: "", date_fin: "" },
  });

  const fetchAll = () =>
    EvenementsAPI.list()
      .then(setRows)
      .catch(() => setError("Erreur lors du chargement des événements"));

  const fetchCoops = () =>
    Cooperatives.list()
      .then(setCoops)
      .catch(() => setError("Erreur lors du chargement des coopératives"));

  useEffect(() => {
    fetchAll();
    fetchCoops();
  }, []);

  const onSubmit = async (data: Form) => {
    try {
      await EvenementsAPI.create({
        cooperative: Number(data.coopId),
        titre: data.titre,
        description: data.description,
        date_debut: data.date_debut,
        date_fin: data.date_fin,
      });
      toast.success("Événement créé !");
      reset({ coopId: "", titre: "", description: "", date_debut: "", date_fin: "" });
      fetchAll();
      setError(null);
    } catch {
      setError("Erreur lors de la création de l'événement");
      toast.error("Erreur lors de la création");
    }
  };

  const handleEdit = async (data: Form) => {
    if (!selectedEvenement) return;
    try {
      const updatedEvenement = await EvenementsAPI.update(selectedEvenement.id, {
        cooperative: Number(data.coopId),
        titre: data.titre,
        description: data.description,
        date_debut: data.date_debut,
        date_fin: data.date_fin,
      });
      setRows(rows.map((row) => (row.id === selectedEvenement.id ? updatedEvenement : row)));
      setIsEditModalOpen(false);
      setSelectedEvenement(null);
      reset({ coopId: "", titre: "", description: "", date_debut: "", date_fin: "" });
      toast.success("Événement modifié !");
      setError(null);
    } catch {
      setError("Erreur lors de la modification de l'événement");
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDelete = async () => {
    if (!selectedEvenement) return;
    try {
      await EvenementsAPI.remove(selectedEvenement.id);
      setRows(rows.filter((row) => row.id !== selectedEvenement.id));
      setIsDeleteModalOpen(false);
      setSelectedEvenement(null);
      toast.success("Événement supprimé !");
      setError(null);
    } catch {
      setError("Erreur lors de la suppression de l'événement");
      toast.error("Erreur lors de la suppression");
    }
  };

  const openEditModal = (evenement: Evenement) => {
    setSelectedEvenement(evenement);
    setValue("coopId", String(evenement.cooperative));
    setValue("titre", evenement.titre);
    setValue("description", evenement.description);
    setValue("date_debut", evenement.date_debut);
    setValue("date_fin", evenement.date_fin);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (evenement: Evenement) => {
    setSelectedEvenement(evenement);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Événements</h1>
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-8 grid md:grid-cols-5 gap-3"
      >
        <Select
          onChange={(v) => setValue("coopId", v)}
          placeholder="Coopérative"
          options={coops.map((c) => ({ label: c.nom, value: c.id }))}
        />
        <input
          {...register("titre", { required: true })}
          className="rounded-xl border px-3 py-2"
          placeholder="Titre"
        />
        <input
          {...register("description")}
          className="rounded-xl border px-3 py-2"
          placeholder="Description"
        />
        <input
          {...register("date_debut", { required: true })}
          type="datetime-local"
          className="rounded-xl border px-3 py-2"
        />
        <input
          {...register("date_fin", { required: true })}
          type="datetime-local"
          className="rounded-xl border px-3 py-2"
        />
        <button className="rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700 md:col-span-5">
          Créer
        </button>
      </form>

      {viewMode === "table" && (
        <table
          className="w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
        >
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3">Titre</th>
              <th className="p-3">Coopérative</th>
              <th className="p-3">Début</th>
              <th className="p-3">Fin</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr
                key={e.id}
                className="border-t border-neutral-200 dark:border-neutral-800"
              >
                <td className="p-3">{e.id}</td>
                <td className="p-3">{e.titre}</td>
                <td className="p-3">{coops.find((c) => c.id === e.cooperative)?.nom || `#${e.cooperative}`}</td>
                <td className="p-3">{new Date(e.date_debut).toLocaleString()}</td>
                <td className="p-3">{new Date(e.date_fin).toLocaleString()}</td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(e)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(e)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-center" colSpan={6}>
                  Aucun événement.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {rows.map((evenement) => (
            <div
              key={evenement.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
            >
              <h3 className="text-lg font-semibold">Événement #{evenement.id}</h3>
              <p>
                <strong>Titre:</strong> {evenement.titre}
              </p>
              <p>
                <strong>Coopérative:</strong>{" "}
                {coops.find((c) => c.id === evenement.cooperative)?.nom || `#${evenement.cooperative}`}
              </p>
              <p>
                <strong>Description:</strong> {evenement.description || "N/A"}
              </p>
              <p>
                <strong>Début:</strong> {new Date(evenement.date_debut).toLocaleString()}
              </p>
              <p>
                <strong>Fin:</strong> {new Date(evenement.date_fin).toLocaleString()}
              </p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openEditModal(evenement)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(evenement)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="col-span-full text-center">Aucun événement.</div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedEvenement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Modifier Événement #{selectedEvenement.id}
            </h2>
            <form
              onSubmit={handleSubmit(handleEdit)}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium">Coopérative</label>
                <Select
                  onChange={(v) => setValue("coopId", v)}
                  placeholder="Coopérative"
                  options={coops.map((c) => ({ label: c.nom, value: c.id }))}
                  value={String(selectedEvenement.cooperative)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Titre</label>
                <input
                  {...register("titre", { required: true })}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  placeholder="Titre"
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
              <div className="mb-4">
                <label className="block text-sm font-medium">Date de début</label>
                <input
                  {...register("date_debut", { required: true })}
                  type="datetime-local"
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Date de fin</label>
                <input
                  {...register("date_fin", { required: true })}
                  type="datetime-local"
                  className="w-full p-2 border rounded dark:bg-neutral-700"
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
      {isDeleteModalOpen && selectedEvenement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>
              Êtes-vous sûr de vouloir supprimer l'événement #{selectedEvenement.id} (
              {selectedEvenement.titre}) ?
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