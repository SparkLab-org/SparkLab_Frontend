import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateTodoInput, ListTodosParams, UpdateTodoInput } from '@/src/services/todo.api';
import {
  createTodo,
  deleteTodo,
  getTodoSnapshot,
  listTodos,
  updateTodo,
} from '@/src/services/todo.api';

export const todoQueryKeys = {
  all: ['todos'] as const,
  list: (plannerId?: number | null, planDate?: string | null) =>
    [...todoQueryKeys.all, 'list', plannerId ?? null, planDate ?? null] as const,
};

export function useTodosQuery(params: ListTodosParams = {}) {
  const plannerId = params.plannerId ?? null;
  const planDate = params.planDate ?? null;

  return useQuery({
    queryKey: todoQueryKeys.list(plannerId, planDate),
    queryFn: () => listTodos(params),
    initialData: () => getTodoSnapshot(),
  });
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    },
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateTodoInput }) => updateTodo(id, patch),
    onSuccess: (updated) => {
      if (!updated) return;
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    },
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    },
  });
}
