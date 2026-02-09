import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Mentee } from '@/src/components/mentor/types';

type MentorState = {
  mentees: Mentee[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  updateFeedback: (id: string, text: string) => void;
  setMentees: (list: Mentee[]) => void;
};

const sampleMentees: Mentee[] = [
  {
    id: 'm1',
    name: '김솔',
    grade: '고2',
    track: '수학 집중 과정',
    progress: 72,
    subjects: ['국어', '수학'],
    weaknessType: '계산 실수',
    goalRate: 68,
    activeLevel: 'WARNING',
    today: [
      { todo: '수학 문제집 30p', status: 'DONE', subject: '수학', duration: '1:10:36' },
      { todo: '영어 단어 2회독', status: 'TODO', subject: '영어', duration: '0:40:00' },
    ],
    feedback: '수학 풀이 과정이 좋아졌어요. 영어는 발음까지 연습하기!',
  },
  {
    id: 'm2',
    name: '이하늘',
    grade: '고1',
    track: '영어 리딩 강화',
    progress: 58,
    subjects: ['영어'],
    weaknessType: '시간 부족',
    goalRate: 54,
    activeLevel: 'NORMAL',
    today: [
      { todo: '영어 지문 3개 해석', status: 'DONE', subject: '영어', duration: '0:55:00' },
      { todo: '단어 테스트', status: 'DONE', subject: '영어', duration: '0:20:00' },
    ],
  },
  {
    id: 'm3',
    name: '박민재',
    grade: '고3',
    track: '과학탐구 심화',
    progress: 44,
    subjects: ['수학', '영어'],
    weaknessType: '개념 누락',
    goalRate: 32,
    activeLevel: 'DANGER',
    today: [
      { todo: '화학 요약 2p', status: 'TODO', subject: '화학', duration: '0:25:00' },
      { todo: '물리 계산 연습', status: 'TODO', subject: '물리', duration: '0:30:00' },
    ],
  },
];

export const useMentorStore = create<MentorState>()(
  persist(
    (set, get) => ({
      mentees: sampleMentees,
      selectedId: sampleMentees[0]?.id ?? '',

      setSelectedId: (id) => set({ selectedId: id }),

      updateFeedback: (id, text) =>
        set({
          mentees: get().mentees.map((m) => (m.id === id ? { ...m, feedback: text } : m)),
        }),

      setMentees: (list) =>
        set({
          mentees: list,
          selectedId: list[0]?.id ?? '',
        }),
    }),
    {
      name: 'mentor-store',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : undefined,
      partialize: (state) => ({
        mentees: state.mentees,
        selectedId: state.selectedId,
      }),
    }
  )
);
