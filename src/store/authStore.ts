import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
}

const initialAuthenticated =
  typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: initialAuthenticated,

  setAuthenticated: (value) => set({ isAuthenticated: value }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      window.location.href = '/';
    }
    set({ isAuthenticated: false });
  },
}));
