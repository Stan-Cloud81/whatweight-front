# API REST Specification pour WhatWeight

Ce document contient toutes les spécifications nécessaires pour développer une API REST en Go avec SQL Server pour remplacer le système de stockage local de WhatWeight.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Modèles de Données](#modèles-de-données)
3. [Architecture](#architecture)
4. [Endpoints API](#endpoints-api)
5. [Schéma de Base de Données](#schéma-de-base-de-données)
6. [Authentification](#authentification)
7. [Logique Métier](#logique-métier)
8. [Migration des Données](#migration-des-données)

---

## Vue d'ensemble

### Objectif
Remplacer le stockage local (localStorage) par une API REST permettant :
- Synchronisation multi-appareils
- Sauvegarde centralisée des données
- Authentification utilisateur
- Historique persistant

### Stack Technique Recommandée
- **Langage** : Go (Golang) 1.21+
- **Framework Web** : Gin ou Echo
- **Base de données** : SQL Server 2019+
- **ORM** : GORM ou SQLx
- **Authentification** : JWT
- **Documentation** : Swagger/OpenAPI

---

## Modèles de Données

### Structure TypeScript Actuelle (Frontend)

```typescript
// types.ts

export type ActivityIntensity = 'léger' | 'modéré' | 'élevé';
export type MealType = 'matin' | 'midi' | 'soir' | 'en-cas/plaisir';
export type Gender = 'femme' | 'homme';

export interface UserProfile {
  gender: Gender | null;
  birthDate: string | null;  // Format ISO: YYYY-MM-DD
  height: number | null;      // en cm
}

export interface Consumption {
  id: string;
  foodId: string;
  foodName: string;
  mealType: MealType;
  pointsPerUnit: number;
  quantity: number;
  points: number;
  timestamp: number;          // Unix timestamp en ms
}

export interface ActivityEntry {
  id: string;
  activityName: string;
  intensity: ActivityIntensity;
  durationMinutes: number;
  pointsEarned: number;
  timestamp: number;          // Unix timestamp en ms
}

export interface DayData {
  date: string;               // Format: YYYY-MM-DD
  basePoints: number;
  pointsUsed: number;
  pointsEarned: number;
  consumptions: Consumption[];
  activities: ActivityEntry[];
  carryOverPoints: number;
}

export interface WeekData {
  startDate: string;          // Format: YYYY-MM-DD
  dailyBasePoints: number;
  days: Record<string, DayData>;  // key = date (YYYY-MM-DD)
}

export interface WeightEntry {
  id: string;
  date: string;               // Format: YYYY-MM-DD
  weight: number;             // en kg
  timestamp: number;          // Unix timestamp en ms
}
```

### Formules de Calcul

#### Points de Base
```
basePoints = genderPoints + weightPoints + agePoints + heightPoints

où:
- genderPoints = 8 (homme) ou 2 (femme)
- weightPoints = Math.floor((weight * 2.205) / 10)
- agePoints = 
  * 4 si 17-26 ans
  * 3 si 27-37 ans
  * 2 si 38-47 ans
  * 1 si 48-58 ans
  * 0 si >58 ans
- heightPoints = 1 (< 160cm) ou 2 (>= 160cm)

IMPORTANT: Le résultat final doit être arrondi à l'inférieur (Math.floor)
```

#### Points d'Activité
```typescript
function calculateActivityPoints(
  intensity: ActivityIntensity,
  durationMinutes: number,
  weightKg: number
): number {
  const intensityMultipliers = {
    'léger': 3,
    'modéré': 4,
    'élevé': 6
  };
  
  const multiplier = intensityMultipliers[intensity];
  const hours = durationMinutes / 60;
  const weightFactor = weightKg / 68;
  
  return Math.round(hours * multiplier * weightFactor);
}
```

#### Points Restants du Jour
```typescript
function calculateDayRemainingPoints(
  basePoints: number,
  pointsUsed: number,
  pointsEarned: number,
  carryOverPoints: number
): number {
  return basePoints + carryOverPoints + pointsEarned - pointsUsed;
}
```

#### Report de Points (Carry Over)
Les points restants positifs d'un jour sont reportés au jour suivant.
```typescript
// Si remainingPoints > 0, alors carryOverPoints du lendemain = remainingPoints
// Si remainingPoints <= 0, alors carryOverPoints du lendemain = 0
```

---

## Architecture

### Architecture Recommandée

```
api/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── models/
│   │   ├── user.go
│   │   ├── profile.go
│   │   ├── day.go
│   │   ├── consumption.go
│   │   ├── activity.go
│   │   └── weight.go
│   ├── database/
│   │   ├── connection.go
│   │   └── migrations.go
│   ├── handlers/
│   │   ├── auth.go
│   │   ├── profile.go
│   │   ├── days.go
│   │   ├── consumptions.go
│   │   ├── activities.go
│   │   └── weights.go
│   ├── services/
│   │   ├── auth_service.go
│   │   ├── profile_service.go
│   │   ├── points_calculator.go
│   │   └── carry_over_service.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── cors.go
│   │   └── logging.go
│   └── config/
│       └── config.go
├── pkg/
│   └── utils/
│       ├── jwt.go
│       └── validators.go
├── docs/
│   └── swagger.yaml
├── go.mod
├── go.sum
└── README.md
```

---

## Endpoints API

### Base URL
```
Production: https://api.whatweight.app/v1
Development: http://localhost:8080/v1
```

### Authentication

#### POST /auth/register
Inscription d'un nouvel utilisateur.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response 201:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-05-19T10:30:00Z"
  },
  "token": "jwt-token-here"
}
```

#### POST /auth/login
Connexion utilisateur.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

#### POST /auth/refresh
Rafraîchir le token JWT.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "token": "new-jwt-token-here"
}
```

---

### User Profile

#### GET /profile
Récupérer le profil utilisateur.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "gender": "homme",
  "birthDate": "1990-05-15",
  "height": 175
}
```

#### PUT /profile
Mettre à jour le profil utilisateur.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "gender": "homme",
  "birthDate": "1990-05-15",
  "height": 175
}
```

**Response 200:**
```json
{
  "gender": "homme",
  "birthDate": "1990-05-15",
  "height": 175,
  "updatedAt": "2025-05-19T10:30:00Z"
}
```

**Logique Métier:**
- Après mise à jour du profil, recalculer basePoints pour tous les jours >= aujourd'hui
- Utiliser le poids le plus récent pour le calcul

---

### Days

#### GET /days
Récupérer tous les jours de l'utilisateur.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `from` (optional): Date de début (YYYY-MM-DD)
- `to` (optional): Date de fin (YYYY-MM-DD)

**Response 200:**
```json
{
  "days": [
    {
      "date": "2025-05-19",
      "basePoints": 31,
      "pointsUsed": 25,
      "pointsEarned": 4,
      "carryOverPoints": 0,
      "consumptions": [...],
      "activities": [...]
    }
  ],
  "dailyBasePoints": 31,
  "startDate": "2025-05-13"
}
```

#### GET /days/:date
Récupérer un jour spécifique.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "date": "2025-05-19",
  "basePoints": 31,
  "pointsUsed": 25,
  "pointsEarned": 4,
  "carryOverPoints": 0,
  "consumptions": [
    {
      "id": "uuid",
      "foodName": "Pomme",
      "mealType": "en-cas/plaisir",
      "pointsPerUnit": 0,
      "quantity": 1,
      "points": 0,
      "timestamp": 1716116400000
    }
  ],
  "activities": [
    {
      "id": "uuid",
      "activityName": "Course",
      "intensity": "modéré",
      "durationMinutes": 30,
      "pointsEarned": 4,
      "timestamp": 1716120000000
    }
  ]
}
```

**Logique Métier:**
- Si le jour n'existe pas, le créer avec les valeurs par défaut
- Calculer carryOverPoints depuis le jour précédent
- basePoints = dailyBasePoints de l'utilisateur

---

### Consumptions

#### POST /days/:date/consumptions
Ajouter une consommation.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "foodName": "Pomme",
  "mealType": "en-cas/plaisir",
  "pointsPerUnit": 0,
  "quantity": 1
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "foodId": "uuid",
  "foodName": "Pomme",
  "mealType": "en-cas/plaisir",
  "pointsPerUnit": 0,
  "quantity": 1,
  "points": 0,
  "timestamp": 1716116400000
}
```

**Logique Métier:**
- points = pointsPerUnit * quantity
- Mettre à jour pointsUsed du jour
- Recalculer carryOverPoints du jour suivant

#### PATCH /consumptions/:id
Modifier la quantité d'une consommation.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "quantity": 2
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "quantity": 2,
  "points": 0,
  "updatedAt": "2025-05-19T10:30:00Z"
}
```

**Logique Métier:**
- Recalculer points = pointsPerUnit * nouvelle quantity
- Mettre à jour pointsUsed du jour
- Si quantity <= 0, supprimer la consommation
- Recalculer carryOverPoints du jour suivant

#### DELETE /consumptions/:id
Supprimer une consommation.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 204:** No Content

**Logique Métier:**
- Mettre à jour pointsUsed du jour
- Recalculer carryOverPoints du jour suivant

---

### Activities

#### POST /days/:date/activities
Ajouter une activité.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "activityName": "Course",
  "intensity": "modéré",
  "durationMinutes": 30
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "activityName": "Course",
  "intensity": "modéré",
  "durationMinutes": 30,
  "pointsEarned": 4,
  "timestamp": 1716120000000
}
```

**Logique Métier:**
- Calculer pointsEarned avec la formule selon poids actuel
- Mettre à jour pointsEarned du jour
- Recalculer carryOverPoints du jour suivant

#### DELETE /activities/:id
Supprimer une activité.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 204:** No Content

**Logique Métier:**
- Mettre à jour pointsEarned du jour
- Recalculer carryOverPoints du jour suivant

---

### Weights

#### GET /weights
Récupérer tous les poids de l'utilisateur.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "weights": [
    {
      "id": "uuid",
      "date": "2025-05-19",
      "weight": 70.5,
      "timestamp": 1716116400000
    }
  ]
}
```

#### POST /weights
Ajouter un poids.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "weight": 70.5,
  "date": "2025-05-19"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "date": "2025-05-19",
  "weight": 70.5,
  "timestamp": 1716116400000
}
```

