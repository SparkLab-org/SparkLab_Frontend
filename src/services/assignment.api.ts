import { apiFetch } from '@/src/services/appClient';

export type AssignmentSubmissionResponse = {
  submissionId: number;
  assignmentId: number;
  menteeId: number;
  imageUrl?: string;
  comment?: string;
  status?: string;
  createTime?: string;
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

function normalizeBatchResponse(
  response: AssignmentSubmissionBatchResponse | AssignmentSubmissionResponse
): AssignmentSubmissionBatchResponse {
  if ('submissions' in response) return response;
  return { submissions: [response] };
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

export async function updateAssignmentSubmission(
  assignmentId: number,
  submissionId: number,
  file?: File,
  comment?: string
): Promise<AssignmentSubmissionResponse> {
  const formData = new FormData();
  if (file) formData.append('file', file);

  const url = buildQuery(`/assignments/${assignmentId}/submissions/${submissionId}`, { comment });
  return apiFetch<AssignmentSubmissionResponse>(url, {
    method: 'PUT',
    body: formData,
  });
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
  return apiFetch<AssignmentSubmissionResponse>(
    `/assignments/${assignmentId}/submissions/${submissionId}/comment`,
    {
      method: 'DELETE',
    }
  );
}
