import { useEffect, useState } from "react";
import { Cooperatives, CooperativeAPI, Cotisations } from "../api";
import Select from "../components/Select";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import type { Cotisation, TypeCotisation, StatutCotisation } from "../models";

// Money formatting function
export const money = (n: number | string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "XOF", maximumFractionDigits: 0 })
    .format(typeof n === "string" ? parseFloat(n) : n);

type Form = { coopId: string; membreId: string; montant: string; type: TypeCotisation; statut: StatutCotisation };

export default function CotisationsPage() {
  const [coops, setCoops] = useState<{ id: number; nom: string }[]>([]);
  const [coopId, setCoopId] = useState<number | "">("");
  const [membres, setMembres] = useState<{ id: number; utilisateur: number }[]>([]);
  const [rows, setRows] = useState<Cotisation[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCotisation, setSelectedCotisation] = useState<Cotisation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const { register, handleSubmit, setValue, reset } = useForm<Form>({
    defaultValues: {
      coopId: "",
      membreId: "",
      montant: "",
      type: "reguliere",
      statut: "en_attente",
    },
  });

  const fetchCoops = () =>
    Cooperatives.list()
      .then(setCoops)
      .catch(() => setError("Erreur lors du chargement des coopératives"));

  const fetchMembres = () => {
    if (!coopId) {
      setMembres([]);
      return;
    }
    CooperativeAPI.membres(Number(coopId))
      .then(setMembres)
      .catch(() => setError("Erreur lors du chargement des membres"));
  };

  const fetchAll = () =>
    Cotisations.list()
      .then(setRows)
      .catch(() => setError("Erreur lors du chargement des cotisations"));

  useEffect(() => {
    fetchCoops();
    fetchAll();
  }, []);

  useEffect(() => {
    fetchMembres();
  }, [coopId]);

  const onSubmit = async (data: Form) => {
    try {
      await Cotisations.create({
        membre: Number(data.membreId),
        montant: data.montant,
        type: data.type,
        statut: data.statut,
      });
      toast.success("Cotisation créée !");
      reset({
        coopId: data.coopId,
        membreId: "",
        montant: "",
        type: "reguliere",
        statut: "en_attente",
      });
      fetchAll();
      setError(null);
    } catch {
      setError("Erreur lors de la création de la cotisation");
      toast.error("Erreur lors de la création");
    }
  };

  const handleEdit = async (data: Form) => {
    if (!selectedCotisation) return;
    try {
      const updatedCotisation = await Cotisations.update(selectedCotisation.id, {
        membre: Number(data.membreId),
        montant: data.montant,
        type: data.type,
        statut: data.statut,
      });
      setRows(rows.map((row) => (row.id === selectedCotisation.id ? updatedCotisation : row)));
      setIsEditModalOpen(false);
      setSelectedCotisation(null);
      reset({
        coopId: data.coopId,
        membreId: "",
        montant: "",
        type: "reguliere",
        statut: "en_attente",
      });
      toast.success("Cotisation modifiée !");
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
      setRows(rows.filter((row) => row.id !== selectedCotisation.id));
      setIsDeleteModalOpen(false);
      setSelectedCotisation(null);
      toast.success("Cotisation supprimée !");
      setError(null);
    } catch {
      setError("Erreur lors de la suppression de la cotisation");
      toast.error("Erreur lors de la suppression");
    }
  };

  const openEditModal = (cotisation: Cotisation) => {
    setSelectedCotisation(cotisation);
    const coop = membres.find((m) => m.id === cotisation.membre)?.cooperative;
    setValue("coopId", String(coop || ""));
    setCoopId(coop || "");
    fetchMembres(); // Ensure membres are loaded for the cooperative
    setValue("membreId", String(cotisation.membre));
    setValue("montant", cotisation.montant);
    setValue("type", cotisation.type);
    setValue("statut", cotisation.statut);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (cotisation: Cotisation) => {
    setSelectedCotisation(cotisation);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Cotisations</h1>
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
        className="mb-8 grid md:grid-cols-4 gap-3"
      >
        <Select
          value={coopId}
          onChange={(v) => {
            setCoopId(v ? Number(v) : "");
            setValue("coopId", v);
          }}
          options={coops.map((c) => ({ label: c.nom, value: c.id }))}
          placeholder="Coopérative"
        />
        <Select
          onChange={(v) => setValue("membreId", v)}
          options={membres.map((m) => ({ label: `Membre #${m.id} (Utilisateur #${m.utilisateur})`, value: m.id }))}
          placeholder="Membre"
        />
        <input
          {...register("montant", { required: true })}
          className="rounded-xl border px-3 py-2 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
          placeholder="Montant"
        />
        <Select
          onChange={(v) => setValue("type", v as TypeCotisation)}
          options={[
            { label: "Régulière", value: "reguliere" },
            { label: "Exceptionnelle", value: "exceptionnelle" },
            { label: "Solidarité", value: "solidarite" },
          ]}
          placeholder="Type"
          value={register("type").value}
        />
        <select
          {...register("statut", { required: true })}
          className="rounded-xl border px-3 py-2 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700"
        >
          <option value="en_attente">En attente</option>
          <option value="validee">Validée</option>
          <option value="rejetee">Rejetée</option>
        </select>
        <button className="rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700 md:col-span-4">
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
              <th className="p-3">Membre</th>
              <th className="p-3">Coopérative</th>
              <th className="p-3">Montant</th>
              <th className="p-3">Type</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Date</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr
                key={c.id}
                className="border-t border-neutral-200 dark:border-neutral-800"
              >
                <td className="p-3">{c.id}</td>
                <td className="p-3">#{c.membre}</td>
                <td className="p-3">
                  {coops.find((coop) => coop.id === membres.find((m) => m.id === c.membre)?.cooperative)?.nom ||
                    `#${membres.find((m) => m.id === c.membre)?.cooperative || "N/A"}`}
                </td>
                <td className="p-3">{money(c.montant)}</td>
                <td className="p-3">{c.type}</td>
                <td className="p-3">{c.statut}</td>
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
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-center" colSpan={8}>
                  Aucune cotisation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {rows.map((cotisation) => (
            <div
              key={cotisation.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
            >
              <h3 className="text-lg font-semibold">Cotisation #{cotisation.id}</h3>
              <p>
                <strong>Membre:</strong> #{cotisation.membre}
              </p>
              <p>
                <strong>Coopérative:</strong>{" "}
                {coops.find((coop) => coop.id === membres.find((m) => m.id === cotisation.membre)?.cooperative)?.nom ||
                  `#${membres.find((m) => m.id === cotisation.membre)?.cooperative || "N/A"}`}
              </p>
              <p>
                <strong>Montant:</strong> {money(cotisation.montant)}
              </p>
              <p>
                <strong>Type:</strong> {cotisation.type}
              </p>
              <p>
                <strong>Statut:</strong> {cotisation.statut}
              </p>
              <p>
                <strong>Date de paiement:</strong>{" "}
                {new Date(cotisation.date_paiement).toLocaleDateString()}
              </p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openEditModal(cotisation)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(cotisation)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="col-span-full text-center">Aucune cotisation.</div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedCotisation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Modifier Cotisation #{selectedCotisation.id}
            </h2>
            <form
              onSubmit={handleSubmit(handleEdit)}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium">Coopérative</label>
                <Select
                  onChange={(v) => {
                    setCoopId(v ? Number(v) : "");
                    setValue("coopId", v);
                  }}
                  options={coops.map((c) => ({ label: c.nom, value: c.id }))}
                  placeholder="Coopérative"
                  value={String(coopId)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Membre</label>
                <Select
                  onChange={(v) => setValue("membreId", v)}
                  options={membres.map((m) => ({ label: `Membre #${m.id} (Utilisateur #${m.utilisateur})`, value: m.id }))}
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
              <div className="mb-4">
                <label className="block text-sm font-medium">Statut</label>
                <select
                  {...register("statut", { required: true })}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                >
                  <option value="en_attente">En attente</option>
                  <option value="validee">Validée</option>
                  <option value="rejetee">Rejetée</option>
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
      {isDeleteModalOpen && selectedCotisation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>
              Êtes-vous sûr de vouloir supprimer la cotisation #{selectedCotisation.id} (Membre #
              {selectedCotisation.membre}) ?
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