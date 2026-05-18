export type ActivityIntensity = 'léger' | 'modéré' | 'élevé';

export type MealType = 'matin' | 'midi' | 'soir' | 'en-cas/plaisir';

export interface Food {
  id: string;
  name: string;
  points: number;
}

export interface Activity {
  id: string;
  name: string;
  intensity: ActivityIntensity;
  durationMinutes: number;
  pointsEarned: number;
}

export interface Consumption {
  id: string;
  foodId: string;
  foodName: string;
  mealType: MealType;
  pointsPerUnit: number;
  quantity: number;
  points: number;
  timestamp: number;
}

export interface ActivityEntry {
  id: string;
  activityName: string;
  intensity: ActivityIntensity;
  durationMinutes: number;
  pointsEarned: number;
  timestamp: number;
}

export interface DayData {
  date: string;
  basePoints: number;
  pointsUsed: number;
  pointsEarned: number;
  consumptions: Consumption[];
  activities: ActivityEntry[];
  carryOverPoints: number;
}

export interface WeekData {
  startDate: string;
  dailyBasePoints: number;
  days: Record<string, DayData>;
}

export interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  timestamp: number;
}

export interface AppData {
  weekData: WeekData;
  weightEntries: WeightEntry[];
}

export type ViewMode = 'daily' | 'history' | 'weight';
