import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type FeedbackEntry = {
  summary: string;
  overall: string;
  updatedAt: number;
};

type MentorFeedbackState = {
  entries: Record<string, FeedbackEntry>;
  setEntry: (menteeId: string, dateKey: string, patch: Partial<FeedbackEntry>) => void;
};

function buildKey(menteeId: string, dateKey: string) {
  return `${menteeId}:${dateKey}`;
}

export const useMentorFeedbackStore = create<MentorFeedbackState>()(
  persist(
    (set, get) => ({
      entries: {},
      setEntry: (menteeId, dateKey, patch) => {
        const key = buildKey(menteeId, dateKey);
        const current = get().entries[key] ?? { summary: '', overall: '', updatedAt: 0 };
        const next: FeedbackEntry = {
          summary: patch.summary ?? current.summary,
          overall: patch.overall ?? current.overall,
          updatedAt: Date.now(),
        };
        set({ entries: { ...get().entries, [key]: next } });
      },
    }),
    {
      name: 'mentor-feedback-store',
      storage:
        typeof window !== 'undefined'
          ? createJSONStorage(() => localStorage)
          : undefined,
    }
  )
);
