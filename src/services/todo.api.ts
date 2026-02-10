import { apiFetch } from '@/src/services/appClient';
import { findOrCreateDailyPlan, findOrCreateDailyPlanForMentee } from '@/src/services/dailyPlan.api';
import type { Todo, TodoStatus, TodoSubject, TodoType } from '@/src/lib/types/planner';
import * as mockApi from '@/src/services/todo.mock';

export type CreateTodoInput = {
  title: string;
  subject: TodoSubject;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  type: TodoType;
  goal?: string;
  assigneeId?: string;
  assigneeName?: string;
  guideFileName?: string;
  guideFileUrl?: string;
  isFixed?: boolean;
  plannedMinutes?: number;
};

export type UpdateTodoInput = Partial<
  Pick<
    Todo,
    | 'title'
    | 'subject'
    | 'status'
    | 'studySeconds'
    | 'dueDate'
    | 'dueTime'
    | 'type'
    | 'feedback'
    | 'goal'
    | 'assigneeId'
    | 'assigneeName'
    | 'guideFileName'
    | 'guideFileUrl'
    | 'isFixed'
  >
>;

type UpdateTodoExtras = {
  plannedMinutes?: number;
  actualMinutes?: number;
  actualSeconds?: number;
  completedAt?: string | null;
};

export type UpdateTodoInputWithExtras = UpdateTodoInput & UpdateTodoExtras;

export type ListTodosParams = {
  plannerId?: number;
  planDate?: string; // YYYY-MM-DD
};

type TodoApiSubject = 'KOREAN' | 'ENGLISH' | 'MATH' | 'ALL' | string;
type TodoApiType = 'TASK' | 'ASSIGNMENT' | 'HOMEWORK' | 'STUDY' | string;

type TodoApiItem = {
  todoItemId: number;
  plannerId?: number;
  assignmentId?: number;
  targetDate: string;
  title: string;
  subject: TodoApiSubject;
  type?: TodoApiType;
  isFixed: boolean;
  goal?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  guideFileName?: string | null;
  guideFileUrl?: string | null;
  status?: string;
  feedback?: string | null;
  plannedMinutes?: number;
  actualMinutes?: number;
  actualSeconds?: number;
  completedAt?: string | null;
  createTime?: string;
  updateTime?: string;
};

type CreateTodoApiRequest = {
  plannerId: number;
  title: string;
  targetDate?: string;
  subject?: TodoApiSubject;
  type?: TodoApiType;
  plannedMinutes?: number;
};

type UpdateTodoApiRequest = {
  title?: string;
  targetDate?: string;
  subject?: TodoApiSubject;
  type?: TodoApiType;
  status?: string;
  plannedMinutes?: number;
  actualMinutes?: number;
  actualSeconds?: number;
  completedAt?: string | null;
};

const USE_MOCK = process.env.NEXT_PUBLIC_TODO_API_MODE !== 'backend';
const TODO_BASE_PATH = '/todos';
const TODO_FIXED_PATH = '/todos/fixed';
const DEFAULT_PLANNER_ID = process.env.NEXT_PUBLIC_PLANNER_ID;
const DAILY_PLAN_CACHE_KEY = 'dailyPlan';
const DAILY_PLAN_CACHE = new Map<string, number>();
const DAILY_PLAN_FAIL_CACHE_KEY = 'dailyPlanFail';
const DAILY_PLAN_FAIL_CACHE = new Map<string, number>();
const DAILY_PLAN_INFLIGHT = new Map<string, Promise<number | undefined>>();
const DAILY_PLAN_FAIL_TTL_MS = 5 * 60 * 1000;
const DAILY_PLAN_DISABLED_KEY = 'dailyPlanDisabledUntil';
let DAILY_PLAN_DISABLED_UNTIL = 0;
const TODO_META_STORAGE_KEY = 'todoMeta';
const TODO_META_CACHE = new Map<
  string,
  { goal?: string | null; guideFileName?: string | null; assigneeId?: string | null; assigneeName?: string | null }
>();

const SUBJECT_FROM_API: Record<string, TodoSubject> = {
  KOREAN: '국어',
  ENGLISH: '영어',
  MATH: '수학',
  ALL: '국어',
};

const SUBJECT_TO_API: Record<TodoSubject, TodoApiSubject> = {
  국어: 'KOREAN',
  영어: 'ENGLISH',
  수학: 'MATH',
};

