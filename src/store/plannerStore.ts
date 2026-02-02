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
import type { Todo, TodoSubject } from '../lib/types/planner';

/**
 * PlannerState
 *
 * 플래너 화면에서 필요한 상태와 상태 변경 함수들의 타입 정의
 */
interface PlannerState {
  /** 현재 선택된 날짜 (YYYY-MM-DD) */
  selectedDate: string;

  /** 현재 날짜에 해당하는 투두 목록 */
  todos: Todo[];

  /** 날짜 변경 */
  setSelectedDate: (date: string) => void;

  /** 멘티가 투두를 새로 추가 */
  addTodo: (title: string, subject: TodoSubject) => void;

  /** 투두 삭제 (멘토 고정 투두는 삭제 불가) */
  removeTodo: (id: string) => void;

  /** 투두 완료 / 미완료 토글 */
  toggleTodo: (id: string) => void;

  /** 투두 공부시간(분) 설정 */
  setStudyMinutes: (id: string, minutes: number) => void;

  /** 투두 과목 변경 */
  setSubject: (id: string, subject: TodoSubject) => void;
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
 * 🆔 간단한 uid 생성 함수
 *
 * - MVP 단계에서만 사용
 * - 새 투두를 클라이언트에서 추가할 때 id 생성용
 *
 * ⚠️ SSR 환경에서는 hydration mismatch를 유발할 수 있으므로
 * 초기 더미 데이터에는 사용하지 않고,
 * 실제 백엔드 연동 시에는 서버에서 내려준 id를 사용
 */
function uid(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * 🧪 초기 더미 투두 데이터
 *
 * - 서버 연동 전, 화면과 인터랙션 테스트용
 * - id는 hydration mismatch 방지를 위해 고정 문자열 사용
 */
const initialTodos: Todo[] = [
  {
    id: 'seed-1',
    title: '멘토 · 수학 문제집 30p',
    isFixed: true, // 멘토 고정 투두
    status: 'TODO',
    subject: '수학',
    studyMinutes: 0,
    createdAt: Date.now(),
  },
  {
    id: 'seed-2',
    title: '멘토 · 영어 단어 2회독',
    isFixed: true,
    status: 'TODO',
    subject: '영어',
    studyMinutes: 0,
    createdAt: Date.now(),
  },
  {
    id: 'seed-3',
    title: '내가 추가 · 과학 요약',
    isFixed: false, // 멘티가 직접 추가한 투두
    status: 'DONE',
    subject: '국어',
    studyMinutes: 20,
    createdAt: Date.now(),
  },
];

/**
 * 🧠 usePlannerStore
 *
 * 멘티 플래너 화면에서 사용하는 Zustand 스토어
 */
export const usePlannerStore = create<PlannerState>((set, get) => ({
  /** 기본 선택 날짜: 오늘 */
  selectedDate: todayISO(),

  /** 현재 날짜의 투두 목록 */
  todos: initialTodos,

  /** 날짜 변경 */
  setSelectedDate: (date) => set({ selectedDate: date }),

  /**
   * ➕ 투두 추가
   * - 멘티만 추가 가능
   * - 제목이 비어있으면 무시
   */
  addTodo: (title, subject) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    const newTodo: Todo = {
      id: uid(),
      title: trimmed,
      isFixed: false,
      status: 'TODO',
      subject,
      studyMinutes: 0,
      createdAt: Date.now(),
    };

    // 최신 투두가 위로 오도록 앞에 추가
    set({ todos: [newTodo, ...get().todos] });
  },

  /**
   * 🗑 투두 삭제
   * - 멘토 고정 투두는 삭제 불가
   */
  removeTodo: (id) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;
    if (todo.isFixed) return;

    set({ todos: get().todos.filter((t) => t.id !== id) });
  },

  /**
   * ✅ 투두 완료 / 미완료 토글
   */
  toggleTodo: (id) => {
    set({
      todos: get().todos.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' }
          : t
      ),
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

    set({
      todos: get().todos.map((t) =>
        t.id === id ? { ...t, studyMinutes: safe } : t
      ),
    });
  },

  /**
   * 📚 과목 변경
   */
  setSubject: (id, subject) => {
    set({
      todos: get().todos.map((t) =>
        t.id === id ? { ...t, subject } : t
      ),
    });
  },
}));