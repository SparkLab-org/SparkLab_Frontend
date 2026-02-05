import type { Todo, TodoSubject, TodoType } from '@/src/lib/types/planner';

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

const STORAGE_KEY = 'mock-todos';

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const seedTodos: Todo[] = [
  {
    id: 'seed-1',
    title: '멘토 · 수학 문제집 30p',
    isFixed: true,
    status: 'TODO',
    subject: '수학',
    type: '과제',
    feedback: '풀이 과정이 좋아요. 계산 실수를 줄여봅시다.',
    studyMinutes: 0,
    createdAt: Date.now(),
    dueDate: todayISO(),
    dueTime: '23:59',
  },
  {
    id: 'seed-2',
    title: '멘토 · 영어 단어 2회독',
    isFixed: true,
    status: 'TODO',
    subject: '영어',
    type: '과제',
    feedback: '요약이 깔끔해요. 키워드 중심으로 정리해봅시다.',
    studyMinutes: 0,
    createdAt: Date.now(),
    dueDate: todayISO(),
    dueTime: '21:00',
  },
  {
    id: 'seed-3',
    title: '내가 추가 · 과학 요약',
    isFixed: false,
    status: 'DONE',
    subject: '국어',
    type: '학습',
    feedback: '요약이 깔끔해요. 키워드 중심으로 정리해봅시다.',
    studyMinutes: 20,
    createdAt: Date.now(),
    dueDate: todayISO(),
    dueTime: '18:30',
  },
];

function loadFromStorage(): Todo[] | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Todo[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveToStorage(todos: Todo[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

let mockTodos: Todo[] = seedTodos;

export function getTodoSnapshot(): Todo[] {
  return mockTodos;
}

export async function listTodos(): Promise<Todo[]> {
  const stored = loadFromStorage();
  if (stored) {
    mockTodos = stored;
  }
  return mockTodos;
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const newTodo: Todo = {
    id: uid(),
    title: input.title,
    isFixed: false,
    status: 'TODO',
    subject: input.subject,
    type: input.type,
    feedback: null,
    studyMinutes: 0,
    createdAt: Date.now(),
    dueDate: input.dueDate,
    dueTime: input.dueTime,
  };

  mockTodos = [newTodo, ...mockTodos];
  saveToStorage(mockTodos);
  return newTodo;
}

export async function updateTodo(id: string, patch: UpdateTodoInput): Promise<Todo | null> {
  const idx = mockTodos.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const updated = { ...mockTodos[idx], ...patch };
  mockTodos = [...mockTodos.slice(0, idx), updated, ...mockTodos.slice(idx + 1)];
  saveToStorage(mockTodos);
  return updated;
}

export async function deleteTodo(id: string): Promise<void> {
  mockTodos = mockTodos.filter((t) => t.id !== id);
  saveToStorage(mockTodos);
}
