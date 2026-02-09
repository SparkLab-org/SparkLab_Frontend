import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { CreateTodoInput, ListTodosParams, UpdateTodoInput } from '@/src/services/todo.api';
import {
  createTodo,
  deleteTodo,
  getTodoSnapshot,
  getTodo,
  listTodos,
  updateTodo,
} from '@/src/services/todo.api';

export const todoQueryKeys = {
  all: ['todos'] as const,
  detail: (id?: string | null) => [...todoQueryKeys.all, 'detail', id ?? null] as const,
  list: (plannerId?: number | null, planDate?: string | null, menteeId?: number | null) =>
    [
      ...todoQueryKeys.all,
      'list',
      plannerId ?? null,
      planDate ?? null,
      menteeId ?? null,
    ] as const,
  range: (dates: string[]) => [...todoQueryKeys.all, 'range', ...dates] as const,
};

type TodoItem = ReturnType<typeof getTodoSnapshot>[number];

const RANGE_CACHE_TTL_MS = 60 * 1000;
const RANGE_TODOS_CACHE = new Map<string, { ts: number; items: TodoItem[] }>();

function readRangeCache(date: string): TodoItem[] | null {
  const cached = RANGE_TODOS_CACHE.get(date);
  if (!cached) return null;
  if (Date.now() - cached.ts > RANGE_CACHE_TTL_MS) {
    RANGE_TODOS_CACHE.delete(date);
    return null;
  }
  return cached.items;
}

function writeRangeCache(date: string, items: TodoItem[]) {
  RANGE_TODOS_CACHE.set(date, { ts: Date.now(), items });
}

function clearRangeCache() {
  RANGE_TODOS_CACHE.clear();
}

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function useTodosQuery(params: ListTodosParams = {}) {
  const plannerId = params.plannerId ?? null;
  let planDate = params.planDate ?? null;
  const menteeId = params.menteeId ?? null;
  if (!planDate && plannerId == null) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    planDate = `${yyyy}-${mm}-${dd}`;
  }

  const resolvedParams: ListTodosParams = {
    ...params,
    plannerId: plannerId ?? undefined,
    planDate: planDate ?? undefined,
    menteeId: menteeId ?? undefined,
  };

  return useQuery({
    queryKey: todoQueryKeys.list(plannerId, planDate, menteeId),
    queryFn: () => listTodos(resolvedParams),
    initialData: () => getTodoSnapshot(),
  });
}

export function useTodoDetailQuery(todoId?: string | number) {
  const resolvedId =
    typeof todoId === 'number' || (typeof todoId === 'string' && todoId.trim().length > 0)
      ? String(todoId)
      : null;

  return useQuery({
    queryKey: todoQueryKeys.detail(resolvedId),
    queryFn: () => getTodo(resolvedId as string),
    enabled: Boolean(resolvedId),
  });
}

export function useTodosRangeQuery(dates: string[]) {
  const normalized = Array.from(
    new Set(dates.filter((date) => isValidDateString(date)))
  ).sort();

  return useQuery({
    queryKey: todoQueryKeys.range(normalized),
    queryFn: async () => {
      if (normalized.length === 0) return [];
      const merged = new Map<string, TodoItem>();
      const targets: string[] = [];

      normalized.forEach((planDate) => {
        const cached = readRangeCache(planDate);
        if (cached) {
          cached.forEach((todo) => merged.set(todo.id, todo));
        } else {
          targets.push(planDate);
        }
      });

      if (targets.length === 0) {
        return Array.from(merged.values());
      }

      const concurrency = 6;
      let cursor = 0;
      const results: TodoItem[][] = new Array(targets.length);

      async function worker() {
        while (cursor < targets.length) {
          const index = cursor++;
          const planDate = targets[index];
          try {
            const items = await listTodos({ planDate });
            results[index] = items;
          } catch {
            results[index] = [];
          }
        }
      }

      await Promise.all(
        Array.from({ length: Math.min(concurrency, targets.length) }, () => worker())
      );

      results.forEach((items, index) => {
        const planDate = targets[index];
        writeRangeCache(planDate, items);
        items.forEach((todo) => merged.set(todo.id, todo));
      });

      return Array.from(merged.values());
    },
    initialData: () => getTodoSnapshot(),
    enabled: normalized.length > 0,
  });
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => createTodo(input),
    onSuccess: () => {
      clearRangeCache();
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
      clearRangeCache();
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    },
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: (_, id) => {
      clearRangeCache();
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    },
  });
}
