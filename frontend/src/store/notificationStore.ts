import { create } from 'zustand';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
}

interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
}

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));

    const duration = notification.duration || 5000;
    setTimeout(() => {
      get().removeNotification(id);
    }, duration);

    switch (notification.type) {
      case 'success':
        toast.success(notification.title);
        break;
      case 'error':
        toast.error(notification.title);
        break;
      case 'warning':
        toast.error(notification.title, { icon: '⚠️' });
        break;
      case 'info':
      default:
        toast(notification.title);
        break;
    }
  },

  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
    toast.dismiss();
  },

  showSuccess: (title, message) => {
    get().addNotification({ type: 'success', title, message });
  },

  showError: (title, message) => {
    get().addNotification({ type: 'error', title, message });
  },

  showInfo: (title, message) => {
    get().addNotification({ type: 'info', title, message });
  },

  showWarning: (title, message) => {
    get().addNotification({ type: 'warning', title, message });
  },
}));