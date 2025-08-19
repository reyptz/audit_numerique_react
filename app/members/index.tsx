import { useEffect, useState } from "react";
import { Cooperatives, CooperativeAPI, Membres } from "../api";
import type { Membre } from "../models";
import Select from "../components/Select";

export default function Members() {
  const [coops, setCoops] = useState<{ id: number; nom: string }[]>([]);
  const [coopId, setCoopId] = useState<number | "">("");
  const [rows, setRows] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Membre | null>(null);
  const [formData, setFormData] = useState<Partial<Membre>>({
    utilisateur: 0,
    cooperative: 0,
    date_adhesion: "",
    actif: true,
  });
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  useEffect(() => {
    Cooperatives.list()
      .then((data) => setCoops(data))
      .catch((err) => setError("Failed to load cooperatives"));
  }, []);

  useEffect(() => {
    if (!coopId) {
      setRows([]);
      return;
    }
    setLoading(true);
    CooperativeAPI.membres(Number(coopId))
      .then(setRows)
      .catch((err) => setError("Failed to load members"))
      .finally(() => setLoading(false));
  }, [coopId]);

  const handleAdd = async () => {
    try {
      const newMember = await Membres.create({ ...formData, cooperative: Number(coopId) });
      setRows([...rows, newMember]);
      setIsAddModalOpen(false);
      setFormData({
        utilisateur: 0,
        cooperative: Number(coopId),
        date_adhesion: "",
        actif: true,
      });
      setError(null);
    } catch (err) {
      setError("Failed to add member");
    }
  };

  const handleEdit = async () => {
    if (!selectedMember) return;
    try {
      const updatedMember = await Membres.update(selectedMember.id, {
        ...formData,
        cooperative: Number(coopId),
      });
      setRows(rows.map((row) => (row.id === selectedMember.id ? updatedMember : row)));
      setIsEditModalOpen(false);
      setSelectedMember(null);
      setFormData({
        utilisateur: 0,
        cooperative: Number(coopId),
        date_adhesion: "",
        actif: true,
      });
      setError(null);
    } catch (err) {
      setError("Failed to update member");
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    try {
      await Membres.remove(selectedMember.id);
      setRows(rows.filter((row) => row.id !== selectedMember.id));
      setIsDeleteModalOpen(false);
      setSelectedMember(null);
      setError(null);
    } catch (err) {
      setError("Failed to delete member");
    }
  };

  const openEditModal = (member: Membre) => {
    setSelectedMember(member);
    setFormData({
      utilisateur: member.utilisateur,
      cooperative: member.cooperative,
      date_adhesion: member.date_adhesion,
      actif: member.actif,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (member: Membre) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Membres</h1>
        <div className="flex items-center space-x-4">
          <Select
            value={coopId}
            onChange={(v) => setCoopId(v ? Number(v) : "")}
            options={coops.map((c) => ({ label: c.nom, value: c.id }))}
            placeholder="Filtrer par coopérative"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded ${viewMode === "table" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1 rounded ${viewMode === "card" ? "bg-blue-500 text-white" : "bg-gray-300"}`}
            >
              Card
            </button>
          </div>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {coopId && (
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Member
        </button>
      )}

      {!coopId && (
        <p className="text-neutral-600">Choisissez une coopérative pour lister les membres.</p>
      )}

      {coopId && viewMode === "table" && (
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr className="text-left">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Actif</th>
                <th className="px-4 py-3">Adhésion</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="px-4 py-3" colSpan={5}>
                    Chargement…
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-neutral-200 dark:border-neutral-800"
                  >
                    <td className="px-4 py-3">{r.id}</td>
                    <td className="px-4 py-3">#{r.utilisateur}</td>
                    <td className="px-4 py-3">{r.actif ? "Oui" : "Non"}</td>
                    <td className="px-4 py-3">
                      {new Date(r.date_adhesion).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
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
                  </tr>
                ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-3" colSpan={5}>
                    Aucun membre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {coopId && viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {loading && (
            <div className="col-span-full text-center">Chargement…</div>
          )}
          {!loading &&
            rows.map((member) => (
              <div
                key={member.id}
                className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
              >
                <h3 className="text-lg font-semibold">Member #{member.id}</h3>
                <p>
                  <strong>Utilisateur:</strong> #{member.utilisateur}
                </p>
                <p>
                  <strong>Actif:</strong> {member.actif ? "Oui" : "Non"}
                </p>
                <p>
                  <strong>Adhésion:</strong>{" "}
                  {new Date(member.date_adhesion).toLocaleDateString()}
                </p>
                <p>
                  <strong>Coopérative:</strong>{" "}
                  {coops.find((c) => c.id === member.cooperative)?.nom || "N/A"}
                </p>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => openEditModal(member)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(member)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          {!loading && rows.length === 0 && (
            <div className="col-span-full text-center">Aucun membre.</div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Member</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd();
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium">Utilisateur ID</label>
                <input
                  type="number"
                  name="utilisateur"
                  value={formData.utilisateur}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Date d'adhésion</label>
                <input
                  type="date"
                  name="date_adhesion"
                  value={formData.date_adhesion}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Actif</label>
                <input
                  type="checkbox"
                  name="actif"
                  checked={formData.actif}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Edit Member #{selectedMember.id}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEdit();
              }}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium">Utilisateur ID</label>
                <input
                  type="number"
                  name="utilisateur"
                  value={formData.utilisateur}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Date d'adhésion</label>
                <input
                  type="date"
                  name="date_adhesion"
                  value={formData.date_adhesion}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded dark:bg-neutral-700"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Actif</label>
                <input
                  type="checkbox"
                  name="actif"
                  checked={formData.actif}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete member #{selectedMember.id}?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}