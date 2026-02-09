import { create } from 'zustand';

export type MentorSubjectFilter = '전체' | '국어' | '수학' | '영어';

type MentorUiState = {
  subjectFilter: MentorSubjectFilter;
  setSubjectFilter: (filter: MentorSubjectFilter) => void;

  plannerSelectedDate: string; // YYYY-MM-DD
  plannerActiveMonth: string; // YYYY-MM-01
  plannerSelectedMenteeId: string;
  setPlannerSelectedDate: (date: string | Date) => void;
  setPlannerActiveMonth: (date: string | Date) => void;
  setPlannerSelectedMenteeId: (id: string) => void;
};

function toISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toMonthStartISO(date: Date): string {
  return toISODate(new Date(date.getFullYear(), date.getMonth(), 1));
}

const today = new Date();

export const useMentorUiStore = create<MentorUiState>((set) => ({
  subjectFilter: '전체',
  setSubjectFilter: (filter) => set({ subjectFilter: filter }),

  plannerSelectedDate: toISODate(today),
  plannerActiveMonth: toMonthStartISO(today),
  plannerSelectedMenteeId: '',
  setPlannerSelectedDate: (date) =>
    set({ plannerSelectedDate: typeof date === 'string' ? date : toISODate(date) }),
  setPlannerActiveMonth: (date) =>
    set({ plannerActiveMonth: typeof date === 'string' ? date : toMonthStartISO(date) }),
  setPlannerSelectedMenteeId: (id) => set({ plannerSelectedMenteeId: id }),
}));
