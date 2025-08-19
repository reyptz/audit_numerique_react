import type { Route } from "./+types/home";
import { Link } from "react-router-dom";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Audit Numérique" },
    { name: "description", content: "Système d’audit pour coopératives informelles" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-brand-700 dark:text-brand-300">Audit Numérique</h1>
          <nav className="space-x-4">
            <Link to="/login" className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-brand-600">Login</Link>
            <Link to="/register" className="text-sm bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700">Inscription</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
              Système d’Audit pour Coopératives Informelles
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              Suivez cotisations, prêts, remboursements et recevez des analyses automatiques (LangChain).
              Intégration DRF, Channels & WebSockets, Dashboard financier.
            </p>
            <div className="mt-6 flex gap-3">
              <Link to="/welcome" className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200">Découvrir</Link>
            </div>
          </div>
          <div className="rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 p-6">
            <ul className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
              <li>✅ Auth JWT (login/register/me)</li>
              <li>✅ CRUD: rôles, coopératives, membres, cotisations</li>
              <li>✅ Stats coopératives & graphiques</li>
              <li>✅ Notifications temps réel (WS)</li>
              <li>✅ Chat IA (LangChain)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}