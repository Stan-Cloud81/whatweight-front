import { useState, useEffect } from 'react';
import { historyService } from '../services/historyService';

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

export function useFoodHistoryAPI() {
  const [foodHistory, setFoodHistory] = useState<FoodHistory[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadFoodHistory();
    }
  }, []);

  const loadFoodHistory = async () => {
    try {
      const foods = await historyService.getFoods();
      setFoodHistory(foods);
    } catch (err) {
      console.error('Failed to load food history:', err);
    }
  };

  return { foodHistory, refresh: loadFoodHistory };
}

export function useActivityHistoryAPI() {
  const [activityHistory, setActivityHistory] = useState<ActivityHistory[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadActivityHistory();
    }
  }, []);

  const loadActivityHistory = async () => {
    try {
      const activities = await historyService.getActivities();
      setActivityHistory(activities);
    } catch (err) {
      console.error('Failed to load activity history:', err);
    }
  };

  return { activityHistory, refresh: loadActivityHistory };
}
