import axios from 'axios';
import { User, GradingRubric } from '../types/types';
import { API_URL } from '../config/env';
import { getStoredToken, clearStoredToken } from '../auth/token';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearStoredToken();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  /** Exchange Google ID token (e.g. from mobile SDK) for our JWT and user. */
  googleToken: async (credential: string) => {
    const response = await api.post<{ user: User; token: string }>('/auth/google/token', { credential });
    return response.data;
  },

  getCurrentUser: async (email: string) => {
    const response = await api.get<User>(`/api/users/${email}`);
    return response.data;
  },
};

export const userAPI = {
  updateProfile: async (email: string, data: { professionalLevel: string; hasBeenHiringManager: boolean }) => {
    const response = await api.put<User>(`/api/users/${email}/profile`, data);
    return response.data;
  },
  
  getDashboard: async (email: string) => {
    const response = await api.get(`/api/users/${email}/dashboard`);
    return response.data;
  },
};

export const sessionAPI = {
  createWithMatch: async (data: { meetupEventId: number; partnerEmail: string; userEmail: string }) => {
    const response = await api.post('/api/sessions/create-with-match', data);
    return response.data;
  },
};

export const rubricAPI = {
  getBySession: async (sessionId: number) => {
    const response = await api.get<GradingRubric[]>(`/api/rubrics/session/${sessionId}`);
    return response.data;
  },
  update: async (
    rubricId: number,
    data: {
      q1Points?: number | null;
      q2Points?: number | null;
      q1Feedback?: string | null;
      q2Feedback?: string | null;
    }
  ) => {
    const response = await api.put<GradingRubric>(`/api/rubrics/${rubricId}`, data);
    return response.data;
  },
  getUserFeedback: async (userEmail: string) => {
    const response = await api.get<GradingRubric[]>(`/api/rubrics/user/${userEmail}/feedback`);
    return response.data;
  },
};

export default api;