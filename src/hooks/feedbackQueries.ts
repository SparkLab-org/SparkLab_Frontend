import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addFeedbackBookmark,
  createFeedback,
  generateFeedbackDraft,
  getFeedback,
  listFeedbacks,
  listTodoFeedbackStatus,
  removeFeedbackBookmark,
  updateFeedback,
  updateFeedbackImportant,
} from '@/src/services/feedback.api';
import type { FeedbackDraftRequest } from '@/src/lib/types/feedback';

export const feedbackQueryKeys = {
  all: ['feedbacks'] as const,
  detail: (id?: number | string | null) => [...feedbackQueryKeys.all, 'detail', id ?? null] as const,
};

export function useFeedbacksQuery(params?: {
  todoItemId?: number;
  isImportant?: boolean;
  targetDate?: string;
  subject?: 'KOREAN' | 'ENGLISH' | 'MATH' | 'ALL';
  sort?: string;
}) {
  const safeParams = {
    todoItemId: params?.todoItemId,
    isImportant: params?.isImportant,
    targetDate: params?.targetDate,
    subject: params?.subject,
    sort: params?.sort,
  };

  return useQuery({
    queryKey: [...feedbackQueryKeys.all, safeParams],
    queryFn: () => listFeedbacks(safeParams),
  });
}

export function useFeedbackDetailQuery(feedbackId?: number | string | null) {
  const resolvedId =
    typeof feedbackId === 'number' || (typeof feedbackId === 'string' && feedbackId.trim().length > 0)
      ? feedbackId
      : null;
  return useQuery({
    queryKey: feedbackQueryKeys.detail(resolvedId),
    queryFn: () => getFeedback(resolvedId as number | string),
    enabled: Boolean(resolvedId),
  });
}

export function useCreateFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackQueryKeys.all });
    },
  });
}

export function useUpdateFeedbackMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: number | string; patch: Parameters<typeof updateFeedback>[1] }) =>
      updateFeedback(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackQueryKeys.all });
    },
  });
}

export function useGenerateFeedbackDraftMutation() {
  return useMutation({
    mutationFn: (input: FeedbackDraftRequest) => generateFeedbackDraft(input),
  });
}

function getTodayDateString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function useTodoFeedbackStatusQuery(params?: {
  menteeId?: number;
  planDate?: string;
}) {
  const menteeId = params?.menteeId;
  const planDate = params?.planDate ?? null;

  return useQuery({
    queryKey: [...feedbackQueryKeys.all, 'todo-status', menteeId ?? null, planDate ?? 'today'],
    queryFn: () => {
      if (typeof menteeId !== 'number') return Promise.resolve([]);
      const resolvedDate = planDate ?? getTodayDateString();
      return listTodoFeedbackStatus({ menteeId, planDate: resolvedDate });
    },
    enabled: typeof menteeId === 'number',
  });
}

function isValidDateString(value?: string): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function useTodoFeedbackStatusRangeQuery(params?: {
  menteeId?: number;
  dates?: string[];
}) {
  const menteeId = params?.menteeId;
  const dates = Array.from(
    new Set((params?.dates ?? []).filter((date) => isValidDateString(date)))
  ).sort();

  return useQuery({
    queryKey: [...feedbackQueryKeys.all, 'todo-status-range', menteeId ?? null, ...dates],
    queryFn: async () => {
      if (typeof menteeId !== 'number' || dates.length === 0) return [];
      const concurrency = 6;
      let cursor = 0;
      const results: Array<Awaited<ReturnType<typeof listTodoFeedbackStatus>>> = new Array(
        dates.length
      );

      async function worker() {
        while (cursor < dates.length) {
          const index = cursor++;
          const planDate = dates[index];
          try {
            const items = await listTodoFeedbackStatus({
              menteeId: menteeId as number,
              planDate,
            });
            results[index] = items;
          } catch {
            results[index] = [];
          }
        }
      }

      await Promise.all(
        Array.from({ length: Math.min(concurrency, dates.length) }, () => worker())
      );

      const merged = new Map<number, (typeof results)[number][number]>();
      results.flat().forEach((item) => {
        if (typeof item.todoItemId !== 'number') return;
        merged.set(item.todoItemId, item);
      });
      return Array.from(merged.values());
    },
    enabled: typeof menteeId === 'number' && dates.length > 0,
  });
}

export function useUpdateFeedbackImportantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isImportant }: { id: number | string; isImportant: boolean }) =>
      updateFeedbackImportant(id, isImportant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackQueryKeys.all });
    },
  });
}

export function useAddFeedbackBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => addFeedbackBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackQueryKeys.all });
    },
  });
}

export function useRemoveFeedbackBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => removeFeedbackBookmark(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackQueryKeys.all });
    },
  });
}
