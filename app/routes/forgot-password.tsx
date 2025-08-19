import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { http } from "../lib/http";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const { register, handleSubmit, reset } = useForm<{ email: string }>();
  const nav = useNavigate();

  const onSubmit = async (d: { email: string }) => {
    try {
      await http.post("utilisateurs/reset_password/", d);
      toast.success("Email envoyé ! Consulte ta boîte.");
      reset();
      nav("/login");                // ← retour login après succès
    } catch {
      toast.error("Impossible d’envoyer l’email");
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold mb-4">Mot de passe oublié</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        Renseigne ton adresse email ; tu recevras un lien de réinitialisation.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 px-3 py-2"
          type="email"
          placeholder="Email"
          {...register("email", { required: true })}
        />
        <button className="w-full rounded-xl bg-brand-600 text-white py-2 hover:bg-brand-700">
          Envoyer
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
