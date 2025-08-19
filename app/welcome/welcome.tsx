// app/welcome/welcome.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CpuChipIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import { http } from "../lib/http";

type Status = "unknown" | "ok" | "error";

export default function Welcome() {
  const [apiStatus, setApiStatus] = useState<Status>("unknown");
  const apiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000/";
  const wsUrl = (import.meta.env.VITE_WS_URL as string) || "ws://localhost:8000/ws/";
  const apiHasSlash = apiUrl.endsWith("/");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await http.get("roles/");
        if (mounted) setApiStatus("ok");
      } catch {
        if (mounted) setApiStatus("error");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => {});

  return (
    <section className="relative max-w-6xl mx-auto px-4 py-16">
      {/* BACKGROUND DECOR */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-28 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-brand-500/30 to-brand-800/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-400/25 to-brand-700/25 blur-3xl" />
      </div>

      {/* HERO */}
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur px-3 py-1 text-xs text-neutral-600 dark:text-neutral-300">
          <ShieldCheckIcon className="w-4 h-4" />
          Système d’audit numérique — Institutionnel & Sécurisé
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50">
          Bienvenue sur <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-800">Audit&nbsp;Numérique</span>
        </h1>
        <p className="mt-3 text-lg text-neutral-700 dark:text-neutral-300">
          Front-end <span className="font-medium">React Router + Tailwind</span> connecté à ton API DRF
          (rôles, utilisateurs, coopératives, membres, cotisations, …) avec IA & temps réel.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/app"
            className="px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 transition"
          >
            Ouvrir le Dashboard
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            Créer un compte
          </Link>
          <a
            href={`${apiUrl}swagger/`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            Swagger <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* FEATURES */}
      <div className="grid md:grid-cols-3 gap-4">
        <FeatureCard
          icon={<ShieldCheckIcon className="w-5 h-5" />}
          title="Authentification JWT"
          items={[
            "Inscription / Connexion",
            "Refresh token automatique",
            "Profil /utilisateurs/me/",
          ]}
        />
        <FeatureCard
          icon={<ChartBarIcon className="w-5 h-5" />}
          title="Gestion financière"
          items={[
            "Cotisations (création/filtre)",
            "Prêts & remboursements",
            "Transactions & rapports",
          ]}
        />
        <FeatureCard
          icon={<CpuChipIcon className="w-5 h-5" />}
          title="IA & Temps réel"
          items={[
            "Chat IA (LangChain)",
            "Notifications WebSocket",
            "Dashboard + Graphiques",
          ]}
        />
      </div>

      {/* QUICK LINKS */}
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/app/members"
          className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          Membres
        </Link>
        <Link
          to="/app/cotisations"
          className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          Cotisations
        </Link>
        <Link
          to="/app/chat"
          className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          Chat IA
        </Link>
        <Link
          to="/login"
          className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          Connexion
        </Link>
      </div>
    </section>
  );
}

/* ----------------- Sub Components ----------------- */

function StatusPill({ status }: { status: Status }) {
  if (status === "ok") {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 text-emerald-800 px-3 py-1.5 text-sm">
        <CheckCircleIcon className="w-4 h-4" /> API OK
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl bg-red-100 text-red-800 px-3 py-1.5 text-sm">
        <ExclamationTriangleIcon className="w-4 h-4" /> API hors-ligne
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-xl bg-neutral-100 text-neutral-700 px-3 py-1.5 text-sm">
      Vérification…
    </span>
  );
}

function FeatureCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="group rounded-2xl p-[1px] bg-gradient-to-br from-brand-600/25 via-transparent to-transparent hover:from-brand-600/40 transition">
      <div className="h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur p-5 shadow-sm">
        <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
          {items.map((t) => (
            <li key={t} className="flex items-start">
              <CheckCircleIcon className="w-4 h-4 mr-2 mt-0.5 text-brand-600" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
