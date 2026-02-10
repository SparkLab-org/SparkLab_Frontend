import type { Feedback } from '@/src/lib/types/feedback';
import type { Todo, TodoSubject } from '@/src/lib/types/planner';

export const FALLBACK_CREATED_AT = 0;

export function formatSeconds(value?: number) {
  const total = Math.max(0, value ?? 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = Math.floor(total % 60);
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getTopSubject(todos: Todo[], fallback = '국어') {
  if (todos.length === 0) return fallback;
  const counts = new Map<string, number>();
  todos.forEach((todo) => {
    const subject = todo.subject ?? fallback;
    counts.set(subject, (counts.get(subject) ?? 0) + 1);
  });
  let top = fallback;
  let topCount = -1;
  counts.forEach((count, subject) => {
    if (count > topCount) {
      topCount = count;
      top = subject;
    }
  });
  return top;
}

export function hasFeedbackForTodo(todo: Todo, feedbackMap: Map<string, Feedback>) {
  if (feedbackMap.has(String(todo.id))) return true;
  if (todo.feedback && todo.feedback.trim().length > 0) return true;
  return false;
}

export function toTodoSubject(value?: string): TodoSubject {
  if (value === '국어' || value === '영어' || value === '수학') return value;
  return '국어';
}

export function resolveNumericId(value?: string | number | null) {
  if (value === null || value === undefined) return undefined;
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;
  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    if (match) {
      const extracted = Number(match[0]);
      return Number.isFinite(extracted) ? extracted : undefined;
    }
  }
  return undefined;
}

export function resolveTodoItemId(todo?: Todo | null) {
  if (!todo) return undefined;
  const parsed = Number(todo.id);
  return Number.isFinite(parsed) ? parsed : undefined;
}
