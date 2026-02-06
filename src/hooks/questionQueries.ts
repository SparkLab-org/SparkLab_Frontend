import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Question } from '@/src/lib/types/question';
import type { CreateQuestionInput, UpdateQuestionInput } from '@/src/services/question.api';
import {
  createQuestion,
  deleteQuestion,
  getQuestionSnapshot,
  listQuestions,
  updateQuestion,
} from '@/src/services/question.api';

export const questionQueryKeys = {
  all: ['questions'] as const,
};

export function useQuestionsQuery() {
  return useQuery({
    queryKey: questionQueryKeys.all,
    queryFn: listQuestions,
    initialData: () => getQuestionSnapshot(),
  });
}

export function useCreateQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateQuestionInput) => createQuestion(input),
    onSuccess: (created) => {
      queryClient.setQueryData<Question[]>(questionQueryKeys.all, (prev) => [
        created,
        ...(prev ?? []),
      ]);
    },
  });
}

export function useUpdateQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateQuestionInput }) =>
      updateQuestion(id, patch),
    onSuccess: (updated) => {
      if (!updated) return;
      queryClient.setQueryData<Question[]>(questionQueryKeys.all, (prev) =>
        (prev ?? []).map((item) => (item.id === updated.id ? updated : item))
      );
    },
  });
}

export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Question[]>(questionQueryKeys.all, (prev) =>
        (prev ?? []).filter((item) => item.id !== id)
      );
    },
  });
}
