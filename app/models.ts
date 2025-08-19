export type AppRole = "tresorier" | "secretaire" | "membre";

export interface Utilisateur {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telephone?: string | null;
  date_inscription: string;
  role: AppRole;          // ← string
  is_staff: boolean;      // admin si true
  is_active: boolean;
}

/* --- Autres modèles inchangés --- */

export interface Cooperative {
  id: number;
  nom: string;
  description: string;
  date_creation: string;
  admin: number | null;
}

export interface Membre {
  id: number;
  utilisateur: number;
  cooperative: number;
  date_adhesion: string;
  actif: boolean;
}

export type StatutCotisation = "en_attente" | "validee" | "rejetee";
export type TypeCotisation = "reguliere" | "exceptionnelle" | "solidarite";
export interface Cotisation {
  id: number;
  membre: number;
  montant: string;
  date_paiement: string;
  type: TypeCotisation;
  statut: StatutCotisation;
}

export type StatutPret = "demande" | "approuve" | "rejete" | "en_cours" | "rembourse" | "en_retard";
export interface Pret {
  id: number;
  membre: number;
  montant: string;
  taux_interet: string;
  date_demande: string;
  date_approbation?: string | null;
  date_echeance?: string | null;
  statut: StatutPret;
  motif: string;
}

export type MethodePaiement = "especes" | "mobile_money" | "virement" | "autre";
export interface Remboursement {
  id: number;
  pret: number;
  montant: string;
  date_paiement: string;
  methode_paiement: MethodePaiement;
}

export type TypeTransaction = "cotisation" | "pret" | "remboursement" | "autre";
export interface Transaction {
  id: number;
  type: TypeTransaction;
  montant: string;
  date_transaction: string;
  membre: number;
  description: string;
  reference: string;
}

export type TypeNotification = "cotisation" | "pret" | "remboursement" | "systeme" | "autre";
export interface Notification {
  id: number;
  utilisateur: number;
  type: TypeNotification;
  contenu: string;
  date_creation: string;
  lue: boolean;
}

export type TypeAudit = "financier" | "securite" | "systeme" | "utilisateur";
export interface Audit {
  id: number;
  type: TypeAudit;
  description: string;
  date_creation: string;
  details: Record<string, any>;
  utilisateur: number | null;
}

export interface Evenement {
  id: number;
  titre: string;
  description: string;
  date_debut: string;
  date_fin: string;
  cooperative: number;
}

export interface Message {
  id: number;
  expediteur: number;
  destinataire: number;
  contenu: string;
  date_envoi: string;
  lu: boolean;
}

/* --- Réponses API spécifiques --- */
export interface LoginResponse {
  access: string;
  refresh: string;
  user: Utilisateur;
}

export interface CoopStats {
  nb_membres: number;
  nb_membres_actifs: number;
  total_cotisations: string;
  total_prets: string;
  total_remboursements: string;
  solde: number;
}