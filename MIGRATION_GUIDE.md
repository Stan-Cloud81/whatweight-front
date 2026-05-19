# Guide de Migration vers l'API

Ce guide explique comment basculer entre le mode localStorage (actuel) et le mode API.

## Fichiers Créés

### Services API
- `src/services/api.ts` - Configuration axios avec intercepteurs JWT
- `src/services/authService.ts` - Authentification (login, register, logout)
- `src/services/profileService.ts` - Gestion du profil utilisateur
- `src/services/daysService.ts` - Gestion des jours
- `src/services/consumptionsService.ts` - Gestion des consommations
- `src/services/activitiesService.ts` - Gestion des activités
- `src/services/weightsService.ts` - Gestion des poids
- `src/services/historyService.ts` - Historique pour autocomplete

### Hooks API
- `src/hooks/usePointsTrackerAPI.ts` - Remplacement de `usePointsTracker`
- `src/hooks/useWeightTrackerAPI.ts` - Remplacement de `useWeightTracker`
- `src/hooks/useUserProfileAPI.ts` - Remplacement de `useUserProfile`
- `src/hooks/useHistoryAPI.ts` - Historique avec API

### Contextes & Pages
- `src/contexts/AuthContext.tsx` - Gestion de l'authentification
- `src/pages/LoginPage.tsx` - Page de connexion/inscription
- `src/AppWithAPI.tsx` - Version de l'app avec API

### Configuration
- `.env.development` - URL de l'API en développement
- `.env.production` - URL de l'API en production

## Basculer vers le Mode API

### 1. Renommer les fichiers

```bash
# Sauvegarder l'ancienne version
mv src/App.tsx src/AppWithLocalStorage.tsx

# Activer la version API
mv src/AppWithAPI.tsx src/App.tsx
```

### 2. Mettre à jour main.tsx

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Maintenant c'est AppWithAPI
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 3. Configuration de l'API

Créer ou modifier `.env.development`:
```env
VITE_API_URL=http://localhost:8080/v1
```

Pour la production, `.env.production`:
```env
VITE_API_URL=https://api.whatweight.app/v1
```

## Revenir au Mode LocalStorage

Si vous voulez revenir au stockage local:

```bash
# Sauvegarder la version API
mv src/App.tsx src/AppWithAPI.tsx

# Restaurer la version localStorage
mv src/AppWithLocalStorage.tsx src/App.tsx
```

## Différences Principales

### Mode localStorage (Actuel)
```typescript
// Hooks synchrones
const { todayData, addConsumption } = usePointsTracker();

// Ajout instantané
addConsumption(name, points, mealType, quantity);
```

### Mode API
```typescript
// Hooks asynchrones
const { todayData, addConsumption } = usePointsTrackerAPI();

// Ajout avec await
await addConsumption(name, points, mealType, quantity);

// Gestion de l'authentification
const { isAuthenticated, login } = useAuth();
```

## Features du Mode API

### ✅ Nouveautés
- Authentification utilisateur (login/register)
- Synchronisation multi-appareils
- Sauvegarde centralisée
- Gestion des erreurs réseau
- Indicateurs de chargement

### ⚠️ Prérequis
- API Backend démarrée sur http://localhost:8080
- Compte utilisateur créé
- Connexion internet

## Tests

### Tester en Mode API

1. **Démarrer l'API Backend**
   ```bash
   cd ../whatweight-api
   go run cmd/server/main.go
   ```

2. **Démarrer le Frontend**
   ```bash
   npm run dev
   ```

3. **Créer un compte**
   - Ouvrir http://localhost:5173
   - Cliquer sur "S'inscrire"
   - Remplir le formulaire

4. **Utiliser l'application**
   - Toutes les données sont maintenant synchronisées avec l'API
   - Les données persistent après déconnexion

## Migration des Données

Pour migrer les données du localStorage vers l'API:

```typescript
// Script de migration (à exécuter dans la console du navigateur)
const migrateData = async () => {
  const weekData = JSON.parse(localStorage.getItem('whatweight-data') || '{}');
  const weightData = JSON.parse(localStorage.getItem('whatweight-weight-data') || '[]');
  const profileData = JSON.parse(localStorage.getItem('whatweight-user-profile') || '{}');

  // L'endpoint /import de l'API accepte ces données
  const response = await fetch('http://localhost:8080/v1/import', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN_HERE'
    },
    body: JSON.stringify({
      weekData,
      weightEntries: weightData,
      userProfile: profileData
    })
  });

  console.log('Migration result:', await response.json());
};

// Appeler la fonction
migrateData();
```

## Troubleshooting

### L'API ne répond pas
- Vérifier que l'API backend est démarrée
- Vérifier l'URL dans `.env.development`
- Vérifier les logs de la console

### Erreur 401 Unauthorized
- Le token JWT a expiré
- Se reconnecter

### Erreur CORS
- Vérifier la configuration CORS de l'API
- L'API doit autoriser l'origine du frontend

## Performance

### Mode LocalStorage
- ✅ Instantané (pas de réseau)
- ❌ Pas de synchronisation
- ❌ Limité à un appareil

### Mode API
- ✅ Synchronisation multi-appareils
- ✅ Sauvegarde centralisée
- ❌ Latence réseau
- ✅ Cache côté client possible

## Prochaines Étapes

1. ✅ Services API créés
2. ✅ Hooks API créés
3. ✅ Authentification implémentée
4. ✅ Pages login/register créées
5. ⏳ Tests d'intégration
6. ⏳ Gestion du cache (React Query recommandé)
7. ⏳ Mode offline (Service Worker)
8. ⏳ Optimistic updates

---

**Note**: Les deux modes peuvent coexister. Le fichier `AppWithLocalStorage.tsx` reste disponible pour revenir en arrière si nécessaire.
