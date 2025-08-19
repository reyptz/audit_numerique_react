// app/routes/not-found.tsx
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-brand-700">404</h1>
        <p className="mt-3 text-xl text-neutral-700 dark:text-neutral-300">
          Oups ! Cette page n’existe pas.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
