import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useAuth } from "../store/auth";
import { useNavigate, Link } from "react-router-dom";

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  password: z.string().min(6),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Les mots de passe diffèrent",
  path: ["confirm"],
});

type Form = z.infer<typeof schema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });
  const auth = useAuth();
  const nav  = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = handleSubmit(async ({ confirm, ...payload }) => {
    setLoading(true);
    try {
      await auth.register(payload);
      toast.success("Inscription réussie !");
      nav("/app");              // ← redirection
    } catch {
      toast.error("Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  });

  const cls = (e?: string) =>
    `w-full rounded-xl border px-3 py-2 ${
      e ? "border-red-500" : "border-neutral-300 dark:border-neutral-700"
    }`;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold mb-4">Créer un compte</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input className={cls(errors.username?.message)} placeholder="Nom d'utilisateur" {...register("username")} />
        {errors.username && <p className="text-xs text-red-600">{errors.username.message}</p>}

        <input className={cls(errors.email?.message)} type="email" placeholder="Email" {...register("email")} />
        {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}

        <div className="grid grid-cols-2 gap-2">
          <input className={cls()} placeholder="Prénom" {...register("first_name")} />
          <input className={cls()} placeholder="Nom" {...register("last_name")} />
        </div>

        <input className={cls(errors.password?.message)} type="password" placeholder="Mot de passe" {...register("password")} />
        {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}

        <input className={cls(errors.confirm?.message)} type="password" placeholder="Confirmer" {...register("confirm")} />
        {errors.confirm && <p className="text-xs text-red-600">{errors.confirm.message}</p>}

        <button disabled={loading} className="w-full rounded-xl bg-brand-600 text-white py-2 hover:bg-brand-700 disabled:opacity-60">
          {loading ? "Création…" : "Créer le compte"}
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
