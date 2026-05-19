import api from './api';
import { Consumption, MealType } from '../types';

export interface AddConsumptionRequest {
  foodName: string;
  mealType: MealType;
  pointsPerUnit: number;
  quantity: number;
}

export const consumptionsService = {
  add: async (date: string, data: AddConsumptionRequest): Promise<Consumption> => {
    const response = await api.post<Consumption>(`/days/${date}/consumptions`, data);
    return response.data;
  },

  updateQuantity: async (id: string, quantity: number): Promise<Consumption> => {
    const response = await api.patch<Consumption>(`/consumptions/${id}`, { quantity });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/consumptions/${id}`);
  },
};
