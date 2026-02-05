import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Todo } from '@/src/lib/types/planner';
import type { CreateTodoInput, UpdateTodoInput } from '@/src/services/todo.api';
import {
  createTodo,
  deleteTodo,
  getTodoSnapshot,
  listTodos,
  updateTodo,
} from '@/src/services/todo.api';

export const todoQueryKeys = {
  all: ['todos'] as const,
};

export function useTodosQuery() {
  return useQuery({
    queryKey: todoQueryKeys.all,
    queryFn: listTodos,
    initialData: () => getTodoSnapshot(),
  });
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onSuccess: (created) => {
      queryClient.setQueryData<Todo[]>(todoQueryKeys.all, (prev) => [
        created,
        ...(prev ?? []),
      ]);
    },
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateTodoInput }) => updateTodo(id, patch),
    onSuccess: (updated) => {
      if (!updated) return;
      queryClient.setQueryData<Todo[]>(todoQueryKeys.all, (prev) =>
        (prev ?? []).map((todo) => (todo.id === updated.id ? updated : todo))
      );
    },
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Todo[]>(todoQueryKeys.all, (prev) =>
        (prev ?? []).filter((todo) => todo.id !== id)
      );
    },
  });
}

