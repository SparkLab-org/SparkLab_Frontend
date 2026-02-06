import { apiFetch } from '@/src/services/appClient';
import type { Question, QuestionStatus, QuestionSubject } from '@/src/lib/types/question';
import * as mockApi from '@/src/services/question.mock';

export type CreateQuestionInput = {
  title: string;
  subject: QuestionSubject;
  content: string;
};

export type UpdateQuestionInput = Partial<
  Pick<Question, 'title' | 'subject' | 'status' | 'content' | 'answer'>
>;

type QuestionApiSubject = 'KOREAN' | 'ENGLISH' | 'MATH' | string;
type QuestionApiStatus = 'PENDING' | 'ANSWERED' | 'COMPLETED' | string;

type QuestionApiItem = {
  questionId: number;
  title: string;
  subject: QuestionApiSubject;
  status?: QuestionApiStatus;
  content: string;
  answer?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type CreateQuestionApiRequest = {
  title: string;
  subject: QuestionApiSubject;
  content: string;
};

type UpdateQuestionApiRequest = Partial<CreateQuestionApiRequest> & {
  status?: QuestionApiStatus;
  answer?: string | null;
};

const USE_MOCK = process.env.NEXT_PUBLIC_QUESTION_API_MODE !== 'backend';
const QUESTION_BASE_PATH = '/domain/questions';

const SUBJECT_FROM_API: Record<string, QuestionSubject> = {
  KOREAN: '국어',
  ENGLISH: '영어',
  MATH: '수학',
};

const SUBJECT_TO_API: Record<QuestionSubject, QuestionApiSubject> = {
  국어: 'KOREAN',
  영어: 'ENGLISH',
  수학: 'MATH',
};

const STATUS_FROM_API: Record<string, QuestionStatus> = {
  PENDING: '답변중',
  ANSWERED: '완료',
  COMPLETED: '완료',
  답변중: '답변중',
  완료: '완료',
};

const STATUS_TO_API: Record<QuestionStatus, QuestionApiStatus> = {
  답변중: 'PENDING',
  완료: 'ANSWERED',
};

function toQuestionSubject(subject?: string): QuestionSubject {
  return SUBJECT_FROM_API[subject ?? ''] ?? '수학';
}

function toApiSubject(subject: QuestionSubject): QuestionApiSubject {
  return SUBJECT_TO_API[subject] ?? 'MATH';
}

function toQuestionStatus(status?: string): QuestionStatus {
  return STATUS_FROM_API[status ?? ''] ?? '답변중';
}

function toApiStatus(status: QuestionStatus): QuestionApiStatus {
  return STATUS_TO_API[status] ?? 'PENDING';
}

function toEpochMillis(iso?: string | null): number {
  if (!iso) return Date.now();
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function mapQuestionFromApi(item: QuestionApiItem): Question {
  return {
    id: String(item.questionId),
    title: item.title ?? '',
    subject: toQuestionSubject(item.subject),
    status: toQuestionStatus(item.status),
    content: item.content ?? '',
    answer: item.answer ?? null,
    createdAt: toEpochMillis(item.createdAt ?? item.updatedAt ?? null),
    updatedAt: item.updatedAt ? toEpochMillis(item.updatedAt) : undefined,
  };
}

export function getQuestionSnapshot(): Question[] {
  return USE_MOCK ? mockApi.getQuestionSnapshot() : [];
}

export async function listQuestions(): Promise<Question[]> {
  if (USE_MOCK) return mockApi.listQuestions();
  const items = await apiFetch<QuestionApiItem[]>(QUESTION_BASE_PATH);
  return items.map(mapQuestionFromApi);
}

export async function getQuestion(questionId: string | number): Promise<Question> {
  if (USE_MOCK) {
    const items = await mockApi.listQuestions();
    const found = items.find((q) => q.id === String(questionId));
    if (!found) throw new Error('Question not found');
    return found;
  }

  const item = await apiFetch<QuestionApiItem>(`${QUESTION_BASE_PATH}/${questionId}`);
  return mapQuestionFromApi(item);
}

export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  if (USE_MOCK) return mockApi.createQuestion(input);

  const payload: CreateQuestionApiRequest = {
    title: input.title,
    subject: toApiSubject(input.subject),
    content: input.content,
  };

  const created = await apiFetch<QuestionApiItem>(QUESTION_BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return mapQuestionFromApi(created);
}

export async function updateQuestion(
  questionId: string,
  patch: UpdateQuestionInput
): Promise<Question | null> {
  if (USE_MOCK) return mockApi.updateQuestion(questionId, patch);

  const payload: UpdateQuestionApiRequest = {};
  if (patch.title) payload.title = patch.title;
  if (patch.subject) payload.subject = toApiSubject(patch.subject);
  if (patch.content) payload.content = patch.content;
  if (patch.status) payload.status = toApiStatus(patch.status);
  if (patch.answer !== undefined) payload.answer = patch.answer;

  if (Object.keys(payload).length === 0) {
    return null;
  }

  const updated = await apiFetch<QuestionApiItem>(`${QUESTION_BASE_PATH}/${questionId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return mapQuestionFromApi(updated);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  if (USE_MOCK) return mockApi.deleteQuestion(questionId);

  await apiFetch(`${QUESTION_BASE_PATH}/${questionId}`, {
    method: 'DELETE',
  });
}