**Logique Métier CRITIQUE:**
1. Si une entrée existe déjà pour cette date, la mettre à jour
2. Recalculer basePoints avec le nouveau poids pour tous les jours >= date du poids
3. Formule: `basePoints = calculateBasePoints(gender, weight, birthDate, height)`
4. Mettre à jour dailyBasePoints de l'utilisateur
5. Recalculer tous les carryOverPoints des jours suivants

#### DELETE /weights/:id
Supprimer un poids.

**Headers:**
```
Authorization: Bearer {token}
```

**Response 204:** No Content

**Logique Métier CRITIQUE:**
1. Après suppression, prendre le poids le plus récent restant
2. Recalculer basePoints pour tous les jours >= aujourd'hui avec ce poids
3. Mettre à jour dailyBasePoints de l'utilisateur
4. Recalculer tous les carryOverPoints des jours suivants

---

### History & Statistics

#### GET /history/foods
Récupérer l'historique des aliments consommés (pour autocomplete).

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "foods": [
    {
      "name": "Pomme",
      "pointsPerUnit": 0,
      "lastUsed": 1716116400000,
      "count": 15
    }
  ]
}
```

#### GET /history/activities
Récupérer l'historique des activités (pour autocomplete).

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "activities": [
    {
      "name": "Course",
      "intensity": "modéré",
      "durationMinutes": 30,
      "lastUsed": 1716120000000,
      "count": 10
    }
  ]
}
```

