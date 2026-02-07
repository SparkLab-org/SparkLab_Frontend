import { apiFetch } from '@/src/services/appClient';

type AssignmentSubmissionResponse = {
  submissionId: number;
  assignmentId: number;
  menteeId: number;
  imageUrl?: string;
  comment?: string;
  status?: string;
  createTime?: string;
};

export async function submitAssignment(
  assignmentId: number,
  file: File,
  comment?: string
): Promise<AssignmentSubmissionResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (comment) formData.append('comment', comment);

  return apiFetch<AssignmentSubmissionResponse>(`/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    body: formData,
  });
}
