import type {
  AssignmentResponse,
  MenteeAssignmentsResponse,
} from '@/src/services/assignment.api';

type AssignmentIdInput = string | number | null | undefined;

function toNumber(value: AssignmentIdInput): number | undefined {
  if (value === null || value === undefined) return undefined;
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function flattenAssignments(groups?: MenteeAssignmentsResponse[] | null) {
  if (!groups || groups.length === 0) return [] as AssignmentResponse[];
  return groups.flatMap((group) => group.assignments ?? []);
}

function normalizeTitle(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.toLowerCase() : null;
}

function toDateOnly(value?: string | null): string | null {
  if (!value) return null;
  const [datePart] = String(value).split('T');
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
  return null;
}

function normalizeSubject(value?: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (['KOREAN', 'ENGLISH', 'MATH', 'ALL'].includes(normalized)) return normalized;
  switch (value) {
    case '국어':
      return 'KOREAN';
    case '영어':
      return 'ENGLISH';
    case '수학':
      return 'MATH';
    default:
      return null;
  }
}

export function resolveAssignmentMatch(params: {
  todoId?: AssignmentIdInput;
  todo?: {
    id?: AssignmentIdInput;
    assignmentId?: AssignmentIdInput;
    title?: string | null;
    dueDate?: string | null;
    subject?: string | null;
  } | null;
  assignmentGroups?: MenteeAssignmentsResponse[] | null;
  overrideAssignmentId?: AssignmentIdInput;
}): AssignmentResponse | undefined {
  const candidates = new Set<number>();
  const push = (value: AssignmentIdInput) => {
    const num = toNumber(value);
    if (typeof num === 'number') candidates.add(num);
  };

  push(params.overrideAssignmentId);
  push(params.todo?.assignmentId);
  push(params.todo?.id);
  push(params.todoId);

  const assignments = flattenAssignments(params.assignmentGroups);
  if (assignments.length === 0) return undefined;

  for (const candidate of candidates) {
    const match = assignments.find((item) => {
      const assignmentId = toNumber(item.assignmentId);
      return typeof assignmentId === 'number' && assignmentId === candidate;
    });
    if (match) return match;
  }

  for (const candidate of candidates) {
    const match = assignments.find((item) => {
      const todoItemId = toNumber(item.todoItemId);
      return typeof todoItemId === 'number' && todoItemId === candidate;
    });
    if (match) return match;
  }

  const todoTitle = normalizeTitle(params.todo?.title ?? null);
  const todoDate = toDateOnly(params.todo?.dueDate ?? null);
  if (todoTitle) {
    const matchByMeta = assignments.find((item) => {
      const assignmentTitle = normalizeTitle(item.materialTitle ?? item.title ?? null);
      if (!assignmentTitle || assignmentTitle !== todoTitle) return false;
      if (!todoDate) return true;
      const assignmentDate = toDateOnly(item.targetDate ?? null);
      return assignmentDate ? assignmentDate === todoDate : true;
    });
    if (matchByMeta) return matchByMeta;
  }

  if (assignments.length === 1) return assignments[0];

  if (todoDate) {
    const todoSubject = normalizeSubject(params.todo?.subject ?? null);
    const sameDate = assignments.filter((item) => {
      const assignmentDate = toDateOnly(item.targetDate ?? null);
      return assignmentDate ? assignmentDate === todoDate : false;
    });
    if (todoSubject) {
      const bySubject = sameDate.filter(
        (item) => normalizeSubject(item.subject ?? null) === todoSubject
      );
      if (bySubject.length === 1) return bySubject[0];
    }
    if (sameDate.length === 1) return sameDate[0];
  }

  return undefined;
}

export function resolveAssignmentId(params: {
  todoId?: AssignmentIdInput;
  todo?: { id?: AssignmentIdInput; assignmentId?: AssignmentIdInput } | null;
  assignmentGroups?: MenteeAssignmentsResponse[] | null;
  overrideAssignmentId?: AssignmentIdInput;
}): number | undefined {
  const match = resolveAssignmentMatch(params);
  const matchId = toNumber(match?.assignmentId ?? null);
  if (typeof matchId === 'number') return matchId;

  const fromTodo = toNumber(params.todo?.assignmentId);
  if (typeof fromTodo === 'number') return fromTodo;

  const override = toNumber(params.overrideAssignmentId);
  if (typeof override === 'number') return override;

  return undefined;
}
