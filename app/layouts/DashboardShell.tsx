// app/layouts/DashboardShell.tsx
import { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import {
  Bars3Icon, XMarkIcon, HomeIcon, UsersIcon,
  CurrencyDollarIcon, BanknotesIcon, BuildingOffice2Icon,
  ChatBubbleLeftRightIcon, BellAlertIcon,
  DocumentChartBarIcon, ShieldCheckIcon,
  EnvelopeIcon, ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../store/auth";

type Item = { to: string; label: string; icon: any; roles?: string[] };

function NavItem({ to, label, icon: Icon }: Item) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition",
          isActive
            ? "bg-brand-100 text-brand-700 dark:bg-neutral-800 dark:text-brand-300"
            : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800",
        ].join(" ")
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );
}

export default function DashboardShell() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.first_name?.[0] || user?.username?.[0] || "?").toUpperCase();

  /* ----- Définis ton menu ici ----- */
  const menu: Item[] = [
    { to: "/app", label: "Aperçu", icon: HomeIcon },
    { to: "/app/members", label: "Membres", icon: UsersIcon },
    { to: "/app/cotisations", label: "Cotisations", icon: CurrencyDollarIcon },
    { to: "/app/prets", label: "Prêts", icon: BanknotesIcon, roles: ["tresorier", "admin"] },
    { to: "/app/remboursements", label: "Remboursements", icon: BanknotesIcon, roles: ["tresorier", "admin"] },
    { to: "/app/transactions", label: "Transactions", icon: DocumentChartBarIcon },
    { to: "/app/cooperatives", label: "Coopératives", icon: BuildingOffice2Icon, roles: ["admin"] },
    { to: "/app/evenements", label: "Événements", icon: ShieldCheckIcon },
    { to: "/app/notifications", label: "Notifications", icon: BellAlertIcon },
    { to: "/app/messages", label: "Messages", icon: EnvelopeIcon },
    { to: "/app/audits", label: "Audit", icon: ShieldCheckIcon, roles: ["admin"] },
    { to: "/app/chat", label: "Chat IA", icon: ChatBubbleLeftRightIcon },
    { to: "/app/profile", label: "Mon profil", icon: UsersIcon },
  ];

  /* Filtre selon rôle */
  const allowed = (item: Item) =>
    !item.roles ||
    item.roles.includes(user?.role || "") ||
    (user?.is_staff ? item.roles.includes("admin") : false);

  const doLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  /* ----- composant NavItems rendu ----- */
  const NavItems = (
    <>
      {menu.filter(allowed).map((i) => (
        <NavItem key={i.to} {...i} />
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* TOPBAR */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg border border-neutral-200 dark:border-neutral-800"
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
            <Link to="/" className="font-semibold text-brand-700 dark:text-brand-300">
              Audit&nbsp;Numérique
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/profile"
              className="hidden md:block text-sm text-neutral-500 hover:underline"
            >
              {user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username : ""}
            </Link>

            <Link
              to="/app/profile"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-brand-600 text-white font-semibold"
              title="Profil"
            >
              {initials}
            </Link>

            <button
              onClick={doLogout}
              className="hidden md:inline-flex items-center gap-1 rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Quitter
            </button>
          </div>
        </div>
      </header>

      {/* LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar desktop */}
        <aside className="hidden md:block">
          <nav className="sticky top-[72px] space-y-1">{NavItems}</nav>
        </aside>

        {/* Contenu */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-brand-700 dark:text-brand-300">Audit&nbsp;Numérique</span>
              <button
                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-800"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1" onClick={() => setOpen(false)}>
              {NavItems}
            </nav>

            <button
              onClick={() => {
                setOpen(false);
                doLogout();
              }}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Quitter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
