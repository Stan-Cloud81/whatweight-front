import api from './api';
import { ActivityEntry, ActivityIntensity } from '../types';

export interface AddActivityRequest {
  activityName: string;
  intensity: ActivityIntensity;
  durationMinutes: number;
}

export const activitiesService = {
  add: async (date: string, data: AddActivityRequest): Promise<ActivityEntry> => {
    const response = await api.post<ActivityEntry>(`/days/${date}/activities`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/activities/${id}`);
  },
};
