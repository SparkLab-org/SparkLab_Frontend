import { useQuery } from '@tanstack/react-query';
import type { Todo, TodoSubject } from '@/src/lib/types/planner';
import type {
  AssignmentResponse,
  MenteeAssignmentsResponse,
} from '@/src/services/assignment.api';
import { listAssignments } from '@/src/services/assignment.api';

const SUBJECT_FROM_API: Record<string, TodoSubject> = {
  KOREAN: '국어',
  ENGLISH: '영어',
  MATH: '수학',
  ALL: '국어',
};

function toTodoSubject(subject?: string): TodoSubject {
  return SUBJECT_FROM_API[subject ?? ''] ?? '국어';
}

function toTodoStatus(submitted?: boolean) {
  return submitted ? 'DONE' : 'TODO';
}

function toDateOnly(value?: string) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [datePart] = String(value).split('T');
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? datePart : String(value);
}

export function mapAssignmentToTodo(
  assignment: AssignmentResponse,
  context?: { accountId?: string; menteeId?: number }
): Todo {
  const idSource =
    typeof assignment.todoItemId === 'number'
      ? assignment.todoItemId
      : assignment.assignmentId;
  const createdAt = assignment.createTime ? Date.parse(assignment.createTime) : 0;
  const title =
    assignment.materialTitle ?? assignment.title ?? '과제';
  return {
    id: String(idSource),
    assignmentId: assignment.assignmentId,
    title,
    isFixed: true,
    status: toTodoStatus(assignment.submitted),
    subject: toTodoSubject(assignment.subject),
    type: '과제',
    feedback: null,
    goal: null,
    assigneeId:
      typeof assignment.menteeId === 'number'
        ? String(assignment.menteeId)
        : context?.menteeId
        ? String(context.menteeId)
        : null,
    assigneeName: context?.accountId ?? null,
    guideFileName: null,
    guideFileUrl: null,
    studySeconds: 0,
    createdAt: Number.isNaN(createdAt) ? 0 : createdAt,
    dueDate: toDateOnly(assignment.targetDate),
    dueTime: '23:59',
  };
}

export function useMenteeAssignmentsQuery(params?: {
  menteeId?: number;
  enabled?: boolean;
}) {
  const menteeId = params?.menteeId;
  return useQuery({
    queryKey: ['assignments', menteeId ?? 'self'],
    queryFn: () => listAssignments(menteeId),
    enabled: params?.enabled ?? true,
  });
}
