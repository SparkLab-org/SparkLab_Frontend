import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Mentee } from '@/src/components/mentor/types';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

type MentorState = {
  mentees: Mentee[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  updateFeedback: (id: string, text: string) => void;
  updateMenteeLevel: (id: string, level: Mentee['activeLevel']) => void;
  setMentees: (list: Mentee[]) => void;
};

const sampleMentees: Mentee[] = [
  {
    id: 'm1',
    name: '김솔',
    grade: '고2',
    track: '수학 집중 과정',
    progress: 78,
    subjects: ['수학', '영어', '국어'],
    weaknessType: '계산 실수',
    goalRate: 74,
    activeLevel: 'WARNING',
    today: [
      { todo: '수학 문제집 30p', status: 'DONE', subject: '수학', duration: '1:10:36' },
      { todo: '영어 단어 2회독', status: 'DONE', subject: '영어', duration: '0:42:00' },
      { todo: '국어 비문학 요약', status: 'TODO', subject: '국어', duration: '0:30:00' },
    ],
    feedback: '수학 풀이 과정이 좋아졌어요. 영어는 발음까지 연습하기!',
  },
  {
    id: 'm2',
    name: '이하늘',
    grade: '고1',
    track: '영어 리딩 강화',
    progress: 66,
    subjects: ['영어', '수학', '국어'],
    weaknessType: '시간 부족',
    goalRate: 61,
    activeLevel: 'NORMAL',
    today: [
      { todo: '영어 지문 3개 해석', status: 'DONE', subject: '영어', duration: '0:55:00' },
      { todo: '수학 개념 복습 4단원', status: 'DONE', subject: '수학', duration: '0:50:00' },
      { todo: '국어 독서 지문 1세트', status: 'TODO', subject: '국어', duration: '0:35:00' },
    ],
  },
  {
    id: 'm3',
    name: '박민재',
    grade: '고3',
    track: '수능 최종 점검',
    progress: 52,
    subjects: ['수학', '영어'],
    weaknessType: '시간 관리',
    goalRate: 47,
    activeLevel: 'DANGER',
    today: [
      { todo: '수학 실전 모의 1회', status: 'TODO', subject: '수학', duration: '1:20:00' },
      { todo: '영어 듣기 3회분', status: 'TODO', subject: '영어', duration: '0:45:00' },
      { todo: '국어 문학 작품 정리', status: 'DONE', subject: '국어', duration: '0:33:00' },
    ],
  },
  {
    id: 'm4',
    name: '정다온',
    grade: '중3',
    track: '국어·영어 기초 강화',
    progress: 63,
    subjects: ['국어', '영어'],
    weaknessType: '지문 독해 속도',
    goalRate: 59,
    activeLevel: 'NORMAL',
    today: [
      { todo: '국어 서술형 첨삭 과제', status: 'TODO', subject: '국어', duration: '0:40:00' },
      { todo: '영어 받아쓰기 40문장', status: 'DONE', subject: '영어', duration: '0:28:00' },
    ],
  },
  {
    id: 'm5',
    name: '최윤서',
    grade: '고1',
    track: '수학 내신 집중',
    progress: 71,
    subjects: ['수학', '영어'],
    weaknessType: '실수 관리',
    goalRate: 69,
    activeLevel: 'WARNING',
    today: [
      { todo: '수학 킬러 15문항', status: 'TODO', subject: '수학', duration: '1:00:00' },
      { todo: '영어 쉐도잉 30분', status: 'DONE', subject: '영어', duration: '0:30:00' },
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

      updateMenteeLevel: (id, level) =>
        set({
          mentees: get().mentees.map((m) =>
            m.id === id ? { ...m, activeLevel: level } : m
          ),
        }),

      setMentees: (list) =>
        set({
          mentees: list,
          selectedId: list[0]?.id ?? '',
        }),
    }),
    {
      name: DEMO_MODE ? 'mentor-store-demo-v2' : 'mentor-store',
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
