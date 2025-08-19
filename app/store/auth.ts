import { create } from 'zustand';
import { http } from '../lib/http';
import type { LoginResponse, Utilisateur } from '../models';

interface AuthState {
  user: Utilisateur | null;
  access: string | null;
  refresh: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: Record<string, any>) => Promise<void>;
  me: () => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
  forgot: (email: string) => Promise<void>;
  reset: (token: string, new_password: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  access: null,
  refresh: null,
  loading: false,

  loadFromStorage: () => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');
    const userRaw = localStorage.getItem('user');
    set({
      access,
      refresh,
      user: userRaw ? JSON.parse(userRaw) : null
    });
  },

  login: async (username, password) => {
    set({ loading: true });
    try {
      // Préférence: endpoints custom du ViewSet
      const { data } = await http.post<LoginResponse>('utilisateurs/login/', { username, password });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ access: data.access, refresh: data.refresh, user: data.user });
    } catch {
      // fallback sur SimpleJWT /login/
      const { data } = await http.post<LoginResponse>('login/', { username, password });
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      // pas de user => va chercher /utilisateurs/me/
      await get().me();
    } finally {
      set({ loading: false });
    }
  },

  register: async (payload) => {
    set({ loading: true });
    try {
      const { data } = await http.post<LoginResponse>('utilisateurs/register/', payload);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ access: data.access, refresh: data.refresh, user: data.user });
    } finally {
      set({ loading: false });
    }
  },

  me: async () => {
    const { data } = await http.get<Utilisateur>('utilisateurs/me/');
    localStorage.setItem('user', JSON.stringify(data));
    set({ user: data });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    set({ user: null, access: null, refresh: null });
  },

  forgot: async (email: string) => http.post("utilisateurs/reset_password/", { email }),
  reset:  async (token: string, new_password: string) =>
         http.post("utilisateurs/reset_password_confirm/", { token, new_password }),
}));