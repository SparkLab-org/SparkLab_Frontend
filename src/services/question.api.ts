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

export type CreateQuestionReplyInput = {
  questionId: string | number;
  content: string;
};

type QuestionApiSubject = 'KOREAN' | 'ENGLISH' | 'MATH' | string;
type QuestionApiStatus = 'PENDING' | 'ANSWERED' | 'COMPLETED' | string;

type QuestionApiItem = {
  qnaId?: number;
  questionId?: number;
  menteeId?: number;
  title?: string;
  subject?: QuestionApiSubject;
  status?: QuestionApiStatus;
  statusDisplayName?: string;
  content?: string;
  attachmentUrl?: string | null;
  answer?: string | null;
  createTime?: string;
  createdAt?: string;
  updateTime?: string;
  updatedAt?: string;
  replies?: Array<{
    qnaReplyId: number;
    mentorId?: number;
    content: string;
    createTime?: string;
    updateTime?: string;
  }>;
};

type CreateQuestionApiRequest = {
  title: string;
  subject: QuestionApiSubject;
  content: string;
  attachmentUrl?: string | null;
};

type UpdateQuestionApiRequest = Partial<CreateQuestionApiRequest>;
type CreateQuestionReplyApiRequest = {
  content: string;
};

export type QuestionReply = {
  replyId: number;
  mentorId?: number;
  content: string;
  createdAt?: number;
  updatedAt?: number;
};

const USE_MOCK = process.env.NEXT_PUBLIC_QUESTION_API_MODE !== 'backend';
const QUESTION_BASE_PATH = '/questions';

const SUBJECT_FROM_API: Record<string, QuestionSubject> = {
  KOREAN: '국어',
  ENGLISH: '영어',
  MATH: '수학',
  ALL: '전체',
};

const SUBJECT_TO_API: Record<QuestionSubject, QuestionApiSubject> = {
  국어: 'KOREAN',
  영어: 'ENGLISH',
  수학: 'MATH',
  전체: 'ALL',
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
  const replyText =
    item.replies && item.replies.length > 0
      ? item.replies[item.replies.length - 1]?.content
      : undefined;
  const statusLabel =
    item.statusDisplayName || item.status || STATUS_FROM_API[item.status ?? ''] || '답변중';
  return {
    id: String(item.qnaId ?? item.questionId ?? ''),
    title: item.title ?? '',
    subject: toQuestionSubject(item.subject),
    status: toQuestionStatus(statusLabel),
    content: item.content ?? '',
    answer: replyText ?? item.answer ?? null,
    menteeId: item.menteeId,
    createdAt: toEpochMillis(
      item.createTime ?? item.createdAt ?? item.updateTime ?? item.updatedAt ?? null
    ),
    updatedAt: item.updateTime
      ? toEpochMillis(item.updateTime)
      : item.updatedAt
        ? toEpochMillis(item.updatedAt)
        : undefined,
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
    attachmentUrl: null,
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
  if (patch.content) payload.content = patch.content;

  if (Object.keys(payload).length === 0) {
    return null;
  }

  const updated = await apiFetch<QuestionApiItem>(`${QUESTION_BASE_PATH}/${questionId}`, {
    method: 'PUT',
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

export async function createQuestionReply(
  input: CreateQuestionReplyInput
): Promise<QuestionReply> {
  if (USE_MOCK) return mockApi.createQuestionReply(input.questionId, input.content);

  const payload: CreateQuestionReplyApiRequest = {
    content: input.content,
  };

  const reply = await apiFetch<{
    qnaReplyId: number;
    mentorId?: number;
    content: string;
    createTime?: string;
    updateTime?: string;
  }>(`${QUESTION_BASE_PATH}/${input.questionId}/replies`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const toMillis = (value?: string) => {
    if (!value) return undefined;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  return {
    replyId: reply.qnaReplyId,
    mentorId: reply.mentorId,
    content: reply.content,
    createdAt: toMillis(reply.createTime),
    updatedAt: toMillis(reply.updateTime),
  };
}
