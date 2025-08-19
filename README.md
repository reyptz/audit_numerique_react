# Application d'Audit Numérique

Application web moderne pour la gestion et le suivi des audits numériques, développée avec React, TypeScript et React Router.

## Fonctionnalités principales

- 📊 Tableau de bord d'audit interactif
- 👥 Gestion des membres et coopératives
- 💬 Système de messagerie intégré
- 🔔 Notifications en temps réel
- 📈 Visualisation des données avec graphiques
- 🔐 Authentification et autorisation sécurisées
- 📱 Interface réactive (mobile & desktop)

## Technologies utilisées

- ⚛️ React 19 avec React Router 7
- 🔷 TypeScript
- 🎨 Tailwind CSS pour le styling
- 📊 Recharts et Chart.js pour les visualisations
- 🏗️ Architecture modulaire et évolutive
- 🔄 Gestion d'état avec Zustand
- 📝 Validation des formulaires avec React Hook Form et Zod

## Prérequis

- Node.js 18+
- npm 9+ ou pnpm 8+ ou yarn 1.22+

## Installation

1. Cloner le dépôt :
   ```bash
   git clone [URL_DU_REPO]
   cd audit-numerique-react
   ```

2. Installer les dépendances :
   ```bash
   npm install
   # ou
   pnpm install
   # ou
   yarn
   ```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables d'environnement nécessaires :

```env
VITE_API_URL=http://localhost:3000/api
# Autres variables d'environnement...
```

## Développement

Pour lancer l'application en mode développement :

```bash
npm run dev
# ou
pnpm dev
# ou
yarn dev
```

L'application sera disponible à l'adresse [http://localhost:5173](http://localhost:5173)

## Construction pour la production

Pour créer une version de production optimisée :

```bash
npm run build
# ou
pnpm build
# ou
yarn build
```

## Déploiement

### Avec Docker

Construire l'image Docker :

```bash
docker build -t audit-numerique .
```

Lancer le conteneur :

```bash
docker run -p 3000:3000 audit-numerique
```

### Déploiement manuel

1. Construire l'application : `npm run build`
2. Le dossier `build` contient les fichiers statiques prêts pour la production
3. Déployez le contenu du dossier `build` sur votre serveur web préféré (Nginx, Apache, etc.)

## Structure du projet

```
app/
├── api/            # Points d'API
├── audits/         # Fonctionnalités d'audit
├── chat/           # Système de chat
├── components/     # Composants réutilisables
├── cooperatives/   # Gestion des coopératives
├── dashboard/      # Tableau de bord
├── layouts/        # Mises en page
├── lib/            # Utilitaires et helpers
├── store/          # Gestion d'état (Zustand)
└── ...
```

## Contribution

1. Créez une branche pour votre fonctionnalité : `git checkout -b feature/nouvelle-fonctionnalite`
2. Committez vos changements : `git commit -m 'Ajout d'une nouvelle fonctionnalité'`
3. Poussez vers la branche : `git push origin feature/nouvelle-fonctionnalite`
4. Créez une Pull Request

## Licence

[À spécifier selon la licence choisie]

---

Développé avec ❤️ par votre équipe
