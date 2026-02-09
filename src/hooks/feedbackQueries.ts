import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFeedback,
  generateFeedbackDraft,
  listFeedbacks,
  updateFeedback,
} from '@/src/services/feedback.api';
import type { FeedbackDraftRequest } from '@/src/lib/types/feedback';

export const feedbackQueryKeys = {
  all: ['feedbacks'] as const,
};

export function useFeedbacksQuery(params?: {
  menteeId?: number;
  mentorId?: number;
  todoItemId?: number;
}) {
  const safeParams = {
    menteeId: params?.menteeId,
    mentorId: params?.mentorId,
    todoItemId: params?.todoItemId,
  };
  const hasFilter =
    typeof safeParams.menteeId === 'number' ||
    typeof safeParams.mentorId === 'number' ||
    typeof safeParams.todoItemId === 'number';

  return useQuery({
    queryKey: [...feedbackQueryKeys.all, safeParams],
    queryFn: () => listFeedbacks(safeParams),
    enabled: hasFilter,
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
