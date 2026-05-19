# WhatWeight - Suivi de Points Quotidien

Une application web moderne pour suivre vos points quotidiens, développée avec React et TypeScript.

![WhatWeight](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178c6)

## 🎯 Fonctionnalités

### 📝 Suivi Quotidien
- Ajout de consommations avec calcul automatique des points
- Suivi des activités physiques avec calcul des points gagnés
- Modification des quantités en temps réel
- Historique du jour avec horodatage

### 📊 Historique
- Vue par semaine ou par jour
- Consultation détaillée de chaque journée passée
- Modification/suppression des entrées historiques
- Ajout rétroactif de consommations et activités

### ⚖️ Gestion du Poids
- Enregistrement du poids avec historique complet
- Graphique d'évolution du poids
- Calcul automatique des points de base à chaque enregistrement

### 👤 Profil Utilisateur
- Configuration du profil (sexe, date de naissance, taille)
- Calcul automatique des points de base selon la formule :
  - `Points = [sexe] + [(poids × 2.205) ÷ 10] + [âge] + [taille]`
- Modification du profil avec recalcul automatique

## 🧮 Calcul des Points

### Points de Base
- **Sexe** : Femme = 2, Homme = 8
- **Âge** : 17-26 = 4, 27-37 = 3, 38-47 = 2, 48-58 = 1, >58 = 0
- **Taille** : <160cm = 1, ≥160cm = 2
- **Poids** : (poids en kg × 2.205) ÷ 10

### Points d'Activité
Calculés selon l'intensité et la durée :
- **Léger** : 3 points par heure
- **Modéré** : 4 points par heure
- **Élevé** : 6 points par heure

Formule : `Points = (durée ÷ 60) × intensité × (poids ÷ 68)`

## 🚀 Installation

### Prérequis
- Node.js (v18 ou supérieur)
- npm ou yarn

### Étapes d'installation

```bash
# Cloner le repository
git clone https://github.com/Stan-Cloud81/whatweight-frontend.git

# Naviguer dans le dossier
cd whatweight-frontend

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Construire pour la production
npm run build

# Preview de la version de production
npm run preview
```

## 🛠️ Technologies Utilisées

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server
- **Recharts** - Graphiques
- **LocalStorage** - Stockage des données

## 📱 Fonctionnalités Techniques

- ✅ Progressive Web App (PWA) ready
- ✅ Responsive design (mobile-first)
- ✅ Stockage local des données
- ✅ Autocomplete intelligent pour les aliments et activités
- ✅ Gestion du report de points quotidien
- ✅ Calcul automatique des points d'activité selon le poids

## 📂 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── ActivityForm.tsx
│   ├── ConsumptionForm.tsx
│   ├── ConfirmDialog.tsx
│   ├── EntriesList.tsx
│   ├── NavigationBar.tsx
│   └── ProfileSetup.tsx
├── pages/              # Pages principales
│   ├── DailyPage.tsx
│   ├── HistoryPage.tsx
│   ├── WeightPage.tsx
│   └── ProfilePage.tsx
├── hooks/              # Hooks personnalisés
│   ├── usePointsTracker.ts
│   ├── useWeightTracker.ts
│   ├── useUserProfile.ts
│   └── useHistory.ts
├── utils/              # Utilitaires
│   ├── pointsCalculator.ts
│   ├── basePointsCalculator.ts
│   └── navigation.ts
├── types.ts            # Définitions TypeScript
├── App.tsx             # Composant racine
└── App.css             # Styles globaux
```

## 🔒 Données et Confidentialité

Toutes les données sont stockées localement dans votre navigateur via localStorage. Aucune donnée n'est envoyée à un serveur externe.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Développé avec ❤️ pour faciliter le suivi de vos points

## 🐛 Signaler un Bug

Si vous trouvez un bug, veuillez ouvrir une issue avec :
- Une description claire du problème
- Les étapes pour reproduire
- Le comportement attendu vs le comportement actuel
- Des captures d'écran si pertinent

## 📮 Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur GitHub.
