import { useState, useEffect } from 'react';
import { WeightEntry } from '../types';
import { weightsService } from '../services/weightsService';

export function useWeightTrackerAPI() {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      loadWeights();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadWeights = async () => {
    try {
      setIsLoading(true);
      const weights = await weightsService.getAll();
      setWeightEntries(weights);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load weights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addWeightEntry = async (
    weight: number,
    date?: string
  ) => {
    try {
      const entryDate = date || new Date().toISOString().split('T')[0];
      await weightsService.add({ weight, date: entryDate });
      await loadWeights();
    } catch (err) {
      console.error('Failed to add weight:', err);
      throw err;
    }
  };

  const deleteWeightEntry = async (
    id: string
  ) => {
    try {
      await weightsService.delete(id);
      await loadWeights();
    } catch (err) {
      console.error('Failed to delete weight:', err);
      throw err;
    }
  };

  const getWeightForDate = (date: string): number | null => {
    const entry = weightEntries.find((e) => e.date === date);
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
    isLoading,
    error,
    refresh: loadWeights,
  };
}
