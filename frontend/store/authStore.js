import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,

  register: async (name, email, password, role = 'manager') => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
        role,
      });

      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.error || error.message || 'Registration failed';
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      set({ user, token, loading: false });

      return true;
    } catch (error) {
      set({ loading: false });
      const message = error?.response?.data?.error || 'Login failed';
      throw new Error(message);
    }
  },

  googleLogin: async (credential) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_URL}/api/auth/google`, {
        credential,
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      set({ user, token, loading: false });

      return true;
    } catch (error) {
      set({ loading: false });
      const message = error?.response?.data?.error || 'Google login failed';
      throw new Error(message);
    }
  },

  googleRegister: async (credential) => {
    set({ loading: true });
    try {
      const response = await axios.post(`${API_URL}/api/auth/google/register`, {
        credential,
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      set({ user, token, loading: false });

      return true;
    } catch (error) {
      set({ loading: false });
      const message =
        error?.response?.data?.error || 'Google registration failed';
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ user: response.data, token });
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      set({ user: null, token: null });
      return false;
    }
  },
}));
