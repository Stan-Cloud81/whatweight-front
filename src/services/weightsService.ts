import api from './api';
import { WeightEntry } from '../types';

export interface AddWeightRequest {
  weight: number;
  date: string;
}

export interface GetWeightsResponse {
  weights: WeightEntry[];
}

export const weightsService = {
  getAll: async (): Promise<WeightEntry[]> => {
    const response = await api.get<GetWeightsResponse>('/weights');
    return response.data.weights;
  },

  add: async (data: AddWeightRequest): Promise<WeightEntry> => {
    const response = await api.post<WeightEntry>('/weights', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/weights/${id}`);
  },
};