const TYPE_FROM_API: Record<string, TodoType> = {
  TASK: '과제',
  ASSIGNMENT: '과제',
  HOMEWORK: '과제',
  STUDY: '학습',
  과제: '과제',
  학습: '학습',
};

const TYPE_TO_API: Record<TodoType, TodoApiType> = {
  과제: 'ASSIGNMENT',
  학습: 'STUDY',
};

function toTodoSubject(subject?: string): TodoSubject {
  return SUBJECT_FROM_API[subject ?? ''] ?? '국어';
}

function toApiSubject(subject: TodoSubject): TodoApiSubject {
  return SUBJECT_TO_API[subject] ?? 'KOREAN';
}

function toTodoType(type?: string, isFixed?: boolean): TodoType {
  if (type) {
    const normalized = type.toUpperCase();
    if (TYPE_FROM_API[normalized]) return TYPE_FROM_API[normalized];
    if (TYPE_FROM_API[type]) return TYPE_FROM_API[type];
  }
  return isFixed ? '과제' : '학습';
}

function toApiType(type: TodoType): TodoApiType {
  return TYPE_TO_API[type] ?? 'STUDY';
}

function toTodoStatus(status?: string, completedAt?: string | null): TodoStatus {
  if (status === 'DONE' || status === 'COMPLETED') return 'DONE';
  if (completedAt) return 'DONE';
  return 'TODO';
}

function toApiStatus(status: TodoStatus): string {
  return status === 'DONE' ? 'DONE' : 'TODO';
}

function toEpochMillis(iso?: string | null): number {
  if (!iso) return Date.now();
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function toTimeHHmm(iso?: string | null, fallback = '23:59'): string {
  if (!iso) return fallback;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return fallback;
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function isValidDateString(value?: string): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function mapTodoFromApi(item: TodoApiItem): Todo {
  const base: Todo = {
    id: String(item.todoItemId),
    assignmentId:
      typeof item.assignmentId === 'number' ? item.assignmentId : null,
    title: item.title ?? '',
    isFixed: item.isFixed ?? false,
    type: toTodoType(item.type, item.isFixed),
    feedback: item.feedback ?? null,
    goal: item.goal ?? null,
    assigneeId: item.assigneeId ?? null,
    assigneeName: item.assigneeName ?? null,
    guideFileName: item.guideFileName ?? null,
    guideFileUrl: item.guideFileUrl ?? null,
    status: toTodoStatus(item.status, item.completedAt ?? null),
    subject: toTodoSubject(item.subject),
    studySeconds:
      typeof item.actualSeconds === 'number'
        ? Math.round(item.actualSeconds)
        : typeof item.actualMinutes === 'number'
        ? Math.round(item.actualMinutes * 60)
        : Math.round((item.plannedMinutes ?? 0) * 60),
    createdAt: toEpochMillis(item.createTime ?? item.updateTime ?? item.completedAt ?? null),
    dueDate: item.targetDate ?? '',
    dueTime: toTimeHHmm(item.completedAt ?? item.updateTime ?? item.createTime ?? null),
  };
  return applyTodoMeta(base);
}

function resolvePlannerId(): number | undefined {
  if (typeof window !== 'undefined') {
    const accountId = window.localStorage.getItem('accountId');
    if (accountId) {
      const scoped = window.localStorage.getItem(`plannerId:${accountId}`);
      if (scoped) {
        const parsed = Number(scoped);
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
      }
      // accountId가 있으면 전역 plannerId로 폴백하지 않습니다(계정 섞임 방지).
      return undefined;
    }
    const stored = window.localStorage.getItem('plannerId');
    if (stored) {
      const parsed = Number(stored);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
  }
  if (!DEFAULT_PLANNER_ID) return undefined;
  const parsed = Number(DEFAULT_PLANNER_ID);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function resolveStoredRole(): 'MENTEE' | 'MENTOR' | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem('role');
  if (raw && raw.trim().length > 0) {
    return raw.toUpperCase() === 'MENTEE' ? 'MENTEE' : 'MENTOR';
  }
  const path = window.location?.pathname ?? '';
  if (path.startsWith('/mentor')) return 'MENTOR';
  return null;
}

function getDailyPlanCacheKey(planDate: string, contextKey?: string) {
  if (contextKey) return `${contextKey}:${planDate}`;
  if (typeof window !== 'undefined') {
    const accountId = window.localStorage.getItem('accountId');
    if (accountId) return `${accountId}:${planDate}`;
  }
  return `anon:${planDate}`;
}

function resolveNumericId(value?: string | number | null): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
    const match = value.match(/\d+/);
    if (match) {
      const extracted = Number(match[0]);
      return Number.isFinite(extracted) ? extracted : undefined;
    }
  }
  return undefined;
}

function readDailyPlanCache(key: string): number | undefined {
  const cached = DAILY_PLAN_CACHE.get(key);
  if (cached) return cached;
  if (typeof window === 'undefined') return undefined;
  const stored = window.localStorage.getItem(`${DAILY_PLAN_CACHE_KEY}:${key}`);
  if (!stored) return undefined;
  const parsed = Number(stored);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  DAILY_PLAN_CACHE.set(key, parsed);
  return parsed;
}

function writeDailyPlanCache(key: string, dailyPlanId: number) {
  if (!Number.isFinite(dailyPlanId) || dailyPlanId <= 0) return;
  DAILY_PLAN_CACHE.set(key, dailyPlanId);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(`${DAILY_PLAN_CACHE_KEY}:${key}`, String(dailyPlanId));
  }
}

