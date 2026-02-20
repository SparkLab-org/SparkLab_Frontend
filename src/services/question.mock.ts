import type { Question, QuestionSubject } from '@/src/lib/types/question';

export type CreateQuestionInput = {
  title: string;
  subject: QuestionSubject;
  content: string;
};

export type UpdateQuestionInput = Partial<
  Pick<Question, 'title' | 'subject' | 'status' | 'content' | 'answer' | 'updatedAt'>
>;

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const STORAGE_KEY = DEMO_MODE ? 'mock-questions-demo-v2' : 'mock-questions';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const now = Date.now();
const hour = 1000 * 60 * 60;

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
    createdAt: now - hour * 3,
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
    createdAt: now - hour * 12,
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
    createdAt: now - hour * 24,
  },
  {
    id: 'q4',
    title: '수학 오답노트는 어떤 형식으로 쓰면 좋나요?',
    subject: '수학',
    status: '완료',
    content:
      '틀린 이유를 자꾸 까먹어서 같은 실수를 반복해요. 오답노트를 어떤 순서로 정리해야 효과적일까요?',
    answer:
      '문항 번호, 오답 원인, 정답 접근 순서, 다음 체크 포인트 4칸으로 고정해 보세요.',
    menteeId: 'm1',
    createdAt: now - hour * 30,
  },
  {
    id: 'q5',
    title: '영어 듣기에서 숫자 표현이 잘 안 들려요.',
    subject: '영어',
    status: '답변중',
    content:
      '연음이 빠르게 나오면 숫자를 놓칩니다. 받아쓰기 훈련을 어떻게 하면 좋을까요?',
    answer: null,
    menteeId: 'm4',
    createdAt: now - hour * 20,
  },
  {
    id: 'q6',
    title: '국어 문학에서 화자 태도 구분이 헷갈립니다.',
    subject: '국어',
    status: '완료',
    content:
      '감정은 보이는데 선지로 고르면 자꾸 틀려요. 태도 판단 기준이 있을까요?',
    answer:
      '어휘의 강도, 종결 어미, 반복 표현을 먼저 체크하고 근거 문장을 표시해 보세요.',
    menteeId: 'm2',
    createdAt: now - hour * 36,
  },
  {
    id: 'q7',
    title: '수학 확률 단원에서 조건부 확률이 자꾸 헷갈려요.',
    subject: '수학',
    status: '답변중',
    content:
      '표를 그려도 분모/분자를 자꾸 바꿔 쓰게 됩니다. 실수 줄이는 방법이 있을까요?',
    answer: null,
    menteeId: 'm3',
    createdAt: now - hour * 8,
  },
  {
    id: 'q8',
    title: '영어 서술형에서 문장 연결이 부자연스럽습니다.',
    subject: '영어',
    status: '완료',
    content:
      '문법은 맞는데 문장 흐름이 어색하다고 피드백을 받았습니다. 연결 표현을 어떻게 연습하면 좋을까요?',
    answer:
      '접속부사 10개를 정해서 템플릿 문장으로 반복 연습하면 연결이 훨씬 자연스러워집니다.',
    menteeId: 'm5',
    createdAt: now - hour * 14,
  },
  {
    id: 'q9',
    title: '국어 비문학에서 근거 찾는 시간이 너무 길어요.',
    subject: '국어',
    status: '답변중',
    content:
      '선지마다 다시 지문을 읽다 보니 시간이 오래 걸립니다. 빠르게 찾는 요령이 필요해요.',
    answer: null,
    menteeId: 'm4',
    createdAt: now - hour * 5,
  },
  {
    id: 'q10',
    title: '수학 계산 실수를 줄이려면 어떤 루틴이 좋나요?',
    subject: '수학',
    status: '완료',
    content:
      '풀이 방향은 맞는데 마지막 계산에서 실수합니다. 시험장에서 적용 가능한 체크 루틴이 있나요?',
    answer:
      '중간식을 한 줄 비우고, 부호 체크, 대입 검산 3단계를 문제당 10초씩 루틴화해 보세요.',
    menteeId: 'm5',
    createdAt: now - hour * 18,
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
