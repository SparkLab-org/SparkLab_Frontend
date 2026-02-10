import type { Question, QuestionSubject } from '@/src/lib/types/question';

export type CreateQuestionInput = {
  title: string;
  subject: QuestionSubject;
  content: string;
};

export type UpdateQuestionInput = Partial<
  Pick<Question, 'title' | 'subject' | 'status' | 'content' | 'answer' | 'updatedAt'>
>;

const STORAGE_KEY = 'mock-questions';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const now = Date.now();

const seedQuestions: Question[] = [
  {
    id: 'q1',
    title: '벡터 내적이 왜 각도랑 관련이 있나요?',
    subject: '수학',
    status: '답변중',
    content:
      '내적 공식이 cos이 들어가는지 이해가 잘 안돼요. 벡터를 곱할 때 의미가 뭔지, 각도와의 연결이 궁금해요.',
    answer: null,
    menteeId: 'm1',
    createdAt: now - 1000 * 60 * 60 * 3,
  },
  {
    id: 'q2',
    title: '영어 지문 해석이 너무 오래 걸려요.',
    subject: '영어',
    status: '완료',
    content:
      '문장 구조를 파악하는 데 시간이 많이 걸립니다. 시간을 줄일 수 있는 팁이 있을까요?',
    answer:
      '핵심 동사와 주어를 먼저 표시하고, 수식어는 뒤에 정리해보세요. 매일 2~3문장씩 구조 분석 연습을 꾸준히 하면 속도가 확실히 올라갑니다.',
    menteeId: 'm2',
    createdAt: now - 1000 * 60 * 60 * 12,
  },
  {
    id: 'q3',
    title: '국어 요약을 어떻게 정리하면 좋을까요?',
    subject: '국어',
    status: '답변중',
    content:
      '요약을 해도 시험에 필요한 포인트가 잘 안 잡히는 것 같아요. 어떤 기준으로 정리해야 할까요?',
    answer: null,
    menteeId: 'm3',
    createdAt: now - 1000 * 60 * 60 * 24,
  },
];

function loadFromStorage(): Question[] | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Question[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveToStorage(questions: Question[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
}

let mockQuestions: Question[] = seedQuestions;

export function getQuestionSnapshot(): Question[] {
  return mockQuestions;
}

export async function listQuestions(): Promise<Question[]> {
  const stored = loadFromStorage();
  if (stored) {
    mockQuestions = stored;
  }
  return mockQuestions;
}

export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  const newQuestion: Question = {
    id: uid(),
    title: input.title,
    subject: input.subject,
    status: '답변중',
    content: input.content,
    answer: null,
    createdAt: Date.now(),
  };

  mockQuestions = [newQuestion, ...mockQuestions];
  saveToStorage(mockQuestions);
  return newQuestion;
}

export async function updateQuestion(id: string, patch: UpdateQuestionInput): Promise<Question | null> {
  const idx = mockQuestions.findIndex((q) => q.id === id);
  if (idx < 0) return null;
  const updated = { ...mockQuestions[idx], ...patch, updatedAt: Date.now() };
  mockQuestions = [...mockQuestions.slice(0, idx), updated, ...mockQuestions.slice(idx + 1)];
  saveToStorage(mockQuestions);
  return updated;
}

export async function deleteQuestion(id: string): Promise<void> {
  mockQuestions = mockQuestions.filter((q) => q.id !== id);
  saveToStorage(mockQuestions);
}

export async function createQuestionReply(
  questionId: string | number,
  content: string
): Promise<{ replyId: number; content: string; createdAt: number }> {
  const id = String(questionId);
  const idx = mockQuestions.findIndex((q) => q.id === id);
  if (idx < 0) {
    throw new Error('Question not found');
  }
  const updated = {
    ...mockQuestions[idx],
    answer: content,
    status: '완료' as const,
    updatedAt: Date.now(),
  };
  mockQuestions = [...mockQuestions.slice(0, idx), updated, ...mockQuestions.slice(idx + 1)];
  saveToStorage(mockQuestions);
  return { replyId: Date.now(), content, createdAt: Date.now() };
}