function readDailyPlanFail(key: string): number | undefined {
  const cached = DAILY_PLAN_FAIL_CACHE.get(key);
  if (cached) return cached;
  if (typeof window === 'undefined') return undefined;
  const stored = window.localStorage.getItem(`${DAILY_PLAN_FAIL_CACHE_KEY}:${key}`);
  if (!stored) return undefined;
  const parsed = Number(stored);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function writeDailyPlanFail(key: string) {
  const now = Date.now();
  DAILY_PLAN_FAIL_CACHE.set(key, now);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(`${DAILY_PLAN_FAIL_CACHE_KEY}:${key}`, String(now));
  }
}

function readTodoMeta(id: string) {
  const cached = TODO_META_CACHE.get(id);
  if (cached) return cached;
  if (typeof window === 'undefined') return undefined;
  const stored = window.localStorage.getItem(`${TODO_META_STORAGE_KEY}:${id}`);
  if (!stored) return undefined;
  try {
    const parsed = JSON.parse(stored) as {
      goal?: string | null;
      guideFileName?: string | null;
      assigneeId?: string | null;
      assigneeName?: string | null;
    };
    if (parsed && typeof parsed === 'object') {
      TODO_META_CACHE.set(id, parsed);
      return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return undefined;
}

function writeTodoMeta(
  id: string,
  meta:
    | { goal?: string | null; guideFileName?: string | null; assigneeId?: string | null; assigneeName?: string | null }
    | null
) {
  if (!meta || (!meta.goal && !meta.guideFileName && !meta.assigneeId && !meta.assigneeName)) {
    TODO_META_CACHE.delete(id);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(`${TODO_META_STORAGE_KEY}:${id}`);
    }
    return;
  }
  TODO_META_CACHE.set(id, meta);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(`${TODO_META_STORAGE_KEY}:${id}`, JSON.stringify(meta));
  }
}

function applyTodoMeta(todo: Todo): Todo {
  const meta = readTodoMeta(todo.id);
  if (!meta) return todo;
  return {
    ...todo,
    goal: todo.goal ?? meta.goal ?? null,
    guideFileName: todo.guideFileName ?? meta.guideFileName ?? null,
    assigneeId: todo.assigneeId ?? meta.assigneeId ?? null,
    assigneeName: todo.assigneeName ?? meta.assigneeName ?? null,
  };
}

function updateTodoMetaFromPatch(
  id: string,
  patch: {
    goal?: string | null;
    guideFileName?: string | null;
    assigneeId?: string | null;
    assigneeName?: string | null;
  }
) {
  if (
    patch.goal === undefined &&
    patch.guideFileName === undefined &&
    patch.assigneeId === undefined &&
    patch.assigneeName === undefined
  )
    return;
  const current = readTodoMeta(id) ?? {};
  const next = {
    ...current,
    ...(patch.goal !== undefined ? { goal: patch.goal } : {}),
    ...(patch.guideFileName !== undefined ? { guideFileName: patch.guideFileName } : {}),
    ...(patch.assigneeId !== undefined ? { assigneeId: patch.assigneeId } : {}),
    ...(patch.assigneeName !== undefined ? { assigneeName: patch.assigneeName } : {}),
  };
  writeTodoMeta(id, next);
}

function readDailyPlanDisabledUntil(): number {
  if (DAILY_PLAN_DISABLED_UNTIL > 0) return DAILY_PLAN_DISABLED_UNTIL;
  if (typeof window === 'undefined') return 0;
  const stored = window.localStorage.getItem(DAILY_PLAN_DISABLED_KEY);
  const parsed = stored ? Number(stored) : NaN;
  if (Number.isFinite(parsed)) {
    DAILY_PLAN_DISABLED_UNTIL = parsed;
    return parsed;
  }
  return 0;
}

