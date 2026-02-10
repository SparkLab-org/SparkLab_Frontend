import { apiFetch } from '@/src/services/appClient';
import type { Feedback, FeedbackDraftRequest, FeedbackDraftResponse } from '@/src/lib/types/feedback';

type FeedbackApiItem = {
  feedbackId: number;
  mentorId?: number;
  menteeId?: number;
  todoItemId?: number;
  todoTitle?: string;
  subject?: 'KOREAN' | 'ENGLISH' | 'MATH' | 'ALL';
  title?: string;
  targetDate?: string;
  isImportant?: boolean;
  isBookmarked?: boolean;
  summary?: string;
  content?: string;
  createTime?: string;
  updateTime?: string;
};

type FeedbackCreateRequest = {
  mentorId: number;
  menteeId: number;
  todoItemId?: number;
  title?: string;
  targetDate?: string;
  isImportant?: boolean;
  summary?: string;
  content: string;
};

type FeedbackUpdateRequest = {
  todoItemId?: number;
  title?: string;
  targetDate?: string;
  isImportant?: boolean;
  summary?: string;
  content?: string;
};

const FEEDBACK_BASE_PATH = '/feedbacks';

function normalizeTargetDate(value?: string) {
  if (!value) return undefined;
  if (value.includes('T')) return value;
  return `${value}T00:00:00`;
}

function mapFeedbackFromApi(item: FeedbackApiItem): Feedback {
  return {
    id: String(item.feedbackId),
    mentorId: item.mentorId,
    menteeId: item.menteeId,
    todoItemId: item.todoItemId,
    todoTitle: item.todoTitle,
    subject: item.subject,
    title: item.title,
    targetDate: item.targetDate,
    isImportant: item.isImportant,
    isBookmarked: item.isBookmarked,
    summary: item.summary,
    content: item.content,
    createdAt: item.createTime,
    updatedAt: item.updateTime,
  };
}

export async function listFeedbacks(params: {
  todoItemId?: number;
  isImportant?: boolean;
  targetDate?: string;
  subject?: 'KOREAN' | 'ENGLISH' | 'MATH' | 'ALL';
  sort?: string;
} = {}): Promise<Feedback[]> {
  const search = new URLSearchParams();
  if (typeof params.todoItemId === 'number') search.set('todoItemId', String(params.todoItemId));
  if (typeof params.isImportant === 'boolean') search.set('isImportant', String(params.isImportant));
  if (params.targetDate) {
    const normalized = normalizeTargetDate(params.targetDate);
    if (normalized) search.set('targetDate', normalized);
  }
  if (params.subject) search.set('subject', params.subject);
  if (params.sort) search.set('sort', params.sort);
  const query = search.toString();
  try {
    const items = await apiFetch<FeedbackApiItem[]>(
      `${FEEDBACK_BASE_PATH}${query ? `?${query}` : ''}`
    );
    const hasFilter =
      typeof params.todoItemId === 'number' ||
      typeof params.isImportant === 'boolean' ||
      Boolean(params.targetDate) ||
      Boolean(params.subject) ||
      Boolean(params.sort);
    if (hasFilter && items.length === 0) {
      throw new Error('Empty filtered feedback response');
    }
    return items.map(mapFeedbackFromApi);
  } catch (error) {
    if (!query) throw error;
    const items = await apiFetch<FeedbackApiItem[]>(FEEDBACK_BASE_PATH);
    const dateKey = params.targetDate
      ? normalizeTargetDate(params.targetDate)?.slice(0, 10)
      : undefined;
    let filtered = items.slice();
    if (typeof params.todoItemId === 'number') {
      filtered = filtered.filter((item) => item.todoItemId === params.todoItemId);
    }
    if (typeof params.isImportant === 'boolean') {
      filtered = filtered.filter(
        (item) => Boolean(item.isImportant) === params.isImportant
      );
    }
    if (params.subject) {
      filtered = filtered.filter((item) => item.subject === params.subject);
    }
    if (dateKey) {
      filtered = filtered.filter((item) => item.targetDate?.slice(0, 10) === dateKey);
    }
    if (params.sort === 'latest') {
      filtered.sort((a, b) => {
        const aTime = Date.parse(a.updateTime ?? a.createTime ?? '') || 0;
        const bTime = Date.parse(b.updateTime ?? b.createTime ?? '') || 0;
        return bTime - aTime;
      });
    }
    return filtered.map(mapFeedbackFromApi);
  }
}

export async function getFeedback(feedbackId: number | string): Promise<Feedback> {
  const item = await apiFetch<FeedbackApiItem>(`${FEEDBACK_BASE_PATH}/${feedbackId}`);
  return mapFeedbackFromApi(item);
}

export async function createFeedback(input: FeedbackCreateRequest): Promise<Feedback> {
  const payload = {
    ...input,
    targetDate: normalizeTargetDate(input.targetDate),
  };
  const created = await apiFetch<FeedbackApiItem>(FEEDBACK_BASE_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapFeedbackFromApi(created);
}

export async function updateFeedback(
  feedbackId: number | string,
  patch: FeedbackUpdateRequest
): Promise<Feedback> {
  const payload = {
    ...patch,
    targetDate: normalizeTargetDate(patch.targetDate),
  };
  const updated = await apiFetch<FeedbackApiItem>(`${FEEDBACK_BASE_PATH}/${feedbackId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
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

type FeedbackCommentUpdateRequest = {
  type?: FeedbackCommentType;
  content?: string;
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

export async function updateFeedbackComment(
  feedbackId: number | string,
  commentId: number | string,
  input: FeedbackCommentUpdateRequest
): Promise<FeedbackCommentResponse> {
  return apiFetch<FeedbackCommentResponse>(
    `${FEEDBACK_BASE_PATH}/${feedbackId}/comments/${commentId}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    }
  );
}

export async function deleteFeedbackComment(
  feedbackId: number | string,
  commentId: number | string
): Promise<void> {
  await apiFetch(`${FEEDBACK_BASE_PATH}/${feedbackId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}

export async function addFeedbackBookmark(feedbackId: number | string): Promise<void> {
  await apiFetch(`${FEEDBACK_BASE_PATH}/${feedbackId}/bookmark`, { method: 'POST' });
}

export async function removeFeedbackBookmark(feedbackId: number | string): Promise<void> {
  await apiFetch(`${FEEDBACK_BASE_PATH}/${feedbackId}/bookmark`, { method: 'DELETE' });
}

export async function updateFeedbackImportant(
  feedbackId: number | string,
  isImportant: boolean
): Promise<Feedback> {
  const updated = await apiFetch<FeedbackApiItem>(`${FEEDBACK_BASE_PATH}/${feedbackId}/important`, {
    method: 'PATCH',
    body: JSON.stringify({ isImportant }),
  });
  return mapFeedbackFromApi(updated);
}

export type TodoFeedbackStatusResponse = {
  todoItemId: number;
  title: string;
  subject: 'KOREAN' | 'ENGLISH' | 'MATH' | 'ALL';
  type?: string;
  targetDate?: string;
  hasFeedback: boolean;
};

export async function listTodoFeedbackStatus(params: {
  menteeId: number;
  planDate: string;
}): Promise<TodoFeedbackStatusResponse[]> {
  const search = new URLSearchParams();
  search.set('menteeId', String(params.menteeId));
  search.set('planDate', params.planDate);
  return apiFetch<TodoFeedbackStatusResponse[]>(
    `${FEEDBACK_BASE_PATH}/todo-status?${search.toString()}`
  );
}
