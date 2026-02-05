/**
 * 📌 plannerStore.ts
 *
 * 멘티의 일일 플래너 상태를 관리하는 Zustand 스토어
 *
 * - 현재 선택된 날짜(selectedDate)
 * - 해당 날짜의 투두 목록(todos)
 * - 투두 추가 / 삭제 / 상태 변경 / 공부시간 기록 등의
 *   클라이언트 상태 로직을 담당
 *
 * ⚠️ 현재는 MVP 단계로, 백엔드 연동 없이
 * 더미 데이터(initialTodos)를 기반으로 동작
 * 이후 Spring 백엔드 연동 시,
 * - todos 관련 로직은 React Query로 이동
 * - 이 스토어는 날짜 선택 등 UI 상태만 관리하도록 축소될 예정
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Todo, TodoSubject } from '../lib/types/planner';
import {
  createTodo,
  deleteTodo,
  getTodoSnapshot,
  listTodos,
  updateTodo as updateTodoApi,
} from '@/src/services/todo.api';

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

  /** 현재 날짜에 해당하는 투두 목록 */
  todos: Todo[];

  /** 투두 목록 초기 로드 여부 */
  hasLoadedTodos: boolean;

  /** 날짜 변경 */
  setSelectedDate: (date: string | Date) => void;

  /** 플래너 뷰 변경 */
  setView: (view: PlannerView) => void;

  /** 투두 목록 로드 */
  loadTodos: () => Promise<void>;

  /** 멘티가 투두를 새로 추가 */
  addTodo: (title: string, subject: TodoSubject, dueDate: string, dueTime: string) => void;

  /** 투두 삭제 (멘토 고정 투두는 삭제 불가) */
  removeTodo: (id: string) => void;

  /** 투두 완료 / 미완료 토글 */
  toggleTodo: (id: string) => void;

  /** 투두 공부시간(분) 설정 */
  setStudyMinutes: (id: string, minutes: number) => void;

  /** 투두 과목 변경 */
  setSubject: (id: string, subject: TodoSubject) => void;

  /** 투두 제목·과목 수정 */
  updateTodo: (id: string, title: string, subject: TodoSubject) => void;
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

const initialTodos = getTodoSnapshot();

/**
 * 🧠 usePlannerStore
 *
 * 멘티 플래너 화면에서 사용하는 Zustand 스토어
 */
export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      /** 기본 선택 날짜: 오늘 */
      selectedDate: todayISO(),

      /** 기본 뷰: 주간 */
      view: 'week',

      /** 현재 날짜의 투두 목록 */
      todos: initialTodos,

      /** 투두 목록 초기 로드 여부 */
      hasLoadedTodos: false,

      /** 날짜 변경 */
      setSelectedDate: (date) =>
        set({ selectedDate: typeof date === 'string' ? date : todayISOFrom(date) }),

      /** 뷰 변경 */
      setView: (view) => set({ view }),

      /** 투두 목록 로드 */
      loadTodos: async () => {
        if (get().hasLoadedTodos) return;
        const items = await listTodos();
        set({ todos: items, hasLoadedTodos: true });
      },

      /**
       * ➕ 투두 추가
       * - 멘티만 추가 가능
       * - 제목이 비어있으면 무시
       */
      addTodo: (title, subject, dueDate, dueTime) => {
        const trimmed = title.trim();
        const dateValue = dueDate.trim();
        const timeValue = dueTime.trim();
        if (!trimmed || !dateValue || !timeValue) return;

        void createTodo({
          title: trimmed,
          subject,
          dueDate: dateValue,
          dueTime: timeValue,
        }).then((created) => {
          set({ todos: [created, ...get().todos], hasLoadedTodos: true });
        });
      },

      /**
       * 🗑 투두 삭제
       * - 멘토 고정 투두는 삭제 불가
       */
      removeTodo: (id) => {
        const todo = get().todos.find((t) => t.id === id);
        if (!todo) return;
        if (todo.isFixed) return;

        void deleteTodo(id).then(() => {
          set({ todos: get().todos.filter((t) => t.id !== id) });
        });
      },

      /**
       * ✅ 투두 완료 / 미완료 토글
       */
      toggleTodo: (id) => {
        const current = get().todos.find((t) => t.id === id);
        if (!current) return;
        const nextStatus = current.status === 'DONE' ? 'TODO' : 'DONE';
        void updateTodoApi(id, { status: nextStatus }).then((updated) => {
          if (!updated) return;
          set({
            todos: get().todos.map((t) => (t.id === id ? updated : t)),
          });
        });
      },

      /**
       * ⏱ 공부 시간(분) 설정
       * - 0 ~ 1440분 범위로 제한
       */
      setStudyMinutes: (id, minutes) => {
        const safe = Number.isFinite(minutes)
          ? Math.max(0, Math.min(1440, minutes))
          : 0;

        void updateTodoApi(id, { studyMinutes: safe }).then((updated) => {
          if (!updated) return;
          set({
            todos: get().todos.map((t) => (t.id === id ? updated : t)),
          });
        });
      },

      /**
       * 📚 과목 변경
       */
      setSubject: (id, subject) => {
        void updateTodoApi(id, { subject }).then((updated) => {
          if (!updated) return;
          set({
            todos: get().todos.map((t) => (t.id === id ? updated : t)),
          });
        });
      },

      /**
       * ✏️ 투두 수정 (제목 + 과목)
       */
      updateTodo: (id, title, subject) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        void updateTodoApi(id, { title: trimmed, subject }).then((updated) => {
          if (!updated) return;
          set({
            todos: get().todos.map((t) => (t.id === id ? updated : t)),
          });
        });
      },
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
