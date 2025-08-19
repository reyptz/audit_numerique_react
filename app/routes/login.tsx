// app/routes/login.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../store/auth";

type Form = { username: string; password: string };

export default function Login() {
  const { register, handleSubmit } = useForm<Form>();
  const auth   = useAuth();
  const nav    = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async ({ username, password }) => {
    setLoading(true);
    try {
      await auth.login(username, password);
      toast.success("Connecté !");
      nav("/app");          // ← redirection immédiate
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Échec de connexion");
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold mb-4">Connexion</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          {...register("username", { required: true })}
          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2"
          placeholder="Nom d'utilisateur"
        />

        <input
          {...register("password", { required: true })}
          type="password"
          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2"
          placeholder="Mot de passe"
        />

        <button
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 text-white py-2 hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <div className="mt-4 text-sm flex flex-col items-center gap-2">
        <Link to="/forgot-password" className="text-brand-600 hover:underline">
          Mot de passe oublié ?
        </Link>

        {/* Bouton retour */}
        <Link
          to="/welcome"
          className="inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-400 hover:text-brand-600 hover:underline"
        >
          ← Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
