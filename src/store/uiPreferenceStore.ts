import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { LoginRole } from '@/src/components/auth/LoginCard';

type UiPreferenceState = {
  homeRole: LoginRole;
  setHomeRole: (role: LoginRole) => void;
};

export const useUiPreferenceStore = create<UiPreferenceState>()(
  persist(
    (set) => ({
      homeRole: 'mentee',
      setHomeRole: (role) => set({ homeRole: role }),
    }),
    {
      name: 'ui-preference-store',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : undefined,
    }
  )
);
