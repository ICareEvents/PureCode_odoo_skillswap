
import { User } from './user';

export interface AuthResponse {
  message: string;
  user_id: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface WebSocketMessage {
  type: 'swap_update' | 'new_request' | 'rating_received' | 'ping' | 'pong';
  data?: any;
}