import api from './api';
import { DayData } from '../types';

export interface GetDaysResponse {
  days: DayData[];
  dailyBasePoints: number;
  startDate: string;
}

export const daysService = {
  getAll: async (from?: string, to?: string): Promise<GetDaysResponse> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await api.get<GetDaysResponse>('/days', { params });
    return response.data;
  },

  getByDate: async (date: string): Promise<DayData> => {
    const response = await api.get<DayData>(`/days/${date}`);
    return response.data;
  },
};
