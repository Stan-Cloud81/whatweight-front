import { useState, useEffect } from 'react';
import {
  DayData,
  WeekData,
  Consumption,
  ActivityEntry,
  MealType,
  ActivityIntensity,
} from '../types';
import {
  calculateDayRemainingPoints,
  getTodayDateString,
  generateId,
} from '../utils/pointsCalculator';

const STORAGE_KEY = 'whatweight-data';
const DEFAULT_DAILY_POINTS = 31;

export function usePointsTracker() {
  const [weekData, setWeekData] = useState<WeekData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      startDate: getTodayDateString(),
      dailyBasePoints: DEFAULT_DAILY_POINTS,
      days: {},
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weekData));
  }, [weekData]);

  const getTodayData = (): DayData => {
    const today = getTodayDateString();
    if (!weekData.days[today]) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const yesterdayData = weekData.days[yesterdayStr];

      const carryOver = yesterdayData
        ? Math.max(
            0,
            calculateDayRemainingPoints(
              yesterdayData.basePoints,
              yesterdayData.pointsUsed,
              yesterdayData.pointsEarned,
              yesterdayData.carryOverPoints
            )
          )
        : 0;

      const newDayData: DayData = {
        date: today,
        basePoints: weekData.dailyBasePoints,
        pointsUsed: 0,
        pointsEarned: 0,
        consumptions: [],
        activities: [],
        carryOverPoints: carryOver,
      };

      setWeekData((prev) => ({
        ...prev,
        days: { ...prev.days, [today]: newDayData },
      }));

      return newDayData;
    }
    return weekData.days[today];
  };

  const addConsumption = (
    foodName: string,
    pointsPerUnit: number,
    mealType: MealType,
    quantity: number = 1
  ) => {
    const today = getTodayDateString();
    const totalPoints = pointsPerUnit * quantity;
    const consumption: Consumption = {
      id: generateId(),
      foodId: generateId(),
      foodName,
      mealType,
      pointsPerUnit,
      quantity,
      points: totalPoints,
      timestamp: Date.now(),
    };

    setWeekData((prev) => {
      const dayData = prev.days[today] || getTodayData();
      return {
        ...prev,
        days: {
          ...prev.days,
          [today]: {
            ...dayData,
            pointsUsed: dayData.pointsUsed + totalPoints,
            consumptions: [...dayData.consumptions, consumption],
          },
        },
      };
    });
  };

  const addActivity = (
    activityName: string,
    intensity: ActivityIntensity,
    durationMinutes: number,
    pointsEarned: number
  ) => {
    const today = getTodayDateString();
    const activity: ActivityEntry = {
      id: generateId(),
      activityName,
      intensity,
      durationMinutes,
      pointsEarned,
      timestamp: Date.now(),
    };

    setWeekData((prev) => {
      const dayData = prev.days[today] || getTodayData();
      return {
        ...prev,
        days: {
          ...prev.days,
          [today]: {
            ...dayData,
            pointsEarned: dayData.pointsEarned + pointsEarned,
            activities: [...dayData.activities, activity],
          },
        },
      };
    });
  };

  const updateConsumptionQuantity = (consumptionId: string, delta: number) => {
    const today = getTodayDateString();
    setWeekData((prev) => {
      const dayData = prev.days[today];
      if (!dayData) return prev;

      const consumption = dayData.consumptions.find((c) => c.id === consumptionId);
      if (!consumption) return prev;

      const newQuantity = consumption.quantity + delta;
      if (newQuantity <= 0) {
        return {
          ...prev,
          days: {
            ...prev.days,
            [today]: {
              ...dayData,
              pointsUsed: dayData.pointsUsed - consumption.points,
              consumptions: dayData.consumptions.filter((c) => c.id !== consumptionId),
            },
          },
        };
      }

      const oldPoints = consumption.points;
      const newPoints = consumption.pointsPerUnit * newQuantity;

      return {
        ...prev,
        days: {
          ...prev.days,
          [today]: {
            ...dayData,
            pointsUsed: dayData.pointsUsed - oldPoints + newPoints,
            consumptions: dayData.consumptions.map((c) =>
              c.id === consumptionId
                ? { ...c, quantity: newQuantity, points: newPoints }
                : c
            ),
          },
        },
      };
    });
  };

  const deleteConsumption = (consumptionId: string) => {
    const today = getTodayDateString();
    setWeekData((prev) => {
      const dayData = prev.days[today];
      if (!dayData) return prev;

      const consumption = dayData.consumptions.find((c) => c.id === consumptionId);
      if (!consumption) return prev;

      return {
        ...prev,
        days: {
          ...prev.days,
          [today]: {
            ...dayData,
            pointsUsed: dayData.pointsUsed - consumption.points,
            consumptions: dayData.consumptions.filter((c) => c.id !== consumptionId),
          },
        },
      };
    });
  };

  const deleteActivity = (activityId: string) => {
    const today = getTodayDateString();
    setWeekData((prev) => {
      const dayData = prev.days[today];
      if (!dayData) return prev;

      const activity = dayData.activities.find((a) => a.id === activityId);
      if (!activity) return prev;

      return {
        ...prev,
        days: {
          ...prev.days,
          [today]: {
            ...dayData,
            pointsEarned: dayData.pointsEarned - activity.pointsEarned,
            activities: dayData.activities.filter((a) => a.id !== activityId),
          },
        },
      };
    });
  };

  const todayData = getTodayData();
  const remainingPoints = calculateDayRemainingPoints(
    todayData.basePoints,
    todayData.pointsUsed,
    todayData.pointsEarned,
    todayData.carryOverPoints
  );

  const addConsumptionForDate = (
    date: string,
    foodName: string,
    pointsPerUnit: number,
    mealType: MealType,
    quantity: number = 1
  ) => {
    const totalPoints = pointsPerUnit * quantity;
    const consumption: Consumption = {
      id: generateId(),
      foodId: generateId(),
      foodName,
      mealType,
      pointsPerUnit,
      quantity,
      points: totalPoints,
      timestamp: Date.now(),
    };

    setWeekData((prev) => {
      const dayData = prev.days[date];
      if (!dayData) return prev;
      return {
        ...prev,
        days: {
          ...prev.days,
          [date]: {
            ...dayData,
            pointsUsed: dayData.pointsUsed + totalPoints,
            consumptions: [...dayData.consumptions, consumption],
          },
        },
      };
    });
  };

  const addActivityForDate = (
    date: string,
    activityName: string,
    intensity: ActivityIntensity,
    durationMinutes: number,
    pointsEarned: number
  ) => {
    const activity: ActivityEntry = {
      id: generateId(),
      activityName,
      intensity,
      durationMinutes,
      pointsEarned,
      timestamp: Date.now(),
    };

    setWeekData((prev) => {
      const dayData = prev.days[date];
      if (!dayData) return prev;
      return {
        ...prev,
        days: {
          ...prev.days,
          [date]: {
            ...dayData,
            pointsEarned: dayData.pointsEarned + pointsEarned,
            activities: [...dayData.activities, activity],
          },
        },
      };
    });
  };

  const updateConsumptionQuantityForDate = (date: string, consumptionId: string, delta: number) => {
    setWeekData((prev) => {
      const dayData = prev.days[date];
      if (!dayData) return prev;

      const consumption = dayData.consumptions.find((c) => c.id === consumptionId);
      if (!consumption) return prev;

      const newQuantity = consumption.quantity + delta;
      if (newQuantity <= 0) {
        return {
          ...prev,
          days: {
            ...prev.days,
            [date]: {
              ...dayData,
              pointsUsed: dayData.pointsUsed - consumption.points,
              consumptions: dayData.consumptions.filter((c) => c.id !== consumptionId),
            },
          },
        };
      }

      const oldPoints = consumption.points;
      const newPoints = consumption.pointsPerUnit * newQuantity;

      return {
        ...prev,
        days: {
          ...prev.days,
          [date]: {
            ...dayData,
            pointsUsed: dayData.pointsUsed - oldPoints + newPoints,
            consumptions: dayData.consumptions.map((c) =>
              c.id === consumptionId
                ? { ...c, quantity: newQuantity, points: newPoints }
                : c
            ),
          },
        },
      };
    });
  };

  const deleteConsumptionForDate = (date: string, consumptionId: string) => {
    setWeekData((prev) => {
      const dayData = prev.days[date];
      if (!dayData) return prev;

      const consumption = dayData.consumptions.find((c) => c.id === consumptionId);
      if (!consumption) return prev;

      return {
        ...prev,
        days: {
          ...prev.days,
          [date]: {
            ...dayData,
            pointsUsed: dayData.pointsUsed - consumption.points,
            consumptions: dayData.consumptions.filter((c) => c.id !== consumptionId),
          },
        },
      };
    });
  };

  const deleteActivityForDate = (date: string, activityId: string) => {
    setWeekData((prev) => {
      const dayData = prev.days[date];
      if (!dayData) return prev;

      const activity = dayData.activities.find((a) => a.id === activityId);
      if (!activity) return prev;

      return {
        ...prev,
        days: {
          ...prev.days,
          [date]: {
            ...dayData,
            pointsEarned: dayData.pointsEarned - activity.pointsEarned,
            activities: dayData.activities.filter((a) => a.id !== activityId),
          },
        },
      };
    });
  };

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
  };
}
