import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { http } from "../lib/http";

type Form = { password: string; confirm: string };

export default function ResetPassword() {
  const { register, handleSubmit, watch } = useForm<Form>();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get("token");

  const onSubmit = async (d: Form) => {
    if (d.password !== d.confirm) return toast.error("Les mots de passe diffèrent");
    try {
      await http.post("utilisateurs/reset_password_confirm/", { token, new_password: d.password });
      toast.success("Mot de passe mis à jour !");
      nav("/login");               // ← retour login
    } catch {
      toast.error("Lien expiré ou invalide");
    }
  };

  if (!token) return <p className="p-8">Token manquant.</p>;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold mb-4">Réinitialiser le mot de passe</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2"
          type="password"
          placeholder="Nouveau mot de passe"
          {...register("password", { required: true })}
        />
        <input
          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2"
          type="password"
          placeholder="Confirmer"
          {...register("confirm", { required: true })}
        />
        {watch("password") && watch("password") !== watch("confirm") && (
          <p className="text-xs text-red-600">Les mots de passe ne correspondent pas</p>
        )}
        <button className="w-full rounded-xl bg-brand-600 text-white py-2 hover:bg-brand-700">
          Mettre à jour
        </button>
      </form>

      <div className="mt-6 text-sm flex justify-center">
        <Link to="/welcome" className="text-neutral-600 dark:text-neutral-400 hover:text-brand-600 hover:underline">
          ← Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
