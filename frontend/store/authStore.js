import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,

  // ================= REGISTER =================
  // register: async (name, email, password) => {
  //   try {
  //     const response = await axios.post(`${API_URL}/api/auth/register`, {
  //       name,
  //       email,
  //       password,
  //     });
  //     return response.data;
  //   } catch (error) {
  //     throw error.response?.data?.error || 'Registration failed';
  //   }
  // },


  register: async (name, email, password, role) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name,
      email,
      password,
      role,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Registration failed';
  }
},


  // ================= LOGIN =================
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
      throw error.response?.data?.error || 'Login failed';
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ user: response.data, token });
      return true;

    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null });
      return false;
    }
  },
}));
