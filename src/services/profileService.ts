import api from './api';
import { UserProfile } from '../types';

export const profileService = {
  get: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/profile');
    return response.data;
  },

  update: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/profile', profile);
    return response.data;
  },
};
