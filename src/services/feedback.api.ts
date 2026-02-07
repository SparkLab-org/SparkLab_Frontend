import { apiFetch } from '@/src/services/appClient';
import type { Feedback, FeedbackDraftRequest, FeedbackDraftResponse } from '@/src/lib/types/feedback';

type FeedbackApiItem = {
  feedbackId: number;
  mentorId?: number;
  menteeId?: number;
  todoItemId?: number;
  targetDate?: string;
  isImportant?: boolean;
  summary?: string;
  content?: string;
  createTime?: string;
  updateTime?: string;
};

type FeedbackCreateRequest = {
  mentorId: number;
  menteeId: number;
  todoItemId?: number;
  targetDate?: string;
  isImportant?: boolean;
  summary: string;
  content: string;
};

type FeedbackUpdateRequest = {
  todoItemId?: number;
  targetDate?: string;
  isImportant?: boolean;
  summary?: string;
  content?: string;
};

const FEEDBACK_BASE_PATH = '/feedbacks';

function mapFeedbackFromApi(item: FeedbackApiItem): Feedback {
  return {
    id: String(item.feedbackId),
    mentorId: item.mentorId,
    menteeId: item.menteeId,
    todoItemId: item.todoItemId,
    targetDate: item.targetDate,
    isImportant: item.isImportant,
    summary: item.summary,
    content: item.content,
    createdAt: item.createTime,
    updatedAt: item.updateTime,
  };
}

export async function listFeedbacks(params: {
  menteeId?: number;
  mentorId?: number;
  todoItemId?: number;
} = {}): Promise<Feedback[]> {
  const search = new URLSearchParams();
  if (typeof params.menteeId === 'number') search.set('menteeId', String(params.menteeId));
  if (typeof params.mentorId === 'number') search.set('mentorId', String(params.mentorId));
  if (typeof params.todoItemId === 'number') search.set('todoItemId', String(params.todoItemId));
  const query = search.toString();
  const items = await apiFetch<FeedbackApiItem[]>(
    `${FEEDBACK_BASE_PATH}${query ? `?${query}` : ''}`
  );
  return items.map(mapFeedbackFromApi);
}

export async function getFeedback(feedbackId: number | string): Promise<Feedback> {
  const item = await apiFetch<FeedbackApiItem>(`${FEEDBACK_BASE_PATH}/${feedbackId}`);
  return mapFeedbackFromApi(item);
}

export async function createFeedback(input: FeedbackCreateRequest): Promise<Feedback> {
  const created = await apiFetch<FeedbackApiItem>(FEEDBACK_BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return mapFeedbackFromApi(created);
}

export async function updateFeedback(
  feedbackId: number | string,
  patch: FeedbackUpdateRequest
): Promise<Feedback> {
  const updated = await apiFetch<FeedbackApiItem>(`${FEEDBACK_BASE_PATH}/${feedbackId}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
  return mapFeedbackFromApi(updated);
}

export async function deleteFeedback(feedbackId: number | string): Promise<void> {
  await apiFetch(`${FEEDBACK_BASE_PATH}/${feedbackId}`, { method: 'DELETE' });
}

export async function generateFeedbackDraft(
  input: FeedbackDraftRequest
): Promise<FeedbackDraftResponse> {
  return apiFetch<FeedbackDraftResponse>(`${FEEDBACK_BASE_PATH}/drafts`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

type FeedbackCommentType = 'MENTEE_QUESTION' | 'MENTOR_REPLY';

type FeedbackCommentCreateRequest = {
  type: FeedbackCommentType;
  content: string;
};

type FeedbackCommentResponse = {
  feedbackCommentId: number;
  feedbackId: number;
  type: FeedbackCommentType;
  content: string;
  createTime?: string;
  updateTime?: string;
};

export async function listFeedbackComments(
  feedbackId: number | string
): Promise<FeedbackCommentResponse[]> {
  return apiFetch<FeedbackCommentResponse[]>(`${FEEDBACK_BASE_PATH}/${feedbackId}/comments`);
}

export async function createFeedbackComment(
  feedbackId: number | string,
  input: FeedbackCommentCreateRequest
): Promise<FeedbackCommentResponse> {
  return apiFetch<FeedbackCommentResponse>(`${FEEDBACK_BASE_PATH}/${feedbackId}/comments`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
