import { useEffect, useState } from "react";
import { Messages, Utilisateurs } from "../api";
import { useAuth } from "../store/auth";
import { useForm } from "react-hook-form";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import Select from "../components/Select";
import type { Message as MessageModel } from "../models";

type MessageFormData = {
  destinataire: string;
  contenu: string;
};

export interface Message {
  id: number;
  expediteur: number;
  destinataire: number;
  contenu: string;
  date_envoi: string;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Message[]>([]);
  const [users, setUsers] = useState<{ id: number; username: string }[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MessageFormData>({
    defaultValues: { destinataire: "", contenu: "" },
  });

  const fetchMessages = () => {
    if (!user) return;
    setIsLoading(true);
    Messages.list({ destinataire: user.id })
      .then((data) => {
        setRows(data);
        setError(null);
      })
      .catch(() => {
        setError("Erreur lors du chargement des messages");
        toast.error("Erreur lors du chargement des messages");
      })
      .finally(() => setIsLoading(false));
  };

  const fetchUsers = () => {
    setIsLoading(true);
    Utilisateurs.list()
      .then((data) => {
        setUsers(data);
        setError(null);
      })
      .catch(() => {
        setError("Erreur lors du chargement des utilisateurs");
        toast.error("Erreur lors du chargement des utilisateurs");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchMessages();
    fetchUsers();
  }, [user]);

  const sendMessage: SubmitHandler<MessageFormData> = async (data) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await Messages.create({
        expediteur: user.id,
        destinataire: Number(data.destinataire),
        contenu: data.contenu,
      });
      toast.success("Message envoyé !");
      reset({ destinataire: "", contenu: "" });
      fetchMessages();
      setError(null);
    } catch {
      setError("Erreur lors de l'envoi du message");
      toast.error("Erreur lors de l'envoi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    setIsLoading(true);
    try {
      await Messages.remove(selectedMessage.id);
      setRows(rows.filter((row) => row.id !== selectedMessage.id));
      setIsDeleteModalOpen(false);
      setSelectedMessage(null);
      toast.success("Message supprimé !");
      setError(null);
    } catch {
      setError("Erreur lors de la suppression du message");
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (message: Message) => {
    setSelectedMessage(message);
    setIsDeleteModalOpen(true);
  };

  if (!user) {
    return <p className="p-8 text-center">Connexion requise.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Mes messages</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded ${
              viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            Liste
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`px-3 py-1 rounded ${
              viewMode === "card" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            Carte
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <form
        onSubmit={handleSubmit(sendMessage)}
        className="mb-8 grid md:grid-cols-2 gap-3"
      >
        <Select
          onChange={(v) => register("destinataire").onChange({ target: { value: v } })}
          options={users
            .filter((u) => u.id !== user.id)
            .map((u) => ({ label: `${u.username} (#${u.id})`, value: u.id }))}
          placeholder="Destinataire"
        />
        <div className="md:col-span-2">
          <textarea
            {...register("contenu", { required: "Le contenu du message est requis" })}
            className={`w-full rounded-xl border px-3 py-2 ${
              errors.contenu ? "border-red-500" : ""
            }`}
            placeholder="Contenu du message"
            rows={4}
          />
          {errors.contenu && (
            <p className="text-red-500 text-sm mt-1">{errors.contenu.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700 md:col-span-2 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Envoi..." : "Envoyer"}
        </button>
      </form>

      {isLoading && (
        <p className="text-center text-neutral-500">Chargement des messages...</p>
      )}

      {!isLoading && viewMode === "list" && (
        <ul className="space-y-4">
          {rows.map((m) => (
            <li
              key={m.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  De : {users.find((u) => u.id === m.expediteur)?.username || `#${m.expediteur}`}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-500">
                    {formatDistanceToNow(new Date(m.date_envoi), { addSuffix: true })}
                  </span>
                  <button
                    onClick={() => openDeleteModal(m)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm">{m.contenu}</p>
            </li>
          ))}
          {rows.length === 0 && (
            <p className="text-center text-neutral-500">Aucun message reçu.</p>
          )}
        </ul>
      )}

      {!isLoading && viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {rows.map((message) => (
            <div
              key={message.id}
              className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
            >
              <h3 className="text-lg font-semibold">Message #{message.id}</h3>
              <p>
                <strong>De:</strong>{" "}
                {users.find((u) => u.id === message.expediteur)?.username || `#${message.expediteur}`}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {formatDistanceToNow(new Date(message.date_envoi), { addSuffix: true })}
              </p>
              <p>
                <strong>Contenu:</strong> {message.contenu}
              </p>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => openDeleteModal(message)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="col-span-full text-center text-neutral-500">
              Aucun message reçu.
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>
              Êtes-vous sûr de vouloir supprimer le message #{selectedMessage.id} de{" "}
              {users.find((u) => u.id === selectedMessage.expediteur)?.username || `#${selectedMessage.expediteur}`} ?
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