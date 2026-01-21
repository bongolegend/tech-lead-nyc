import axios from 'axios';
import { User, GradingRubric } from '../types/types';



const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  googleLogin: async (credential: string) => {
    const response = await api.post<{ user: User }>('/api/auth/google', { credential });
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
  
  update: async (rubricId: number, data: { points: number; feedback: string }) => {
    const response = await api.put<GradingRubric>(`/api/rubrics/${rubricId}`, data);
    return response.data;
  },
  
  getUserFeedback: async (userEmail: string) => {
    const response = await api.get<GradingRubric[]>(`/api/rubrics/user/${userEmail}/feedback`);
    return response.data;
  },
};

export default api;