---

## Schéma de Base de Données

### Tables SQL Server

```sql
-- Table Users
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE INDEX idx_users_email ON users(email);

-- Table UserProfiles
CREATE TABLE user_profiles (
    user_id UNIQUEIDENTIFIER PRIMARY KEY,
    gender NVARCHAR(10) CHECK (gender IN ('homme', 'femme')),
    birth_date DATE,
    height INT, -- en cm
    daily_base_points INT DEFAULT 31,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table Days
CREATE TABLE days (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    date DATE NOT NULL,
    base_points INT NOT NULL,
    points_used DECIMAL(10,2) DEFAULT 0,
    points_earned INT DEFAULT 0,
    carry_over_points INT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, date)
);

CREATE INDEX idx_days_user_date ON days(user_id, date);
CREATE INDEX idx_days_date ON days(date);

-- Table Consumptions
CREATE TABLE consumptions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    day_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    food_id UNIQUEIDENTIFIER,
    food_name NVARCHAR(255) NOT NULL,
    meal_type NVARCHAR(20) CHECK (meal_type IN ('matin', 'midi', 'soir', 'en-cas/plaisir')),
    points_per_unit DECIMAL(10,2) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    points DECIMAL(10,2) NOT NULL,
    timestamp BIGINT NOT NULL, -- Unix timestamp en ms
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_consumptions_day ON consumptions(day_id);
CREATE INDEX idx_consumptions_user ON consumptions(user_id);
CREATE INDEX idx_consumptions_food_name ON consumptions(food_name);

-- Table Activities
CREATE TABLE activities (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    day_id UNIQUEIDENTIFIER NOT NULL,
    user_id UNIQUEIDENTIFIER NOT NULL,
    activity_name NVARCHAR(255) NOT NULL,
    intensity NVARCHAR(20) CHECK (intensity IN ('léger', 'modéré', 'élevé')),
    duration_minutes INT NOT NULL,
    points_earned INT NOT NULL,
    timestamp BIGINT NOT NULL, -- Unix timestamp en ms
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (day_id) REFERENCES days(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_activities_day ON activities(day_id);
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_name ON activities(activity_name);

-- Table Weights
CREATE TABLE weights (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    date DATE NOT NULL,
    weight DECIMAL(5,2) NOT NULL, -- en kg
    timestamp BIGINT NOT NULL, -- Unix timestamp en ms
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, date)
);

CREATE INDEX idx_weights_user_date ON weights(user_id, date);

-- Table pour l'historique des aliments (pour autocomplete)
CREATE TABLE food_history (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(255) NOT NULL,
    points_per_unit DECIMAL(10,2) NOT NULL,
    last_used BIGINT NOT NULL,
    usage_count INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

CREATE INDEX idx_food_history_user ON food_history(user_id);
CREATE INDEX idx_food_history_last_used ON food_history(last_used);

-- Table pour l'historique des activités (pour autocomplete)
CREATE TABLE activity_history (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(255) NOT NULL,
    intensity NVARCHAR(20),
    duration_minutes INT,
    last_used BIGINT NOT NULL,
    usage_count INT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
);

CREATE INDEX idx_activity_history_user ON activity_history(user_id);
CREATE INDEX idx_activity_history_last_used ON activity_history(last_used);
```

