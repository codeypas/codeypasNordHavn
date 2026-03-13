import { create } from 'zustand';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const useShipmentStore = create((set, get) => ({
  shipments: [],
  loading: false,
  error: null,

  fetchShipments: async (token, options = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/api/shipments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: options.unusualOnly ? { unusualOnly: true } : undefined,
      });
      set({ shipments: response.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch shipments', loading: false });
    }
  },

  addShipment: async (token, shipmentData) => {
    try {
      const response = await axios.post(`${API_URL}/api/shipments`, shipmentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ shipments: [response.data, ...get().shipments] });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to add shipment';
    }
  },

  updateShipment: async (token, id, shipmentData) => {
    try {
      const response = await axios.put(`${API_URL}/api/shipments/${id}`, shipmentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        shipments: get().shipments.map((s) => (s._id === id ? response.data : s)),
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update shipment';
    }
  },

  deleteShipment: async (token, id) => {
    try {
      await axios.delete(`${API_URL}/api/shipments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ shipments: get().shipments.filter((s) => s._id !== id) });
    } catch (error) {
      throw error.response?.data?.error || 'Failed to delete shipment';
    }
  },
}));
