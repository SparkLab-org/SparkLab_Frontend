/**
 * 📌 timerStore.ts
 *
 * 플래너 타이머 상태를 관리하는 Zustand 스토어
 * - 활성 투두(activeTodoId)
 * - 실행 여부(isRunning)
 * - 경과 시간(elapsedSeconds)
 * - 타이머 패널 표시 여부(isPanelOpen)
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TimerState {
  activeTodoId: string | null;
  elapsedSeconds: number;
  isRunning: boolean;
  isPanelOpen: boolean;
  startedAt: number | null;
  start: (todoId: string) => void;
  pause: () => void;
  reset: () => void;
  sync: () => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setActiveTodoId: (todoId: string | null) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      activeTodoId: null,
      elapsedSeconds: 0,
      isRunning: false,
      isPanelOpen: false,
      startedAt: null,
      start: (todoId) =>
        set((state) => {
          if (state.activeTodoId && state.activeTodoId !== todoId) {
            return {
              activeTodoId: todoId,
              elapsedSeconds: 0,
              isRunning: true,
              isPanelOpen: true,
              startedAt: Date.now(),
            };
          }
          if (state.isRunning) {
            return { isPanelOpen: true };
          }
          return {
            activeTodoId: todoId,
            isRunning: true,
            isPanelOpen: true,
            startedAt: Date.now(),
          };
        }),
      pause: () =>
        set((state) => {
          if (!state.isRunning || !state.startedAt) {
            return { isRunning: false, startedAt: null };
          }
          const addedSeconds = Math.floor((Date.now() - state.startedAt) / 1000);
          return {
            elapsedSeconds: state.elapsedSeconds + Math.max(0, addedSeconds),
            isRunning: false,
            startedAt: null,
          };
        }),
      reset: () => set({ elapsedSeconds: 0, isRunning: false, startedAt: null }),
      sync: () =>
        set((state) => {
          if (!state.isRunning || !state.startedAt) return state;
          const addedSeconds = Math.floor((Date.now() - state.startedAt) / 1000);
          if (addedSeconds <= 0) return state;
          const now = Date.now();
          return {
            elapsedSeconds: state.elapsedSeconds + addedSeconds,
            startedAt: now,
          };
        }),
      openPanel: () => set({ isPanelOpen: true }),
      closePanel: () => set({ isPanelOpen: false }),
      togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
      setActiveTodoId: (todoId) =>
        set(
          todoId
            ? { activeTodoId: todoId }
            : { activeTodoId: null, elapsedSeconds: 0, isRunning: false, startedAt: null }
        ),
    }),
    {
      name: 'timer-store',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : undefined,
      partialize: (state) => ({
        activeTodoId: state.activeTodoId,
        elapsedSeconds: state.elapsedSeconds,
        isRunning: state.isRunning,
        startedAt: state.startedAt,
      }),
    }
  )
);
