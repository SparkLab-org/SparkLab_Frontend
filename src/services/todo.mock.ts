import type { Todo, TodoSubject, TodoType } from '@/src/lib/types/planner';

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

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const STORAGE_KEY = DEMO_MODE ? 'mock-todos-demo-v2' : 'mock-todos';

function dateOffsetISO(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const now = Date.now();

const seedTodos: Todo[] = [
  {
    id: 'seed-1',
    title: '멘토 · 수학 문제집 30p',
    isFixed: true,
    status: 'TODO',
    subject: '수학',
    type: '과제',
    feedback: null,
    goal: '정확도 90% 이상',
    assigneeId: 'm1',
    assigneeName: '김솔',
    guideFileName: 'week1-math.pdf',
    guideFileUrl: null,
    studySeconds: 0,
    createdAt: now - 1000 * 60 * 60 * 2,
    dueDate: dateOffsetISO(0),
    dueTime: '22:30',
  },
  {
    id: 'seed-2',
    title: '멘토 · 영어 단어 2회독',
    isFixed: true,
    status: 'DONE',
    subject: '영어',
    type: '과제',
    feedback: '암기 속도는 좋아요. 예문으로 다시 복습해보세요.',
    goal: '하루 40개 암기',
    assigneeId: 'm1',
    assigneeName: '김솔',
    guideFileName: null,
    guideFileUrl: null,
    studySeconds: 42 * 60,
    createdAt: now - 1000 * 60 * 60 * 20,
    dueDate: dateOffsetISO(-1),
    dueTime: '21:00',
  },
  {
    id: 'seed-3',
    title: '내가 추가 · 국어 비문학 요약',
    isFixed: false,
    status: 'DONE',
    subject: '국어',
    type: '학습',
    feedback: null,
    goal: '핵심 문장 5개 추출',
    assigneeId: 'm1',
    assigneeName: '김솔',
    guideFileName: null,
    guideFileUrl: null,
    studySeconds: 35 * 60,
    createdAt: now - 1000 * 60 * 60 * 9,
    dueDate: dateOffsetISO(0),
    dueTime: '18:30',
  },
  {
    id: 'seed-4',
    title: '멘토 · 수학 오답노트 정리',
    isFixed: true,
    status: 'TODO',
    subject: '수학',
    type: '학습',
    feedback: null,
    goal: '오답 15문항 재풀이',
    assigneeId: 'm1',
    assigneeName: '김솔',
    guideFileName: null,
    guideFileUrl: null,
    studySeconds: 0,
    createdAt: now - 1000 * 60 * 60 * 4,
    dueDate: dateOffsetISO(1),
    dueTime: '20:00',
  },
  {
    id: 'seed-5',
    title: '멘토 · 영어 지문 2개 풀이',
    isFixed: true,
    status: 'TODO',
    subject: '영어',
    type: '과제',
    feedback: null,
    goal: '지문당 20분',
    assigneeId: 'm2',
    assigneeName: '이하늘',
    guideFileName: 'reading-set-a.pdf',
    guideFileUrl: null,
    studySeconds: 0,
    createdAt: now - 1000 * 60 * 60 * 6,
    dueDate: dateOffsetISO(0),
    dueTime: '20:00',
  },
  {
    id: 'seed-6',
    title: '멘토 · 수학 개념 복습 4단원',
    isFixed: true,
    status: 'DONE',
    subject: '수학',
    type: '학습',
    feedback: '공식 적용은 정확합니다. 풀이 시간을 조금 더 줄여봅시다.',
    goal: null,
    assigneeId: 'm2',
    assigneeName: '이하늘',
    guideFileName: null,
    guideFileUrl: null,
    studySeconds: 50 * 60,
    createdAt: now - 1000 * 60 * 60 * 28,
    dueDate: dateOffsetISO(-2),
    dueTime: '19:30',
  },
  {
    id: 'seed-7',
    title: '내가 추가 · 영어 문법 오답 체크',
    isFixed: false,
    status: 'TODO',
    subject: '영어',
    type: '학습',
    feedback: null,
    goal: null,
    assigneeId: 'm2',
    assigneeName: '이하늘',
    guideFileName: null,
    guideFileUrl: null,
    studySeconds: 10 * 60,
    createdAt: now - 1000 * 60 * 60 * 3,
    dueDate: dateOffsetISO(2),
    dueTime: '22:00',
  },
  {
    id: 'seed-8',
    title: '멘토 · 국어 독서 지문 1세트',
    isFixed: true,
    status: 'DONE',
    subject: '국어',
    type: '과제',
    feedback: null,
    goal: '오답률 20% 이하',
    assigneeId: 'm2',
    assigneeName: '이하늘',
    guideFileName: 'korean-reading-pack.pdf',
    guideFileUrl: null,
    studySeconds: 45 * 60,
    createdAt: now - 1000 * 60 * 60 * 30,
    dueDate: dateOffsetISO(-1),
    dueTime: '17:30',
  },
  {
    id: 'seed-9',
    title: '멘토 · 수학 실전 모의 1회',
    isFixed: true,
    status: 'TODO',
    subject: '수학',
    type: '과제',
    feedback: null,
    goal: '시간 80분 내 풀이',
    assigneeId: 'm3',
    assigneeName: '박민재',
    guideFileName: 'mock-math-1.pdf',
    guideFileUrl: null,
    studySeconds: 0,
    createdAt: now - 1000 * 60 * 60 * 5,
    dueDate: dateOffsetISO(0),
    dueTime: '23:00',
  },
  {
    id: 'seed-10',
    title: '멘토 · 영어 듣기 3회분',
    isFixed: true,
    status: 'TODO',
    subject: '영어',
    type: '학습',
    feedback: null,
    goal: '오답 10개 이하',
    assigneeId: 'm3',
    assigneeName: '박민재',
    guideFileName: null,
    guideFileUrl: null,
    studySeconds: 0,
    createdAt: now - 1000 * 60 * 60 * 7,
    dueDate: dateOffsetISO(1),
    dueTime: '21:30',
  },
  {
    id: 'seed-11',
    title: '내가 추가 · 국어 문학 작품 정리',
    isFixed: false,
    status: 'DONE',
    subject: '국어',
    type: '학습',
    feedback: '표현 분석이 정확해요. 핵심 근거를 더 짧게 정리해보세요.',
    goal: null,
    assigneeId: 'm3',
    assigneeName: '박민재',
    guideFileName: null,
    guideFileUrl: null,
    studySeconds: 33 * 60,
    createdAt: now - 1000 * 60 * 60 * 16,
    dueDate: dateOffsetISO(-1),
    dueTime: '18:10',
  },
  {
    id: 'seed-12',
    title: '멘토 · 수학 빈출 유형 25문제',
    isFixed: true,
    status: 'TODO',
    subject: '수학',
    type: '과제',
    feedback: null,
    goal: '정답률 85%',
    assigneeId: 'm3',
    assigneeName: '박민재',
    guideFileName: null,
    guideFileUrl: null,
    studySeconds: 0,
    createdAt: now - 1000 * 60 * 60 * 1,
    dueDate: dateOffsetISO(3),
    dueTime: '22:40',
  },
  {
    id: 'seed-13',
    title: '멘토 · 국어 서술형 첨삭 과제',
    isFixed: true,
    status: 'TODO',
    subject: '국어',
    type: '과제',
    feedback: null,
    goal: '문단 구성 3단계 적용',
    assigneeId: 'm4',
    assigneeName: '정다온',
    guideFileName: 'korean-writing-guide.pdf',
    guideFileUrl: null,
    studySeconds: 0,
    createdAt: now - 1000 * 60 * 60 * 12,
    dueDate: dateOffsetISO(2),
    dueTime: '19:40',
  },
  {
    id: 'seed-14',
    title: '멘토 · 영어 받아쓰기 40문장',
    isFixed: true,
    status: 'DONE',
    subject: '영어',
    type: '과제',
    feedback: null,
    goal: null,
    assigneeId: 'm4',
    assigneeName: '정다온',
    guideFileName: null,
    guideFileUrl: null,
    studySeconds: 28 * 60,
    createdAt: now - 1000 * 60 * 60 * 26,
    dueDate: dateOffsetISO(-1),
    dueTime: '20:20',
  },
  {
    id: 'seed-15',
    title: '멘토 · 수학 킬러 15문항',
    isFixed: true,
    status: 'TODO',
    subject: '수학',
    type: '과제',
    feedback: null,
    goal: '고난도 풀이 연습',
    assigneeId: 'm5',
    assigneeName: '최윤서',
    guideFileName: 'killer-set.pdf',
    guideFileUrl: null,
    studySeconds: 0,
    createdAt: now - 1000 * 60 * 60 * 11,
    dueDate: dateOffsetISO(1),
    dueTime: '22:20',
  },
  {
    id: 'seed-16',
    title: '내가 추가 · 영어 쉐도잉 30분',
    isFixed: false,
    status: 'DONE',
    subject: '영어',
    type: '학습',
    feedback: null,
    goal: null,
    assigneeId: 'm5',
    assigneeName: '최윤서',
    guideFileName: null,
    guideFileUrl: null,
    studySeconds: 30 * 60,
    createdAt: now - 1000 * 60 * 60 * 15,
    dueDate: dateOffsetISO(0),
    dueTime: '17:40',
  },
];

type StoredTodo = Todo & { studyMinutes?: number; studySeconds?: number };

function normalizeTodo(todo: StoredTodo): Todo {
  const studySeconds = Number.isFinite(todo.studySeconds)
    ? Math.max(0, Math.floor(todo.studySeconds as number))
    : Number.isFinite(todo.studyMinutes)
    ? Math.max(0, Math.floor((todo.studyMinutes as number) * 60))
    : 0;
  const { studyMinutes, ...rest } = todo;
  return { ...rest, studySeconds };
}

function loadFromStorage(): Todo[] | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredTodo[];
    return Array.isArray(parsed) ? parsed.map(normalizeTodo) : null;
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
  const defaultAssigneeId = input.assigneeId ?? 'm1';
  const newTodo: Todo = {
    id: uid(),
    title: input.title,
    isFixed: input.isFixed ?? false,
    status: 'TODO',
    subject: input.subject,
    type: input.type,
    feedback: null,
    goal: input.goal ?? null,
    assigneeId: defaultAssigneeId,
    assigneeName: input.assigneeName ?? null,
    guideFileName: input.guideFileName ?? null,
    guideFileUrl: input.guideFileUrl ?? null,
    studySeconds: 0,
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
