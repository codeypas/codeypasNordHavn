import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],

  addNotification: (message, type = 'success') => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 20),
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

export { useNotificationStore };
