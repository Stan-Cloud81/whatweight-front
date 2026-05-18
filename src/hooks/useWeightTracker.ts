import { useState, useEffect } from 'react';
import { WeightEntry } from '../types';
import { generateId } from '../utils/pointsCalculator';

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

  const addWeightEntry = (weight: number, date?: string) => {
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
  };

  const deleteWeightEntry = (id: string) => {
    setWeightEntries(prev => prev.filter(e => e.id !== id));
  };

  const getWeightForDate = (date: string): number | null => {
    const entry = weightEntries.find(e => e.date === date);
    return entry ? entry.weight : null;
  };

  return {
    weightEntries,
    addWeightEntry,
    deleteWeightEntry,
    getWeightForDate,
  };
}
