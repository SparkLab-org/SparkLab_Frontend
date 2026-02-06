import type { Todo, TodoType } from '@/src/lib/types/planner';

export function getTodoType(todo: Todo): TodoType {
  return todo.type ?? (todo.isFixed ? '과제' : '학습');
}

export function parseTodoDueAt(dueDate?: string, dueTime?: string): Date | null {
  if (!dueDate) return null;
  const time = dueTime?.trim() ? dueTime.trim() : '23:59';
  const date = new Date(`${dueDate}T${time}:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isOverdueTask(todo: Todo, now = new Date()): boolean {
  if (getTodoType(todo) !== '과제') return false;
  const dueAt = parseTodoDueAt(todo.dueDate, todo.dueTime);
  if (!dueAt) return false;
  return now.getTime() > dueAt.getTime();
}

export function getTodoStatusLabel(todo: Todo, now = new Date()): string {
  const overdue = isOverdueTask(todo, now);
  if (getTodoType(todo) === '과제' && overdue) {
    return todo.status === 'DONE' ? '지각' : '미제출';
  }
  return todo.status === 'DONE' ? '완료' : '해야 함';
}
