import { useEffect, useState } from "react";
import { Audits } from "../api";
import { useAuth } from "../store/auth";
import toast from "react-hot-toast";
import type { Audit, TypeAudit } from "../models";

export default function AuditsPage() {
  const [rows, setRows] = useState<Audit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const { user } = useAuth();

  const fetchAll = () => {
    if (!user?.is_staff) return;
    Audits.list()
      .then(setRows)
      .catch(() => {
        setError("Erreur lors du chargement du journal d’audit");
        toast.error("Erreur lors du chargement du journal d’audit");
      });
  };

  useEffect(() => {
    fetchAll();
  }, [user]);

  if (!user?.is_staff) {
    return <p className="p-8">Accès réservé aux administrateurs.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Journal d’audit</h1>
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

      {viewMode === "table" && (
        <table
          className="w-full text-sm border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
        >
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3">Type</th>
              <th className="p-3">Description</th>
              <th className="p-3">Utilisateur</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr
                key={a.id}
                className="border-t border-neutral-200 dark:border-neutral-800"
              >
                <td className="p-3">{a.id}</td>
                <td className="p-3">{a.type}</td>
                <td className="p-3">{a.description}</td>
                <td className="p-3">{a.utilisateur ? `#${a.utilisateur}` : "N/A"}</td>
                <td className="p-3">{new Date(a.date_creation).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="p-3 text-center" colSpan={5}>
                  Aucun enregistrement d’audit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {rows.map((audit) => (
            <div
              key={audit.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
            >
              <h3 className="text-lg font-semibold">Audit #{audit.id}</h3>
              <p>
                <strong>Type:</strong> {audit.type}
              </p>
              <p>
                <strong>Description:</strong> {audit.description}
              </p>
              <p>
                <strong>Utilisateur:</strong> {audit.utilisateur ? `#${audit.utilisateur}` : "N/A"}
              </p>
              <p>
                <strong>Date:</strong> {new Date(audit.date_creation).toLocaleString()}
              </p>
              <p>
                <strong>Détails:</strong>{" "}
                {Object.keys(audit.details).length > 0
                  ? JSON.stringify(audit.details, null, 2)
                  : "Aucun détail supplémentaire"}
              </p>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="col-span-full text-center">Aucun enregistrement d’audit.</div>
          )}
        </div>
      )}
    </div>
  );
}