---

## Authentification

### JWT (JSON Web Token)

**Token Structure:**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "exp": 1716206400,
  "iat": 1716120000
}
```

**Configuration:**
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Expiration:** 7 jours
- **Secret:** Variable d'environnement `JWT_SECRET`

**Headers:**
```
Authorization: Bearer {token}
```

**Middleware:**
- Vérifier la présence du token
- Valider la signature
- Vérifier l'expiration
- Extraire userId et l'ajouter au contexte de la requête

---

## Logique Métier

### Service: Points Calculator

#### Calcul des Points de Base
```go
func CalculateBasePoints(gender string, weight float64, birthDate time.Time, height int) int {
    genderPoints := 2
    if gender == "homme" {
        genderPoints = 8
    }
    
    weightPoints := int(math.Floor((weight * 2.205) / 10))
    
    age := calculateAge(birthDate)
    agePoints := 0
    if age >= 17 && age <= 26 {
        agePoints = 4
    } else if age >= 27 && age <= 37 {
        agePoints = 3
    } else if age >= 38 && age <= 47 {
        agePoints = 2
    } else if age >= 48 && age <= 58 {
        agePoints = 1
    }
    
    heightPoints := 1
    if height >= 160 {
        heightPoints = 2
    }
    
    return int(math.Floor(float64(genderPoints + weightPoints + agePoints + heightPoints)))
}

func calculateAge(birthDate time.Time) int {
    now := time.Now()
    age := now.Year() - birthDate.Year()
    if now.YearDay() < birthDate.YearDay() {
        age--
    }
    return age
}
```

#### Calcul des Points d'Activité
```go
func CalculateActivityPoints(intensity string, durationMinutes int, weight float64) int {
    intensityMap := map[string]int{
        "léger":  3,
        "modéré": 4,
        "élevé":  6,
    }
    
    multiplier := intensityMap[intensity]
    hours := float64(durationMinutes) / 60.0
    weightFactor := weight / 68.0
    
    return int(math.Round(hours * float64(multiplier) * weightFactor))
}
```

### Service: Carry Over

#### Calcul du Report de Points
```go
func RecalculateCarryOver(userId string, startDate time.Time) error {
    // 1. Récupérer tous les jours à partir de startDate, triés par date
    days := getDaysSince(userId, startDate)
    
    // 2. Pour chaque jour, calculer le carryOver depuis le jour précédent
    for i, day := range days {
        if i == 0 {
            // Premier jour : vérifier s'il y a un jour précédent
            previousDay := getDayBefore(userId, day.Date)
            if previousDay != nil {
                day.CarryOverPoints = calculateRemainingPoints(previousDay)
                if day.CarryOverPoints < 0 {
                    day.CarryOverPoints = 0
                }
            } else {
                day.CarryOverPoints = 0
            }
        } else {
            // Jours suivants : utiliser le jour précédent dans la liste
            previousDay := days[i-1]
            remaining := calculateRemainingPoints(previousDay)
            day.CarryOverPoints = max(0, remaining)
        }
        
        // 3. Sauvegarder le jour mis à jour
        updateDay(day)
    }
    
    return nil
}

