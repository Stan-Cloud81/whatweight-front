import api from './api';
import { FoodHistory, ActivityHistory } from '../hooks/useHistory';

export interface GetFoodsHistoryResponse {
  foods: FoodHistory[];
}

export interface GetActivitiesHistoryResponse {
  activities: ActivityHistory[];
}

export const historyService = {
  getFoods: async (): Promise<FoodHistory[]> => {
    const response = await api.get<GetFoodsHistoryResponse>('/history/foods');
    return response.data.foods;
  },

  getActivities: async (): Promise<ActivityHistory[]> => {
    const response = await api.get<GetActivitiesHistoryResponse>('/history/activities');
    return response.data.activities;
  },
};
