import { http } from "../lib/http";
import { resourceClient } from "./client";
import type {
  Utilisateur, Cooperative, Membre, Cotisation,
  Pret, Remboursement, Transaction, Message, Notification,
  Audit, Evenement, CoopStats
} from "../models";

/** Ressources CRUD */
export const Utilisateurs  = resourceClient<Utilisateur>("utilisateurs");
export const Cooperatives  = resourceClient<Cooperative>("cooperatives");
export const Membres       = resourceClient<Membre>("membres");
export const Cotisations   = resourceClient<Cotisation>("cotisations");
export const Prets         = resourceClient<Pret>("prets");
export const Remboursements= resourceClient<Remboursement>("remboursements");
export const Transactions  = resourceClient<Transaction>("transactions");
export const Messages      = resourceClient<Message>("messages");
export const Notifications = resourceClient<Notification>("notifications");
export const Audits        = resourceClient<Audit>("audits");
export const EvenementsAPI = resourceClient<Evenement>("evenements");
/** Endpoints custom de UtilisateurViewSet */
/** Endpoints custom */
export const AuthAPI = {
  changePassword: (old_password: string, new_password: string) =>
    http
      .post<{ success: string } | { error: string }>("utilisateurs/change_password/", {
        old_password,
        new_password,
      })
      .then((r) => r.data),
};

export const CooperativeAPI = {
  membres: (id: number) => http.get<Membre[]>(`cooperatives/${id}/membres/`).then((r) => r.data),
  evenements: (id: number) => http.get<Evenement[]>(`cooperatives/${id}/evenements/`).then((r) => r.data),
  statistiques: (id: number) => http.get<CoopStats>(`cooperatives/${id}/statistiques/`).then((r) => r.data),
};

export const MembreAPI = {
  cotisations: (id: number) => http.get<Cotisation[]>(`membres/${id}/cotisations/`).then((r) => r.data),
  prets: (id: number) => http.get<Pret[]>(`membres/${id}/prets/`).then((r) => r.data),
  transactions: (id: number) => http.get<Transaction[]>(`membres/${id}/transactions/`).then((r) => r.data),
};

export const ChatAPI = {
  ask: (msg: string) => http.get<{ response: string }>("chat/", { params: { message: msg } }).then((r) => r.data),
};