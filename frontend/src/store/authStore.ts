import { create } from 'zustand';
import { User } from '@/types/user';
import { authAPI, userAPI } from '@/lib/api';
import { setStoredUser, getStoredUser } from '@/lib/auth';
import { webSocketManager } from '@/lib/websocket';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await authAPI.login({ email, password });
      
      const user = await userAPI.getMe();
      setStoredUser(user);
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });

      if (user.id) {
        const token = document.cookie
          .split(';')
          .find(c => c.trim().startsWith('access_token='))
          ?.split('=')[1];
        
        if (token) {
          webSocketManager.connect(user.id, token);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: false,
        user: null 
      });
      throw new Error(errorMessage);
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await authAPI.register({ name, email, password });
      
      const user = await userAPI.getMe();
      setStoredUser(user);
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });

      if (user.id) {
        const token = document.cookie
          .split(';')
          .find(c => c.trim().startsWith('access_token='))
          ?.split('=')[1];
        
        if (token) {
          webSocketManager.connect(user.id, token);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: false,
        user: null 
      });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      webSocketManager.disconnect();
      setStoredUser(null);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null 
      });
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });
      
      const storedUser = getStoredUser();
      if (!storedUser) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const user = await userAPI.getMe();
      setStoredUser(user);
      
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });

      if (user.id) {
        const token = document.cookie
          .split(';')
          .find(c => c.trim().startsWith('access_token='))
          ?.split('=')[1];
        
        if (token) {
          webSocketManager.connect(user.id, token);
        }
      }
    } catch (error) {
      setStoredUser(null);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  updateUser: (user: User) => {
    setStoredUser(user);
    set({ user });
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));