func calculateRemainingPoints(day *Day) int {
    return day.BasePoints + day.CarryOverPoints + day.PointsEarned - int(day.PointsUsed)
}
```

### Service: Base Points Updater

#### Mise à jour des Points de Base
```go
func UpdateBasePointsFromToday(userId string, newBasePoints int) error {
    today := time.Now().Format("2006-01-02")
    
    // 1. Mettre à jour tous les jours >= aujourd'hui
    db.Model(&Day{}).
        Where("user_id = ? AND date >= ?", userId, today).
        Update("base_points", newBasePoints)
    
    // 2. Mettre à jour le profil utilisateur
    db.Model(&UserProfile{}).
        Where("user_id = ?", userId).
        Update("daily_base_points", newBasePoints)
    
    // 3. Recalculer les carry over depuis aujourd'hui
    todayDate, _ := time.Parse("2006-01-02", today)
    return RecalculateCarryOver(userId, todayDate)
}
```

### Triggers et Événements

#### Après ajout/modification de poids
```go
// 1. Récupérer le profil utilisateur
// 2. Calculer les nouveaux basePoints
// 3. Mettre à jour tous les jours >= date du poids
// 4. Recalculer les carry over
```

#### Après ajout/modification/suppression de consommation
```go
// 1. Recalculer pointsUsed du jour
// 2. Recalculer les carry over depuis ce jour
```

#### Après ajout/suppression d'activité
```go
// 1. Recalculer pointsEarned du jour
// 2. Recalculer les carry over depuis ce jour
```

#### Après modification du profil
```go
// 1. Récupérer le poids le plus récent
// 2. Calculer les nouveaux basePoints
// 3. Mettre à jour tous les jours >= aujourd'hui
// 4. Recalculer les carry over depuis aujourd'hui
```

---

## Migration des Données

### Export depuis localStorage

Le frontend actuel stocke trois clés dans localStorage:
1. `whatweight-data` : WeekData
2. `whatweight-weight-data` : WeightEntry[]
3. `whatweight-user-profile` : UserProfile

### Endpoint d'Import

#### POST /import
Importer des données depuis localStorage.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "weekData": { ... },
  "weightEntries": [ ... ],
  "userProfile": { ... }
}
```

**Response 200:**
```json
{
  "imported": {
    "days": 45,
    "consumptions": 230,
    "activities": 67,
    "weights": 15
  }
}
```

**Logique d'Import:**
```go
1. Importer le profil utilisateur
2. Importer tous les poids (dans l'ordre chronologique)
3. Pour chaque jour dans weekData.days:
   a. Créer le jour
   b. Importer toutes les consommations
   c. Importer toutes les activités
4. Recalculer tous les carry over depuis le premier jour
5. Vérifier la cohérence des données
```

---

## Configuration & Variables d'Environnement

```env
# Server
PORT=8080
ENV=production

# Database
DB_HOST=localhost
DB_PORT=1433
DB_USER=sa
DB_PASSWORD=YourStrongPassword!
DB_NAME=whatweight
DB_SSL_MODE=disable

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=168h  # 7 days

# CORS
CORS_ORIGINS=https://whatweight.app,http://localhost:5173

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1m

# Logging
LOG_LEVEL=info
```

---

## Tests Recommandés

### Tests Unitaires
- Calcul des points de base
- Calcul des points d'activité
- Calcul du carry over
- Validation des données

### Tests d'Intégration
- CRUD complet pour chaque entité
- Recalcul automatique des points
- Gestion des carry over
- Import de données

### Tests de Performance
- Requêtes sur 1000+ jours
- Import de données massives
- Calculs avec de nombreux carry over

---

## Sécurité

### Best Practices
1. **Validation des Entrées**
   - Valider tous les champs avec des règles strictes
   - Sanitize les inputs utilisateur

2. **Rate Limiting**
   - Limiter les requêtes par IP/utilisateur
   - Protection contre les attaques DDoS

