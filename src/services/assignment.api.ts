import { apiFetch } from '@/src/services/appClient';

export type AssignmentSubmissionResponse = {
  submissionId: number;
  assignmentId: number;
  menteeId: number;
  imageUrl?: string;
  fileUrl?: string;
  attachmentUrl?: string;
  comment?: string;
  status?: string;
  createTime?: string;
};

export type AssignmentResponse = {
  assignmentId: number;
  todoItemId?: number;
  menteeId?: number;
  materialTitle?: string;
  title?: string;
  subject?: 'KOREAN' | 'ENGLISH' | 'MATH' | 'ALL';
  targetDate?: string;
  createTime?: string;
  submitted?: boolean;
  latestSubmissionId?: number;
};

export type MenteeAssignmentsResponse = {
  menteeId?: number;
  accountId?: string;
  activeLevel?: 'NORMAL' | 'WARNING' | 'DANGER';
  assignments?: AssignmentResponse[];
};

export type AssignmentSubmissionBatchResponse = {
  submissions: AssignmentSubmissionResponse[];
};

function buildQuery(base: string, params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

function resolveStoredRole(): 'MENTOR' | 'MENTEE' | null {
  if (typeof window === 'undefined') return null;
  const path = window.location?.pathname ?? '';
  if (path.startsWith('/mentor')) return 'MENTOR';
  if (
    path.startsWith('/planner') ||
    path.startsWith('/assignments') ||
    path.startsWith('/my') ||
    path.startsWith('/feedback') ||
    path.startsWith('/questions')
  )
    return 'MENTEE';
  const stored = window.localStorage.getItem('role');
  if (!stored) return null;
  const normalized = stored.toUpperCase();
  if (normalized === 'MENTOR') return 'MENTOR';
  if (normalized === 'MENTEE') return 'MENTEE';
  return null;
}

function normalizeBatchResponse(
  response:
    | AssignmentSubmissionBatchResponse
    | AssignmentSubmissionResponse
    | AssignmentSubmissionResponse[]
): AssignmentSubmissionBatchResponse {
  const normalizeSubmission = (item: AssignmentSubmissionResponse) => {
    const fallbackUrl =
      item.imageUrl ?? item.fileUrl ?? item.attachmentUrl;
    return fallbackUrl ? { ...item, imageUrl: fallbackUrl } : item;
  };
  if (Array.isArray(response)) {
    return { submissions: response.map(normalizeSubmission) };
  }
  if ('submissions' in response) {
    return {
      submissions: (response.submissions ?? []).map(normalizeSubmission),
    };
  }
  return { submissions: [normalizeSubmission(response)] };
}

export async function submitAssignment(
  assignmentId: number,
  files: File | File[],
  comment?: string
): Promise<AssignmentSubmissionBatchResponse> {
  const fileList = Array.isArray(files) ? files : [files];
  if (fileList.length === 0) {
    throw new Error('file is required');
  }
  const formData = new FormData();
  fileList.forEach((file) => {
    formData.append('files', file);
  });

  const url = buildQuery(`/assignments/${assignmentId}/submissions`, { comment });
  const response = await apiFetch<AssignmentSubmissionBatchResponse | AssignmentSubmissionResponse>(
    url,
    {
      method: 'POST',
      body: formData,
    }
  );
  return normalizeBatchResponse(response);
}

export async function listAssignmentSubmissions(
  assignmentId: number
): Promise<AssignmentSubmissionBatchResponse> {
  const response = await apiFetch<
    AssignmentSubmissionBatchResponse | AssignmentSubmissionResponse | AssignmentSubmissionResponse[]
  >(`/assignments/${assignmentId}/submissions`);
  return normalizeBatchResponse(response);
}

export async function listAssignments(
  menteeId?: number
): Promise<MenteeAssignmentsResponse[]> {
  const role = resolveStoredRole();
  const shouldSendMenteeId = role === 'MENTOR' && typeof menteeId === 'number';
  const query = shouldSendMenteeId ? `?menteeId=${menteeId}` : '';
  const response = await apiFetch<MenteeAssignmentsResponse[] | MenteeAssignmentsResponse>(
    `/assignments${query}`
  );
  return Array.isArray(response) ? response : [response];
}

export async function updateAssignmentSubmission(
  assignmentId: number,
  submissionId: number,
  file?: File,
  comment?: string
): Promise<AssignmentSubmissionResponse> {
  const formData = new FormData();
  if (file) formData.append('file', file);

  const url = buildQuery(`/assignments/${assignmentId}/submissions/${submissionId}`, { comment });
  const response = await apiFetch<AssignmentSubmissionResponse>(url, {
    method: 'PUT',
    body: formData,
  });
  return normalizeBatchResponse(response).submissions[0] ?? response;
}

export async function deleteAssignmentSubmission(
  assignmentId: number,
  submissionId: number
): Promise<void> {
  await apiFetch(`/assignments/${assignmentId}/submissions/${submissionId}`, {
    method: 'DELETE',
  });
}

export async function deleteAssignmentSubmissionComment(
  assignmentId: number,
  submissionId: number
): Promise<AssignmentSubmissionResponse> {
  const response = await apiFetch<AssignmentSubmissionResponse>(
    `/assignments/${assignmentId}/submissions/${submissionId}/comment`,
    {
      method: 'DELETE',
    }
  );
  return normalizeBatchResponse(response).submissions[0] ?? response;
}
