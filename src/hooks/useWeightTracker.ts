import { useState, useEffect } from 'react';
import { WeightEntry, UserProfile } from '../types';
import { generateId } from '../utils/pointsCalculator';
import { calculateBasePoints } from '../utils/basePointsCalculator';

const WEIGHT_STORAGE_KEY = 'whatweight-weight-data';

export function useWeightTracker() {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>(() => {
    const stored = localStorage.getItem(WEIGHT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(WEIGHT_STORAGE_KEY, JSON.stringify(weightEntries));
  }, [weightEntries]);

  const addWeightEntry = (
    weight: number, 
    date?: string,
    userProfile?: UserProfile,
    onBasePointsUpdate?: (newBasePoints: number) => void
  ) => {
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    const existingIndex = weightEntries.findIndex(e => e.date === entryDate);
    
    if (existingIndex !== -1) {
      setWeightEntries(prev => 
        prev.map((e, i) => 
          i === existingIndex 
            ? { ...e, weight, timestamp: Date.now() }
            : e
        )
      );
    } else {
      const newEntry: WeightEntry = {
        id: generateId(),
        date: entryDate,
        weight,
        timestamp: Date.now(),
      };
      setWeightEntries(prev => [...prev, newEntry].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
    }
    
    if (userProfile?.gender && userProfile?.birthDate && userProfile?.height) {
      const newBasePoints = calculateBasePoints(
        userProfile.gender,
        weight,
        userProfile.birthDate,
        userProfile.height
      );
      onBasePointsUpdate?.(newBasePoints);
    }
  };

  const deleteWeightEntry = (
    id: string,
    userProfile?: UserProfile,
    onBasePointsUpdate?: (newBasePoints: number) => void
  ) => {
    setWeightEntries(prev => {
      const filtered = prev.filter(e => e.id !== id);
      
      if (filtered.length > 0 && userProfile?.gender && userProfile?.birthDate && userProfile?.height) {
        const latestWeight = filtered[filtered.length - 1].weight;
        const newBasePoints = calculateBasePoints(
          userProfile.gender,
          latestWeight,
          userProfile.birthDate,
          userProfile.height
        );
        onBasePointsUpdate?.(newBasePoints);
      }
      
      return filtered;
    });
  };

  const getWeightForDate = (date: string): number | null => {
    const entry = weightEntries.find(e => e.date === date);
    return entry ? entry.weight : null;
  };

  const getCurrentWeight = (): number | null => {
    if (weightEntries.length === 0) return null;
    return weightEntries[weightEntries.length - 1].weight;
  };

  return {
    weightEntries,
    addWeightEntry,
    deleteWeightEntry,
    getWeightForDate,
    getCurrentWeight,
  };
}
