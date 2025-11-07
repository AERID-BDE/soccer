# Tournoi de Football - Application de Gestion

Application React pour gérer des tournois de football avec suivi des joueurs, équipes, matchs et classements.

## 🚀 Démarrage rapide

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Un compte Google pour configurer OAuth

### Installation

1. Clonez le repository
2. Installez les dépendances :
```bash
npm install
```

3. Configurez Google OAuth :
   - Créez un fichier `.env` à la racine du projet
   - Obtenez un Client ID Google depuis [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Ajoutez votre Client ID dans le fichier `.env` :
   ```
   VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
   ```
   - Dans Google Cloud Console, configurez les "Authorized JavaScript origins" :
     - Pour le développement local : `http://localhost:5173`
     - Pour la production : votre domaine de production
   - Configurez les "Authorized redirect URIs" si nécessaire

4. Lancez l'application en mode développement :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🔐 Authentification

L'application utilise Google OAuth pour l'authentification. Seuls les utilisateurs authentifiés peuvent accéder à l'application.

### Configuration Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API "Google+ API" ou "Google Identity Services"
4. Allez dans "Credentials" et créez un "OAuth 2.0 Client ID"
5. Configurez :
   - **Application type** : Web application
   - **Authorized JavaScript origins** : 
     - `http://localhost:5173` (développement)
     - Votre domaine de production
   - **Authorized redirect URIs** : (optionnel pour Google Identity Services)
6. Copiez le Client ID et ajoutez-le dans votre fichier `.env`

## 📁 Structure du projet

- `src/App.jsx` - Composant principal gérant l'authentification
- `src/Login.jsx` - Page de connexion avec Google
- `football-tournament.jsx` - Composant principal de l'application
- `public/data.json` - Fichier de stockage des données (mis à jour automatiquement)
- `vite.config.js` - Configuration Vite avec plugin de sauvegarde des données

## 🎯 Fonctionnalités

- ✅ Authentification Google OAuth
- ✅ Gestion des joueurs (ajout, modification, suppression)
- ✅ Import de joueurs depuis un fichier CSV
- ✅ Création et gestion d'événements
- ✅ Génération automatique d'équipes équilibrées
- ✅ Création manuelle ou automatique de matchs
- ✅ Validation des résultats de matchs
- ✅ Classement des joueurs avec statistiques détaillées
- ✅ Désignation automatique du gagnant d'un événement
- ✅ Interface responsive (mobile-friendly)
- ✅ Persistance des données dans `data.json`

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- Mobile (≤ 768px)
- Tablette (768px - 1024px)
- Desktop (> 1024px)

## 🛠️ Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Compile l'application pour la production
- `npm run preview` - Prévisualise la version de production

## 📝 Notes importantes

- Les données sont automatiquement sauvegardées dans `public/data.json` lors des actions
- Les données sont également sauvegardées dans `localStorage` comme backup
- Une fois qu'un événement a un gagnant, certaines actions sont désactivées (ajout de matchs, régénération d'équipes, modification des membres)
- La suppression d'un événement supprime également toutes ses statistiques du classement

## 🔒 Sécurité

- L'accès à l'application est restreint et nécessite une authentification Google
- Les données utilisateur sont stockées localement (localStorage et data.json)
- Pour un déploiement en production, configurez correctement les CORS et les origines autorisées dans Google Cloud Console
