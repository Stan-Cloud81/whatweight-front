import { useState, useEffect } from 'react';
import {
  DayData,
  WeekData,
  MealType,
  ActivityIntensity,
} from '../types';
import { daysService } from '../services/daysService';
import { consumptionsService } from '../services/consumptionsService';
import { activitiesService } from '../services/activitiesService';
import { getTodayDateString } from '../utils/pointsCalculator';

export function usePointsTrackerAPI(initialBasePoints?: number) {
  const [weekData, setWeekData] = useState<WeekData>({
    startDate: getTodayDateString(),
    dailyBasePoints: initialBasePoints || 0,
    days: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadData = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const response = await daysService.getAll();
      
      const daysRecord: Record<string, DayData> = {};
      response.days.forEach(day => {
        const normalizedDate = day.date.split('T')[0];
        daysRecord[normalizedDate] = { ...day, date: normalizedDate };
      });

      setWeekData({
        startDate: response.startDate,
        dailyBasePoints: response.dailyBasePoints,
        days: daysRecord,
      });
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load data:', err);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const getTodayData = (): DayData => {
    const today = getTodayDateString();
    const data = weekData.days[today] || {
      date: today,
      basePoints: weekData.dailyBasePoints,
      pointsUsed: 0,
      pointsEarned: 0,
      consumptions: [],
      activities: [],
      carryOverPoints: 0,
    };
    return data;
  };

  const addConsumption = async (
    foodName: string,
    pointsPerUnit: number,
    mealType: MealType,
    quantity: number = 1
  ) => {
    try {
      const today = getTodayDateString();
      await consumptionsService.add(today, {
        foodName,
        pointsPerUnit,
        mealType,
        quantity,
      });
      await loadData(true);
    } catch (err) {
      console.error('Failed to add consumption:', err);
      throw err;
    }
  };

  const addActivity = async (
    activityName: string,
    intensity: ActivityIntensity,
    durationMinutes: number
  ) => {
    try {
      const today = getTodayDateString();
      await activitiesService.add(today, {
        activityName,
        intensity,
        durationMinutes,
      });

      await loadData(true);
    } catch (err) {
      console.error('Failed to add activity:', err);
      throw err;
    }
  };

  const updateConsumptionQuantity = async (consumptionId: string, delta: number) => {
    try {
      const today = getTodayDateString();
      const dayData = weekData.days[today];
      if (!dayData) return;

      const consumption = dayData.consumptions.find((c) => c.id === consumptionId);
      if (!consumption) return;

      const newQuantity = consumption.quantity + delta;
      await consumptionsService.updateQuantity(consumptionId, newQuantity);
      
      await loadData(true);
    } catch (err) {
      console.error('Failed to update consumption:', err);
      throw err;
    }
  };

  const deleteConsumption = async (consumptionId: string) => {
    try {
      await consumptionsService.delete(consumptionId);
      await loadData(true);
    } catch (err) {
      console.error('Failed to delete consumption:', err);
      throw err;
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      await activitiesService.delete(activityId);
      await loadData(true);
    } catch (err) {
      console.error('Failed to delete activity:', err);
      throw err;
    }
  };

  const addConsumptionForDate = async (
    date: string,
    foodName: string,
    pointsPerUnit: number,
    mealType: MealType,
    quantity: number = 1
  ) => {
    try {
      await consumptionsService.add(date, {
        foodName,
        pointsPerUnit,
        mealType,
        quantity,
      });
      return loadData(false);
    } catch (err) {
      console.error('Failed to add consumption:', err);
      throw err;
    }
  };

  const addActivityForDate = async (
    date: string,
    activityName: string,
    intensity: ActivityIntensity,
    durationMinutes: number
  ) => {
    try {
      await activitiesService.add(date, {
        activityName,
        intensity,
        durationMinutes,
      });
      return loadData(false);
    } catch (err) {
      console.error('Failed to add activity:', err);
      throw err;
    }
  };

  const updateConsumptionQuantityForDate = async (date: string, consumptionId: string, delta: number) => {
    try {
      const dayData = weekData.days[date];
      if (!dayData) return;

      const consumption = dayData.consumptions.find((c) => c.id === consumptionId);
      if (!consumption) return;

      const newQuantity = consumption.quantity + delta;
      await consumptionsService.updateQuantity(consumptionId, newQuantity);
      await loadData(false);
    } catch (err) {
      console.error('Failed to update consumption:', err);
      throw err;
    }
  };

  const deleteConsumptionForDate = async (_date: string, consumptionId: string) => {
    try {
      await consumptionsService.delete(consumptionId);
      await loadData(false);
    } catch (err) {
      console.error('Failed to delete consumption:', err);
      throw err;
    }
  };

  const deleteActivityForDate = async (_date: string, activityId: string) => {
    try {
      await activitiesService.delete(activityId);
      await loadData(false);
    } catch (err) {
      console.error('Failed to delete activity:', err);
      throw err;
    }
  };

  const updateBasePoints = async () => {
    await loadData(true);
  };

  const todayData = getTodayData();
  const remainingPoints =
    todayData.basePoints +
    todayData.carryOverPoints +
    todayData.pointsEarned -
    todayData.pointsUsed;

  return {
    todayData,
    remainingPoints,
    addConsumption,
    addActivity,
    updateConsumptionQuantity,
    deleteConsumption,
    deleteActivity,
    weekData,
    addConsumptionForDate,
    addActivityForDate,
    updateConsumptionQuantityForDate,
    deleteConsumptionForDate,
    deleteActivityForDate,
    updateBasePoints,
    isLoading,
    error,
    refresh: loadData,
  };
}
