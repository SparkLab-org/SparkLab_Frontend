import { addDays, format, startOfMonth, startOfWeek } from 'date-fns';

import type { ActiveLevel, Mentee } from '@/src/components/mentor/types';
import type { Todo, TodoStatus } from '@/src/lib/types/planner';

export const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export type ScheduleItem = {
  title: string;
  status: TodoStatus;
  colorClass: string;
};

export type DaySchedule = {
  items: ScheduleItem[];
  progress: number; // 0~1
};

export type MenteeCard = {
  id: string;
  name: string;
  grade?: string;
  subjects: string[];
  weaknessType?: string;
  activeLevel?: ActiveLevel;
  goalRate: number;
  todayCount: number;
};

export function buildMonthGrid(month: Date) {
  const monthStart = startOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  return Array.from({ length: 35 }, (_, i) => addDays(gridStart, i));
}

function getGoalRate(mentee: Mentee) {
  if (typeof mentee.goalRate === 'number') return mentee.goalRate;
  if (typeof mentee.progress === 'number') return mentee.progress;
  return 0;
}

export function getLevelLabel(level?: ActiveLevel) {
  switch (level) {
    case 'NORMAL':
      return '정상';
    case 'WARNING':
      return '주의';
    case 'DANGER':
      return '위험';
    default:
      return '정상';
  }
}

export function getLevelBadgeClass(level?: ActiveLevel) {
  switch (level) {
    case 'DANGER':
      return 'bg-rose-100 text-rose-600';
    case 'WARNING':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-emerald-100 text-emerald-700';
  }
}

export function getSubjectColor(subject: string) {
  switch (subject) {
    case '국어':
      return 'bg-emerald-200';
    case '수학':
      return 'bg-sky-200';
    case '영어':
      return 'bg-violet-200';
    case '과학':
      return 'bg-amber-200';
    default:
      return 'bg-neutral-200';
  }
}

export function getStatusColor(status: TodoStatus) {
  return status === 'DONE'
    ? 'bg-emerald-200 text-emerald-700'
    : 'bg-violet-100 text-violet-700';
}

export function buildScheduleMap(mentees: Mentee[], monthStart: Date) {
  const map: Record<string, DaySchedule> = {};
  mentees.forEach((mentee, menteeIndex) => {
    const titles = mentee.today.length > 0
      ? mentee.today.map((item) => item.todo)
      : Array.from(new Set(mentee.subjects ?? mentee.today.map((item) => item.subject)));
    titles.forEach((title, titleIndex) => {
      const offset = (menteeIndex * 3 + titleIndex * 5) % 28;
      const date = addDays(monthStart, offset);
      const key = format(date, 'yyyy-MM-dd');
      const current = map[key] ?? { items: [], progress: 0 };
      current.items.push({
        title,
        status: 'TODO',
        colorClass: getStatusColor('TODO'),
      });
      const total = current.items.length;
      const done = current.items.filter((item) => item.status === 'DONE').length;
      current.progress = total > 0 ? done / total : 0;
      map[key] = current;
    });
  });
  return map;
}

export function buildScheduleMapFromTodos(todos: Todo[]) {
  return todos.reduce<Record<string, DaySchedule>>((acc, todo) => {
    if (!todo.dueDate) return acc;
    const current = acc[todo.dueDate] ?? { items: [], progress: 0 };
    current.items.push({
      title: todo.title,
      status: todo.status,
      colorClass: getStatusColor(todo.status),
    });
    const total = current.items.length;
    const done = current.items.filter((item) => item.status === 'DONE').length;
    current.progress = total > 0 ? done / total : 0;
    acc[todo.dueDate] = current;
    return acc;
  }, {});
}

export function buildMenteeCardsFromTodos(
  todos: Todo[],
  fallback: Mentee[],
  selectedDateKey: string
): MenteeCard[] {
  const byAssignee = new Map<string, { id: string; name: string; todos: Todo[] }>();
  todos.forEach((todo) => {
    const key = todo.assigneeId ?? todo.assigneeName ?? '';
    if (!key) return;
    const id = String(key);
    const current = byAssignee.get(id) ?? {
      id,
      name: todo.assigneeName ?? `멘티 ${id}`,
      todos: [],
    };
    current.todos.push(todo);
    if (todo.assigneeName) current.name = todo.assigneeName;
    byAssignee.set(id, current);
  });

  if (byAssignee.size === 0) {
    return fallback.map((mentee) => {
      const subjects = Array.from(
        new Set(mentee.subjects ?? mentee.today.map((item) => item.subject))
      );
      return {
        id: mentee.id,
        name: mentee.name,
        grade: mentee.grade,
        subjects,
        weaknessType: mentee.weaknessType,
        activeLevel: mentee.activeLevel,
        goalRate: Math.max(0, Math.min(100, getGoalRate(mentee))),
        todayCount: mentee.today.length,
      };
    });
  }

  return Array.from(byAssignee.values()).map((entry) => {
    const base =
      fallback.find((mentee) => mentee.id === entry.id) ??
      fallback.find((mentee) => mentee.name === entry.name);
    const subjects = Array.from(new Set(entry.todos.map((todo) => todo.subject)));
    const total = entry.todos.length;
    const done = entry.todos.filter((todo) => todo.status === 'DONE').length;
    const goalRate =
      total > 0
        ? Math.round((done / total) * 100)
        : base
          ? Math.max(0, Math.min(100, getGoalRate(base)))
          : 0;
    const todayCount = entry.todos.filter((todo) => todo.dueDate === selectedDateKey).length;
    return {
      id: entry.id,
      name: entry.name,
      grade: base?.grade,
      subjects,
      weaknessType: base?.weaknessType,
      activeLevel: base?.activeLevel,
      goalRate,
      todayCount,
    };
  });
}
