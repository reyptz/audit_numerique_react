import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { useAuth } from "../store/auth";
import toast from "react-hot-toast";
import { Utilisateurs } from "../api";
import type { Utilisateur } from "../models";

type ProfileFormData = {
  first_name: string;
  last_name: string;
  email: string;
  telephone: string | null;
};

export default function ProfilePage() {
  const { user, me } = useAuth();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [formDataToSave, setFormDataToSave] = useState<ProfileFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"form" | "card">("form");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: user
      ? {
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          telephone: user.telephone || "",
        }
      : undefined,
  });

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        telephone: user.telephone || "",
      });
    }
  }, [user, reset]);

  const save: SubmitHandler<ProfileFormData> = async (data) => {
    setFormDataToSave(data);
    setIsConfirmModalOpen(true);
  };

  const confirmSave = async () => {
    if (!formDataToSave || !user) return;
    setIsLoading(true);
    try {
      await Utilisateurs.patch(user.id, formDataToSave);
      toast.success("Profil mis à jour");
      await me(); // Refresh user data
      reset({ ...formDataToSave });
      setError(null);
      setIsConfirmModalOpen(false);
      setFormDataToSave(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de la mise à jour du profil";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <p className="p-8 text-center">Connexion requise.</p>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Mon profil</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("form")}
            className={`px-3 py-1 rounded ${
              viewMode === "form" ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            Formulaire
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

      {viewMode === "form" && (
        <form onSubmit={handleSubmit(save)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Prénom</label>
            <input
              {...register("first_name", { required: "Le prénom est requis" })}
              className={`w-full rounded-xl border px-3 py-2 ${
                errors.first_name ? "border-red-500" : ""
              }`}
              placeholder="Prénom"
            />
            {errors.first_name && (
              <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Nom</label>
            <input
              {...register("last_name", { required: "Le nom est requis" })}
              className={`w-full rounded-xl border px-3 py-2 ${
                errors.last_name ? "border-red-500" : ""
              }`}
              placeholder="Nom"
            />
            {errors.last_name && (
              <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              {...register("email", {
                required: "L'email est requis",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Format d'email invalide",
                },
              })}
              type="email"
              className={`w-full rounded-xl border px-3 py-2 ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Téléphone</label>
            <input
              {...register("telephone", {
                pattern: {
                  value: /^[0-9+\-\s]*$|^$/,
                  message: "Format de téléphone invalide",
                },
              })}
              className={`w-full rounded-xl border px-3 py-2 ${
                errors.telephone ? "border-red-500" : ""
              }`}
              placeholder="Téléphone"
            />
            {errors.telephone && (
              <p className="text-red-500 text-sm mt-1">{errors.telephone.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      )}

      {viewMode === "card" && (
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900">
          <h3 className="text-lg font-semibold mb-2">Mon profil</h3>
          <p>
            <strong>Prénom:</strong> {user.first_name || "N/A"}
          </p>
          <p>
            <strong>Nom:</strong> {user.last_name || "N/A"}
          </p>
          <p>
            <strong>Email:</strong> {user.email || "N/A"}
          </p>
          <p>
            <strong>Téléphone:</strong> {user.telephone || "N/A"}
          </p>
          <p>
            <strong>Nom d'utilisateur:</strong> {user.username || "N/A"}
          </p>
          <p>
            <strong>Rôle:</strong> {user.role || "N/A"}
          </p>
          <p>
            <strong>Administrateur:</strong> {user.is_staff ? "Oui" : "Non"}
          </p>
          <p>
            <strong>Actif:</strong> {user.is_active ? "Oui" : "Non"}
          </p>
          <p>
            <strong>Date d'inscription:</strong>{" "}
            {new Date(user.date_inscription).toLocaleDateString()}
          </p>
          <button
            onClick={() => setViewMode("form")}
            className="mt-4 rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700"
          >
            Modifier
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && formDataToSave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirmer les modifications</h2>
            <p>Êtes-vous sûr de vouloir enregistrer ces modifications pour votre profil ?</p>
            <div className="mt-4">
              <p>
                <strong>Prénom:</strong> {formDataToSave.first_name}
              </p>
              <p>
                <strong>Nom:</strong> {formDataToSave.last_name}
              </p>
              <p>
                <strong>Email:</strong> {formDataToSave.email}
              </p>
              <p>
                <strong>Téléphone:</strong> {formDataToSave.telephone || "N/A"}
              </p>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                onClick={confirmSave}
                className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? "Enregistrement..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}