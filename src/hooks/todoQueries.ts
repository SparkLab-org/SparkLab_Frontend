import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  CreateTodoInput,
  ListTodosParams,
  UpdateTodoInputWithExtras,
} from '@/src/services/todo.api';
import {
  createFixedTodo,
  createTodo,
  deleteTodo,
  getTodoSnapshot,
  getTodo,
  listTodos,
  listTodosByRange,
  updateTodo,
  updateFixedTodo,
} from '@/src/services/todo.api';

export const todoQueryKeys = {
  all: ['todos'] as const,
  detail: (id?: string | null) => [...todoQueryKeys.all, 'detail', id ?? null] as const,
  list: (
    accountId?: string | null,
    plannerId?: number | null,
    planDate?: string | null,
    menteeId?: number | null
  ) =>
    [
      ...todoQueryKeys.all,
      'list',
      accountId ?? null,
      plannerId ?? null,
      planDate ?? null,
      menteeId ?? null,
    ] as const,
  range: (
    accountId: string | null,
    dates: string[],
    rangeKey?: string | null,
    menteeId?: number | null,
    scope?: string | null
  ) =>
    [
      ...todoQueryKeys.all,
      'range',
      accountId ?? null,
      rangeKey ?? null,
      menteeId ?? null,
      scope ?? null,
      ...dates,
    ] as const,
};

type TodoItem = ReturnType<typeof getTodoSnapshot>[number];

const RANGE_CACHE_TTL_MS = 60 * 1000;
const RANGE_TODOS_CACHE = new Map<string, { ts: number; items: TodoItem[] }>();

function getRangeCacheKey(date: string, accountId: string | null) {
  return `${accountId ?? 'anon'}:${date}`;
}

function readRangeCache(key: string): TodoItem[] | null {
  const cached = RANGE_TODOS_CACHE.get(key);
  if (!cached) return null;
  if (Date.now() - cached.ts > RANGE_CACHE_TTL_MS) {
    RANGE_TODOS_CACHE.delete(key);
    return null;
  }
  return cached.items;
}

function writeRangeCache(key: string, items: TodoItem[]) {
  RANGE_TODOS_CACHE.set(key, { ts: Date.now(), items });
}

function clearRangeCache() {
  RANGE_TODOS_CACHE.clear();
}

function isValidDateString(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function useTodosQuery(params: ListTodosParams = {}) {
  const plannerId = params.plannerId ?? null;
  const menteeId = params.menteeId ?? null;
  let planDate = params.planDate ?? null;
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
  const accountId =
    typeof window !== 'undefined' ? window.localStorage.getItem('accountId') : null;

  return useQuery({
    queryKey: todoQueryKeys.list(accountId, plannerId, planDate, menteeId),
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

export function useTodosRangeQuery(
  dates: string[],
  options?: { rangeStart?: string; rangeEnd?: string; menteeId?: number; scope?: string }
) {
  const normalized = Array.from(
    new Set(dates.filter((date) => isValidDateString(date)))
  ).sort();
  const accountId =
    typeof window !== 'undefined' ? window.localStorage.getItem('accountId') : null;
  const rangeStart = options?.rangeStart;
  const rangeEnd = options?.rangeEnd;
  const menteeId = options?.menteeId;
  const scope = options?.scope ?? null;
  const rangeKey = rangeStart && rangeEnd ? `${rangeStart}:${rangeEnd}` : null;
  const shouldUseRange = Boolean(rangeStart && rangeEnd);

  return useQuery({
    queryKey: todoQueryKeys.range(
      accountId,
      normalized,
      rangeKey,
      menteeId ?? null,
      scope
    ),
    queryFn: async () => {
      if (normalized.length === 0 && !shouldUseRange) return [];

      if (shouldUseRange && rangeStart && rangeEnd) {
        const rangeResult = await listTodosByRange({
          startDate: rangeStart,
          endDate: rangeEnd,
          ...(typeof menteeId === 'number' ? { menteeId } : {}),
        });
        if (rangeResult.hasTodosField) {
          return rangeResult.todos;
        }
      }

      if (normalized.length === 0) return [];
      const merged = new Map<string, TodoItem>();
      const targets: string[] = [];

      normalized.forEach((planDate) => {
        const cacheKey = getRangeCacheKey(planDate, accountId);
        const cached = readRangeCache(cacheKey);
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
        const cacheKey = getRangeCacheKey(planDate, accountId);
        writeRangeCache(cacheKey, items);
        items.forEach((todo) => merged.set(todo.id, todo));
      });

      return Array.from(merged.values());
    },
    initialData: () => getTodoSnapshot(),
    staleTime: 60 * 1000,
    refetchOnMount: (query) => {
      const data = query.state.data;
      if (!Array.isArray(data) || data.length === 0) return 'always';
      return false;
    },
    enabled: normalized.length > 0 || shouldUseRange,
  });
}

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoInput) =>
      input.isFixed ? createFixedTodo(input) : createTodo(input),
    onSuccess: () => {
      clearRangeCache();
      queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    },
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      patch,
      isFixed,
    }: {
      id: string;
      patch: UpdateTodoInputWithExtras;
      isFixed?: boolean;
    }) => {
      const useFixed =
        typeof isFixed === 'boolean' ? isFixed : Boolean(patch.isFixed);
      return useFixed ? updateFixedTodo(id, patch) : updateTodo(id, patch);
    },
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