function disableDailyPlanForTTL() {
  const until = Date.now() + DAILY_PLAN_FAIL_TTL_MS;
  DAILY_PLAN_DISABLED_UNTIL = until;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(DAILY_PLAN_DISABLED_KEY, String(until));
  }
}

async function resolveDailyPlanId(
  planDate?: string,
  menteeId?: string | number | null,
  options?: { force?: boolean; accountId?: string | null }
) {
  if (!planDate) return undefined;
  if (!isValidDateString(planDate)) return undefined;
  const accountKey = options?.accountId?.trim()
    ? `account:${options.accountId.trim()}`
    : undefined;
  const menteeKey =
    menteeId !== undefined && menteeId !== null
      ? `mentee:${String(menteeId)}`
      : undefined;
  const contextKey =
    accountKey && menteeKey
      ? `${accountKey}|${menteeKey}`
      : accountKey ?? menteeKey;
  const key = getDailyPlanCacheKey(planDate, contextKey);
  const cached = readDailyPlanCache(key);
  if (cached) return cached;
  if (!options?.force) {
    const disabledUntil = readDailyPlanDisabledUntil();
    if (disabledUntil && Date.now() < disabledUntil) {
      return undefined;
    }
  }
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('accessToken');
    if (!token) return undefined;
  }
  if (!options?.force) {
    const lastFail = readDailyPlanFail(key);
    if (lastFail && Date.now() - lastFail < DAILY_PLAN_FAIL_TTL_MS) {
      return undefined;
    }
  }
  const inflight = DAILY_PLAN_INFLIGHT.get(key);
  if (inflight) return inflight;

  const request = (async () => {
    try {
      const menteeNumericId = resolveNumericId(menteeId ?? null);
      const accountId = options?.accountId?.trim();
      const role = resolveStoredRole();
      let res;
      if (role === 'MENTOR' && menteeNumericId) {
        res = await findOrCreateDailyPlanForMentee(menteeNumericId, {
          planDate,
        });
      }
      if (!res && role !== 'MENTOR') {
        res = await findOrCreateDailyPlan({
          planDate,
          ...(menteeNumericId ? { menteeId: menteeNumericId } : {}),
          ...(accountId ? { accountId } : {}),
        });
      }
      if (res?.dailyPlanId && res.dailyPlanId > 0) {
        writeDailyPlanCache(key, res.dailyPlanId);
        return res.dailyPlanId;
      }
    } catch {
      writeDailyPlanFail(key);
      disableDailyPlanForTTL();
    } finally {
      DAILY_PLAN_INFLIGHT.delete(key);
    }
    return undefined;
  })();

  DAILY_PLAN_INFLIGHT.set(key, request);
  return request;
}

