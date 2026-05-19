import { WeekData } from '../types';

export interface FoodHistory {
  name: string;
  pointsPerUnit: number;
  lastUsed: number;
  count: number;
}

export interface ActivityHistory {
  name: string;
  intensity: string;
  durationMinutes: number;
  pointsEarned: number;
  lastUsed: number;
  count: number;
}

export function getFoodHistory(weekData: WeekData): FoodHistory[] {
  const foodMap = new Map<string, FoodHistory>();

  Object.values(weekData.days).forEach(day => {
    day.consumptions.forEach(consumption => {
      const key = consumption.foodName.toLowerCase();
      const existing = foodMap.get(key);
      
      if (existing) {
        existing.count++;
        existing.lastUsed = Math.max(existing.lastUsed, consumption.timestamp);
      } else {
        foodMap.set(key, {
          name: consumption.foodName,
          pointsPerUnit: consumption.pointsPerUnit,
          lastUsed: consumption.timestamp,
          count: 1,
        });
      }
    });
  });

  return Array.from(foodMap.values()).sort((a, b) => b.lastUsed - a.lastUsed);
}

export function getActivityHistory(weekData: WeekData): ActivityHistory[] {
  const activityMap = new Map<string, ActivityHistory>();

  Object.values(weekData.days).forEach(day => {
    day.activities.forEach(activity => {
      const key = activity.activityName.toLowerCase();
      const existing = activityMap.get(key);
      
      if (existing) {
        existing.count++;
        existing.lastUsed = Math.max(existing.lastUsed, activity.timestamp);
      } else {
        activityMap.set(key, {
          name: activity.activityName,
          intensity: activity.intensity,
          durationMinutes: activity.durationMinutes,
          pointsEarned: activity.pointsEarned,
          lastUsed: activity.timestamp,
          count: 1,
        });
      }
    });
  });

  return Array.from(activityMap.values()).sort((a, b) => b.lastUsed - a.lastUsed);
}

export function searchFoodHistory(query: string, history: FoodHistory[]): FoodHistory[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return history
    .filter(item => item.name.toLowerCase().includes(lowerQuery))
    .slice(0, 5);
}

export function searchActivityHistory(query: string, history: ActivityHistory[]): ActivityHistory[] {
  if (!query.trim()) return [];
  
  const lowerQuery = query.toLowerCase();
  return history
    .filter(item => item.name.toLowerCase().includes(lowerQuery))
    .slice(0, 5);
}
