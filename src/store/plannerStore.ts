/**
 * 📌 plannerStore.ts
 *
 * 멘티 플래너의 UI 상태를 관리하는 Zustand 스토어
 *
 * - 현재 선택된 날짜(selectedDate)
 * - 주간/월간 뷰(view)
 *
 * ✅ 투두 목록/CRUD 같은 “서버 상태”는 TanStack Query(@tanstack/react-query)로 관리합니다.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * PlannerState
 *
 * 플래너 화면에서 필요한 상태와 상태 변경 함수들의 타입 정의
 */
type PlannerView = 'week' | 'month';

interface PlannerState {
  /** 현재 선택된 날짜 (YYYY-MM-DD) */
  selectedDate: string;

  /** 주간 / 월간 등 플래너 뷰 타입 */
  view: PlannerView;

  /** 날짜 변경 */
  setSelectedDate: (date: string | Date) => void;

  /** 플래너 뷰 변경 */
  setView: (view: PlannerView) => void;
}

/**
 * 🗓 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 * (초기 selectedDate 설정용)
 */
function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 🧠 usePlannerStore
 *
 * 멘티 플래너 화면에서 사용하는 Zustand 스토어
 */
export const usePlannerStore = create<PlannerState>()(
  persist(
    (set) => ({
      /** 기본 선택 날짜: 오늘 */
      selectedDate: todayISO(),

      /** 기본 뷰: 주간 */
      view: 'week',

      /** 날짜 변경 */
      setSelectedDate: (date) =>
        set({ selectedDate: typeof date === 'string' ? date : todayISOFrom(date) }),

      /** 뷰 변경 */
      setView: (view) => set({ view }),
    }),
    {
      name: 'planner-store',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : undefined,
      partialize: (state) => ({
        selectedDate: state.selectedDate,
        view: state.view,
      }),
    }
  )
);

/** Date 객체를 YYYY-MM-DD 문자열로 변환 */
function todayISOFrom(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
