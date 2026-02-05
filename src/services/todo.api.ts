import { apiFetch } from '@/src/services/appClient';
import type { Todo, TodoStatus, TodoSubject, TodoType } from '@/src/lib/types/planner';
import * as mockApi from '@/src/services/todo.mock';

export type CreateTodoInput = {
  title: string;
  subject: TodoSubject;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  type: TodoType;
};

export type UpdateTodoInput = Partial<
  Pick<
    Todo,
    'title' | 'subject' | 'status' | 'studyMinutes' | 'dueDate' | 'dueTime' | 'type' | 'feedback'
  >
>;

type TodoApiSubject = 'KOREAN' | 'ENGLISH' | 'MATH' | string;
type TodoApiType = 'TASK' | 'ASSIGNMENT' | 'HOMEWORK' | 'STUDY' | string;

type TodoApiItem = {
  todoItemId: number;
  plannerId?: number;
  targetDate: string;
  title: string;
  subject: TodoApiSubject;
  type?: TodoApiType;
  isFixed: boolean;
  status?: string;
  feedback?: string | null;
  plannedMinutes?: number;
  actualMinutes?: number;
  completedAt?: string | null;
  createTime?: string;
  updateTime?: string;
};

type CreateTodoApiRequest = {
  title: string;
  subject: TodoApiSubject;
  targetDate: string;
  plannerId?: number;
  plannedMinutes?: number;
  type?: TodoApiType;
};

type UpdateTodoApiRequest = Partial<CreateTodoApiRequest> & {
  status?: string;
  actualMinutes?: number;
  completedAt?: string | null;
  feedback?: string | null;
};

const USE_MOCK = process.env.NEXT_PUBLIC_TODO_API_MODE !== 'backend';
const TODO_BASE_PATH = '/domain/todos';
const DEFAULT_PLANNER_ID = process.env.NEXT_PUBLIC_PLANNER_ID;

const SUBJECT_FROM_API: Record<string, TodoSubject> = {
  KOREAN: '국어',
  ENGLISH: '영어',
  MATH: '수학',
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
  과제: 'TASK',
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

function mapTodoFromApi(item: TodoApiItem): Todo {
  return {
    id: String(item.todoItemId),
    title: item.title ?? '',
    isFixed: item.isFixed ?? false,
    type: toTodoType(item.type, item.isFixed),
    feedback: item.feedback ?? null,
    status: toTodoStatus(item.status, item.completedAt ?? null),
    subject: toTodoSubject(item.subject),
    studyMinutes:
      typeof item.actualMinutes === 'number'
        ? item.actualMinutes
        : item.plannedMinutes ?? 0,
    createdAt: toEpochMillis(item.createTime ?? item.updateTime ?? item.completedAt ?? null),
    dueDate: item.targetDate ?? '',
    dueTime: toTimeHHmm(item.completedAt ?? item.updateTime ?? item.createTime ?? null),
  };
}

function resolvePlannerId(): number | undefined {
  if (!DEFAULT_PLANNER_ID) return undefined;
  const parsed = Number(DEFAULT_PLANNER_ID);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function getTodoSnapshot(): Todo[] {
  return USE_MOCK ? mockApi.getTodoSnapshot() : [];
}

export async function listTodos(): Promise<Todo[]> {
  if (USE_MOCK) return mockApi.listTodos();

  const plannerId = resolvePlannerId();
  const query = plannerId ? `?plannerId=${plannerId}` : '';
  const items = await apiFetch<TodoApiItem[]>(`${TODO_BASE_PATH}${query}`);
  return items.map(mapTodoFromApi);
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

  const payload: CreateTodoApiRequest = {
    title: input.title,
    subject: toApiSubject(input.subject),
    targetDate: input.dueDate,
    type: toApiType(input.type),
  };

  const plannerId = resolvePlannerId();
  if (plannerId) payload.plannerId = plannerId;

  const created = await apiFetch<TodoApiItem>(TODO_BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return mapTodoFromApi(created);
}

export async function updateTodo(
  todoItemId: string,
  patch: UpdateTodoInput
): Promise<Todo | null> {
  if (USE_MOCK) return mockApi.updateTodo(todoItemId, patch);

  const payload: UpdateTodoApiRequest = {};
  if (patch.title) payload.title = patch.title;
  if (patch.subject) payload.subject = toApiSubject(patch.subject);
  if (patch.status) payload.status = toApiStatus(patch.status);
  if (typeof patch.studyMinutes === 'number') payload.actualMinutes = patch.studyMinutes;
  if (patch.dueDate) payload.targetDate = patch.dueDate;
  if (patch.type) payload.type = toApiType(patch.type);
  if (patch.feedback !== undefined) payload.feedback = patch.feedback;

  if (Object.keys(payload).length === 0) {
    return null;
  }

  const updated = await apiFetch<TodoApiItem>(`${TODO_BASE_PATH}/${todoItemId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return mapTodoFromApi(updated);
}

export async function deleteTodo(todoItemId: string): Promise<void> {
  if (USE_MOCK) return mockApi.deleteTodo(todoItemId);

  await apiFetch(`${TODO_BASE_PATH}/${todoItemId}`, {
    method: 'DELETE',
  });
}
