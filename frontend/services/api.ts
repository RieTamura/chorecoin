import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { 
  User, 
  Chore, 
  Reward, 
  HistoryItem, 
  PointsSummary, 
  AuthResponse 
} from '../types';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8787';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/google', { idToken });
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('authToken');
  }

  // User
  async getMe(): Promise<User> {
    const response = await this.api.get<{ user: User }>('/users/me');
    return response.data.user;
  }

  async updateUserType(userType: 'parent' | 'child'): Promise<User> {
    const response = await this.api.patch<{ user: User }>('/users/me', { userType });
    return response.data.user;
  }

  // Chores
  async getChores(): Promise<Chore[]> {
    const response = await this.api.get<{ chores: Chore[] }>('/chores');
    return response.data.chores;
  }

  async createChore(name: string, points: number, recurring: boolean): Promise<Chore> {
    const response = await this.api.post<{ chore: Chore }>('/chores', {
      name,
      points,
      recurring,
    });
    return response.data.chore;
  }

  async updateChore(id: string, name: string, points: number, recurring: boolean): Promise<Chore> {
    const response = await this.api.put<{ chore: Chore }>(`/chores/${id}`, {
      name,
      points,
      recurring,
    });
    return response.data.chore;
  }

  async deleteChore(id: string): Promise<void> {
    await this.api.delete(`/chores/${id}`);
  }

  async completeChore(id: string): Promise<{ pointsEarned: number; totalPoints: number }> {
    const response = await this.api.post<{ pointsEarned: number; totalPoints: number }>(
      `/chores/${id}/complete`
    );
    return response.data;
  }

  // Rewards
  async getRewards(): Promise<Reward[]> {
    const response = await this.api.get<{ rewards: Reward[] }>('/rewards');
    return response.data.rewards;
  }

  async createReward(name: string, points: number): Promise<Reward> {
    const response = await this.api.post<{ reward: Reward }>('/rewards', {
      name,
      points,
    });
    return response.data.reward;
  }

  async updateReward(id: string, name: string, points: number): Promise<Reward> {
    const response = await this.api.put<{ reward: Reward }>(`/rewards/${id}`, {
      name,
      points,
    });
    return response.data.reward;
  }

  async deleteReward(id: string): Promise<void> {
    await this.api.delete(`/rewards/${id}`);
  }

  async claimReward(id: string): Promise<{ pointsUsed: number; totalPoints: number }> {
    const response = await this.api.post<{ pointsUsed: number; totalPoints: number }>(
      `/rewards/${id}/claim`
    );
    return response.data;
  }

  // History
  async getHistory(startDate?: string, endDate?: string): Promise<HistoryItem[]> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await this.api.get<{ history: HistoryItem[] }>('/history', { params });
    return response.data.history;
  }

  async getPoints(): Promise<PointsSummary> {
    const response = await this.api.get<PointsSummary>('/history/points');
    return response.data;
  }
}

export default new ApiService();