3. **HTTPS Obligatoire**
   - Toutes les communications en HTTPS
   - HSTS headers

4. **Protection CORS**
   - Whitelist des origines autorisées
   - Credentials autorisés uniquement pour les origines de confiance

5. **SQL Injection**
   - Utiliser un ORM (GORM)
   - Prepared statements obligatoires

6. **XSS Protection**
   - Headers de sécurité appropriés
   - Content-Type validation

---

## Documentation API

### Swagger/OpenAPI
Générer automatiquement la documentation avec swag:
```bash
swag init -g cmd/server/main.go
```

### Exemples de Requêtes (cURL)

```bash
# Login
curl -X POST https://api.whatweight.app/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'

# Ajouter une consommation
curl -X POST https://api.whatweight.app/v1/days/2025-05-19/consumptions \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"foodName":"Pomme","mealType":"en-cas/plaisir","pointsPerUnit":0,"quantity":1}'
```

---

## Déploiement

### Docker
```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o /whatweight-api ./cmd/server

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /whatweight-api .
EXPOSE 8080
CMD ["./whatweight-api"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=sqlserver
      - DB_NAME=whatweight
    depends_on:
      - sqlserver
  
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrongPassword!
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/opt/mssql

volumes:
  sqldata:
```

---

## Modifications Frontend Nécessaires

### 1. Remplacer les Hooks de Stockage Local

**Avant (usePointsTracker.ts):**
```typescript
const stored = localStorage.getItem(STORAGE_KEY);
```

**Après:**
```typescript
const { data } = await fetch('/api/v1/days');
```

### 2. Ajouter un Service API

Créer `src/services/api.ts`:
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://localhost:8080/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 3. Créer des Services par Entité

**src/services/daysService.ts:**
```typescript
import api from './api';

export const daysService = {
  getAll: () => api.get('/days'),
  getByDate: (date: string) => api.get(`/days/${date}`),
};
```

**src/services/consumptionsService.ts:**
```typescript
import api from './api';

export const consumptionsService = {
  add: (date: string, data: any) => 
    api.post(`/days/${date}/consumptions`, data),
  update: (id: string, data: any) => 
    api.patch(`/consumptions/${id}`, data),
  delete: (id: string) => 
    api.delete(`/consumptions/${id}`),
};
```

### 4. Ajouter Gestion d'Authentification

**src/contexts/AuthContext.tsx:**
```typescript
import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 5. Variables d'Environnement

**.env.development:**
```env
VITE_API_URL=http://localhost:8080/v1
```

**.env.production:**
```env
VITE_API_URL=https://api.whatweight.app/v1
```

---

## Checklist de Développement

### Phase 1: Setup
- [ ] Initialiser le projet Go
- [ ] Configurer la connexion SQL Server
- [ ] Créer les tables de base de données
- [ ] Setup du système d'authentification JWT

### Phase 2: API Core
- [ ] Endpoints d'authentification
- [ ] Endpoints de profil utilisateur
- [ ] Endpoints de jours
- [ ] Endpoints de consommations
- [ ] Endpoints d'activités
- [ ] Endpoints de poids

### Phase 3: Logique Métier
- [ ] Service de calcul des points de base
- [ ] Service de calcul des points d'activité
- [ ] Service de gestion du carry over
- [ ] Service de mise à jour automatique des points

### Phase 4: Features Avancées
- [ ] Historique des aliments (autocomplete)
- [ ] Historique des activités (autocomplete)
- [ ] Endpoint d'import depuis localStorage
- [ ] Statistics et rapports

### Phase 5: Tests & Déploiement
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Documentation Swagger
- [ ] Containerisation Docker
- [ ] CI/CD Pipeline
- [ ] Déploiement production

---

## Ressources

### Documentation Go
- [GORM Documentation](https://gorm.io/docs/)
- [Gin Web Framework](https://gin-gonic.com/docs/)
- [JWT-Go](https://github.com/golang-jwt/jwt)

### SQL Server
- [SQL Server on Docker](https://hub.docker.com/_/microsoft-mssql-server)
- [GORM SQL Server Driver](https://github.com/go-gorm/sqlserver)

### Frontend
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Query](https://tanstack.com/query/latest) (recommandé pour le cache et la gestion d'état)

---

## Contact & Support

Pour toute question concernant cette spécification, ouvrir une issue sur le repository GitHub.

---

**Version:** 1.0.0  
**Dernière mise à jour:** 2025-05-19
