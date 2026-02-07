import { apiFetch } from '@/src/services/appClient';

type AssignmentSubmissionResponse = {
  submissionId: number;
  assignmentId: number;
  menteeId: number;
  imageUrl?: string;
  status?: string;
  createTime?: string;
};

export async function submitAssignment(assignmentId: number, file: File): Promise<AssignmentSubmissionResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch<AssignmentSubmissionResponse>(`/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    body: formData,
  });
}