function buildListQuery(params: ListTodosParams): string {
  const search = new URLSearchParams();
  if (typeof params.plannerId === 'number' && params.plannerId > 0) {
    search.set('plannerId', String(params.plannerId));
  } else if (params.planDate) {
    search.set('planDate', params.planDate);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function getTodoSnapshot(): Todo[] {
  return USE_MOCK ? mockApi.getTodoSnapshot() : [];
}

export async function listTodos(params: ListTodosParams = {}): Promise<Todo[]> {
  if (USE_MOCK) return mockApi.listTodos();

  const storedRole = resolveStoredRole();
  const storedMenteeId =
    typeof window !== 'undefined' ? window.localStorage.getItem('menteeId') : null;
  const storedAccountId =
    typeof window !== 'undefined' ? window.localStorage.getItem('accountId') : null;
  const isMentee = storedRole === 'MENTEE' || (!storedRole && Boolean(storedMenteeId));

  const dailyPlanId = isMentee
    ? await resolveDailyPlanId(params.planDate, storedMenteeId, {
        accountId: storedAccountId,
      })
    : undefined;
  const plannerId = params.plannerId ?? dailyPlanId;
  if (isMentee && params.planDate && !plannerId && !params.plannerId) {
    return [];
  }
  const query = buildListQuery({ plannerId, planDate: params.planDate });
  try {
    const items = await apiFetch<TodoApiItem[]>(`${TODO_BASE_PATH}${query}`);
    return items.map(mapTodoFromApi);
  } catch (error) {
    if (isMentee) {
      return [];
    }
    if (!isMentee && plannerId && params.planDate) {
      const fallbackQuery = buildListQuery({ planDate: params.planDate });
      const items = await apiFetch<TodoApiItem[]>(`${TODO_BASE_PATH}${fallbackQuery}`);
      return items.map(mapTodoFromApi);
    }
    throw error;
  }
}

export async function getTodo(todoItemId: string | number): Promise<Todo> {
  if (USE_MOCK) {
    const items = await mockApi.listTodos();
    const found = items.find((todo) => todo.id === String(todoItemId));
    if (!found) throw new Error('Todo not found');
    return found;
  }

  const item = await apiFetch<TodoApiItem>(`${TODO_BASE_PATH}/${todoItemId}`);
  return mapTodoFromApi(item);
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  if (USE_MOCK) return mockApi.createTodo(input);

  const storedRole = resolveStoredRole();
  const storedMenteeId =
    typeof window !== 'undefined' ? window.localStorage.getItem('menteeId') : null;
  const storedAccountId =
    typeof window !== 'undefined' ? window.localStorage.getItem('accountId') : null;
  const menteePlanTarget =
    storedRole === 'MENTOR'
      ? input.assigneeId ?? input.assigneeName ?? null
      : storedMenteeId;
  const menteeAccountId =
    storedRole === 'MENTOR' ? input.assigneeName ?? null : storedAccountId;
  const dailyPlanId = await resolveDailyPlanId(input.dueDate, menteePlanTarget, {
    force: true,
    accountId: menteeAccountId,
  });
  const plannerId = dailyPlanId ?? (input.dueDate ? undefined : resolvePlannerId());
  if (!plannerId || plannerId <= 0) throw new Error('plannerId is required');

  const payload: CreateTodoApiRequest = {
    plannerId,
    title: input.title,
  };
  if (isValidDateString(input.dueDate)) {
    payload.targetDate = input.dueDate;
  }
  if (input.subject) {
    payload.subject = toApiSubject(input.subject);
  }
  if (input.type) {
    payload.type = toApiType(input.type);
  }
  if (typeof input.plannedMinutes === 'number') {
    payload.plannedMinutes = input.plannedMinutes;
  }

  const created = await apiFetch<TodoApiItem>(TODO_BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const mapped = mapTodoFromApi(created);
  if (input.goal || input.guideFileName || input.assigneeId || input.assigneeName) {
    writeTodoMeta(mapped.id, {
      goal: input.goal ?? null,
      guideFileName: input.guideFileName ?? null,
      assigneeId: input.assigneeId ?? null,
      assigneeName: input.assigneeName ?? null,
    });
  }
  return applyTodoMeta(mapped);
}

export async function updateTodo(
  todoItemId: string,
  patch: UpdateTodoInputWithExtras
): Promise<Todo | null> {
  if (USE_MOCK) return mockApi.updateTodo(todoItemId, patch);

  const payload: UpdateTodoApiRequest = {};
  if (patch.title) payload.title = patch.title;
  if (patch.subject) payload.subject = toApiSubject(patch.subject);
  if (patch.type) payload.type = toApiType(patch.type);
  if (patch.status) payload.status = toApiStatus(patch.status);
  if (typeof patch.plannedMinutes === 'number') {
    payload.plannedMinutes = Math.max(0, Math.floor(patch.plannedMinutes));
  }
  if (typeof patch.actualMinutes === 'number') {
    payload.actualMinutes = Math.max(0, Math.floor(patch.actualMinutes));
  }
  if (typeof patch.actualSeconds === 'number') {
    payload.actualSeconds = Math.max(0, Math.floor(patch.actualSeconds));
  }
  if (patch.completedAt !== undefined) {
    payload.completedAt = patch.completedAt;
  }
  if (typeof patch.studySeconds === 'number') {
    const minutes = Math.ceil(patch.studySeconds / 60);
    payload.actualMinutes = Math.max(1, minutes);
    payload.actualSeconds = Math.max(1, Math.floor(patch.studySeconds));
  }
  if (patch.dueDate) payload.targetDate = patch.dueDate;

  if (Object.keys(payload).length === 0) {
    return null;
  }

  const updated = await apiFetch<TodoApiItem>(`${TODO_BASE_PATH}/${todoItemId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  const mapped = mapTodoFromApi(updated);
  updateTodoMetaFromPatch(mapped.id, {
    goal: patch.goal,
    guideFileName: patch.guideFileName,
    assigneeId: patch.assigneeId,
    assigneeName: patch.assigneeName,
  });
  return applyTodoMeta(mapped);
}

export async function deleteTodo(todoItemId: string): Promise<void> {
  if (USE_MOCK) return mockApi.deleteTodo(todoItemId);

  await apiFetch(`${TODO_BASE_PATH}/${todoItemId}`, {
    method: 'DELETE',
  });
}

export async function createFixedTodo(input: CreateTodoInput): Promise<Todo> {
  if (USE_MOCK) return mockApi.createTodo(input);

  const storedRole = resolveStoredRole();
  const storedMenteeId =
    typeof window !== 'undefined' ? window.localStorage.getItem('menteeId') : null;
  const storedAccountId =
    typeof window !== 'undefined' ? window.localStorage.getItem('accountId') : null;
  const menteePlanTarget =
    storedRole === 'MENTOR'
      ? input.assigneeId ?? input.assigneeName ?? null
      : storedMenteeId;
  const menteeAccountId =
    storedRole === 'MENTOR' ? input.assigneeName ?? null : storedAccountId;
  const dailyPlanId = await resolveDailyPlanId(input.dueDate, menteePlanTarget, {
    force: true,
    accountId: menteeAccountId,
  });
  const plannerId = dailyPlanId ?? (input.dueDate ? undefined : resolvePlannerId());
  if (!plannerId || plannerId <= 0) throw new Error('plannerId is required');

  const payload: CreateTodoApiRequest = {
    plannerId,
    title: input.title,
  };
  if (isValidDateString(input.dueDate)) payload.targetDate = input.dueDate;
  if (input.subject) {
    payload.subject = toApiSubject(input.subject);
  }
  if (input.type) {
    payload.type = toApiType(input.type);
  }
  if (typeof input.plannedMinutes === 'number') {
    payload.plannedMinutes = input.plannedMinutes;
  }

  const created = await apiFetch<TodoApiItem>(TODO_FIXED_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const mapped = mapTodoFromApi(created);
  if (input.goal || input.guideFileName || input.assigneeId || input.assigneeName) {
    writeTodoMeta(mapped.id, {
      goal: input.goal ?? null,
      guideFileName: input.guideFileName ?? null,
      assigneeId: input.assigneeId ?? null,
      assigneeName: input.assigneeName ?? null,
    });
  }
  return applyTodoMeta(mapped);
}

export async function updateFixedTodo(
  todoItemId: string,
  patch: UpdateTodoInputWithExtras
): Promise<Todo | null> {
  if (USE_MOCK) return mockApi.updateTodo(todoItemId, patch);

  const payload: UpdateTodoApiRequest = {};
  if (patch.title) payload.title = patch.title;
  if (patch.subject) payload.subject = toApiSubject(patch.subject);
  if (patch.type) payload.type = toApiType(patch.type);
  if (patch.status) payload.status = toApiStatus(patch.status);
  if (typeof patch.plannedMinutes === 'number') {
    payload.plannedMinutes = Math.max(0, Math.floor(patch.plannedMinutes));
  }
  if (typeof patch.actualMinutes === 'number') {
    payload.actualMinutes = Math.max(0, Math.floor(patch.actualMinutes));
  }
  if (typeof patch.actualSeconds === 'number') {
    payload.actualSeconds = Math.max(0, Math.floor(patch.actualSeconds));
  }
  if (patch.completedAt !== undefined) {
    payload.completedAt = patch.completedAt;
  }
  if (typeof patch.studySeconds === 'number') {
    const minutes = Math.ceil(patch.studySeconds / 60);
    payload.actualMinutes = Math.max(1, minutes);
    payload.actualSeconds = Math.max(1, Math.floor(patch.studySeconds));
  }
  if (patch.dueDate) payload.targetDate = patch.dueDate;

  if (Object.keys(payload).length === 0) {
    return null;
  }

  const updated = await apiFetch<TodoApiItem>(`${TODO_FIXED_PATH}/${todoItemId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  const mapped = mapTodoFromApi(updated);
  updateTodoMetaFromPatch(mapped.id, {
    goal: patch.goal,
    guideFileName: patch.guideFileName,
    assigneeId: patch.assigneeId,
    assigneeName: patch.assigneeName,
  });
  return applyTodoMeta(mapped);
}

export async function deleteFixedTodo(todoItemId: string): Promise<void> {
  if (USE_MOCK) return mockApi.deleteTodo(todoItemId);

  await apiFetch(`${TODO_FIXED_PATH}/${todoItemId}`, {
    method: 'DELETE',
  });
}
