'use client';

import { useMemo } from 'react';
import { User } from 'lucide-react';
import { useQueries } from '@tanstack/react-query';

import { useMentorStore } from '@/src/store/mentorStore';
import type { ActiveLevel, Mentee } from '@/src/components/mentor/types';
import { getProgressFillStyle } from '@/src/lib/utils/progressStyle';
import { useUpdateMenteeActiveLevelMutation } from '@/src/hooks/menteeQueries';
import { useTodosRangeQuery } from '@/src/hooks/todoQueries';
import { addDays, format, subDays } from 'date-fns';
import {
  listTodoFeedbackStatus,
  type TodoFeedbackStatusResponse,
} from '@/src/services/feedback.api';

type Props = {
  onSelect?: (id: string) => void;
  onOpenQuestions?: (id: string) => void;
};

function getLevelLabel(level?: ActiveLevel) {
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

function getLevelClasses(level?: ActiveLevel) {
  switch (level) {
    case 'DANGER':
      return 'bg-rose-100 text-rose-600';
    case 'WARNING':
      return 'bg-amber-100 text-amber-700';
    case 'NORMAL':
    default:
      return 'bg-emerald-100 text-emerald-700';
  }
}

function getGoalRate(mentee: Mentee) {
  if (typeof mentee.goalRate === 'number') return mentee.goalRate;
  if (typeof mentee.progress === 'number') return mentee.progress;
  return 0;
}

function isAssignmentType(value?: string) {
  if (!value) return false;
  const normalized = value.toUpperCase();
  return (
    normalized.includes('ASSIGN') ||
    normalized.includes('HOMEWORK') ||
    normalized.includes('TASK')
  );
}

export default function MenteeListView({ onSelect, onOpenQuestions }: Props) {
  const mentees = useMentorStore((s) => s.mentees);
  const setSelectedId = useMentorStore((s) => s.setSelectedId);
  const selectedId = useMentorStore((s) => s.selectedId);
  const updateMenteeLevel = useMentorStore((s) => s.updateMenteeLevel);
  const updateLevelMutation = useUpdateMenteeActiveLevelMutation();
  const rangeDates = useMemo(() => {
    const today = new Date();
    const start = subDays(today, 6);
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), 'yyyy-MM-dd')
    );
  }, []);
  const { data: todos = [] } = useTodosRangeQuery(rangeDates);
  const todayKey = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const menteeStatusQueries = useQueries({
    queries: mentees.map((mentee) => {
      const menteeNumericId = Number.isFinite(Number(mentee.id))
        ? Number(mentee.id)
        : undefined;
      return {
        queryKey: ['feedbacks', 'todo-status', menteeNumericId ?? null, todayKey],
        queryFn: () => {
          if (typeof menteeNumericId !== 'number') return Promise.resolve([]);
          return listTodoFeedbackStatus({ menteeId: menteeNumericId, planDate: todayKey });
        },
        enabled: typeof menteeNumericId === 'number',
      };
    }),
  });

  const todoStatusByMentee = useMemo(() => {
    const map = new Map<string, TodoFeedbackStatusResponse[]>();
    menteeStatusQueries.forEach((query, index) => {
      const mentee = mentees[index];
      if (!mentee) return;
      const data = (query.data ?? []) as TodoFeedbackStatusResponse[];
      map.set(mentee.id, data);
    });
    return map;
  }, [menteeStatusQueries, mentees]);

  const todosByMentee = useMemo(() => {
    const map = new Map<string, typeof todos>();
    todos.forEach((todo) => {
      const idKey = todo.assigneeId ? String(todo.assigneeId) : '';
      const nameKey = todo.assigneeName ? String(todo.assigneeName) : '';
      if (idKey) {
        const list = map.get(idKey) ?? [];
        list.push(todo);
        map.set(idKey, list);
      }
      if (nameKey) {
        const list = map.get(nameKey) ?? [];
        list.push(todo);
        map.set(nameKey, list);
      }
    });
    return map;
  }, [todos]);

  const filteredMentees = useMemo(() => {
    return mentees.map((mentee) => {
      const todoList =
        todosByMentee.get(mentee.id) ?? todosByMentee.get(mentee.name) ?? [];
      const statusList = todoStatusByMentee.get(mentee.id) ?? [];
      const total = todoList.length;
      const done = todoList.filter((todo) => todo.status === 'DONE').length;
      const statusTotal = statusList.length;
      const statusDone = statusList.filter((item) => item.hasFeedback).length;
      const fallbackTotal = mentee.today.length;
      const fallbackDone = mentee.today.filter((item) => item.status === 'DONE').length;
      const goalRate =
        total > 0
          ? Math.round((done / total) * 100)
          : statusTotal > 0
            ? Math.round((statusDone / statusTotal) * 100)
            : fallbackTotal > 0
              ? Math.round((fallbackDone / fallbackTotal) * 100)
              : getGoalRate(mentee);
      return {
        ...mentee,
        goalRate,
      };
    });
  }, [mentees, todosByMentee, todoStatusByMentee]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 lg:text-3xl">담당 멘티</h1>
        </div>
      </div>

      <div className="w-full max-w-[900px] rounded-3xl bg-white p-4 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-12 items-center gap-2 rounded-xl bg-[#F6F8FA] px-4 py-3 text-center text-xs font-semibold text-neutral-500 whitespace-nowrap">
            <span className="col-span-3">이름</span>
            <span className="col-span-3">진행률</span>
            <span className="col-span-2">미제출과제</span>
            <span className="col-span-2">피드백</span>
            <span className="col-span-1">학습 진행</span>
            <span className="col-span-1">질문</span>
          </div>

          <div className="mt-3 divide-y divide-[#D9D9D9] rounded-2xl overflow-hidden">
            {filteredMentees.map((mentee) => {
              const progressRate = Math.max(0, Math.min(100, getGoalRate(mentee)));
              const todoList =
                todosByMentee.get(mentee.id) ?? todosByMentee.get(mentee.name) ?? [];
              const statusList = todoStatusByMentee.get(mentee.id) ?? [];
              const hasTodoData = todoList.length > 0;
              const unsubmittedAssignments = hasTodoData
                ? todoList.filter((todo) => todo.type === '과제' && todo.status !== 'DONE')
                    .length
                : statusList.filter(
                    (item) => isAssignmentType(item.type) && !item.hasFeedback
                  ).length;
              const pendingFeedback = hasTodoData
                ? todoList.filter(
                    (todo) =>
                      todo.status === 'DONE' &&
                      (!todo.feedback || todo.feedback.trim().length === 0)
                  ).length
                : statusList.filter((item) => !item.hasFeedback).length;
              return (
                <div
                  key={mentee.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setSelectedId(mentee.id);
                    onSelect?.(mentee.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedId(mentee.id);
                      onSelect?.(mentee.id);
                    }
                  }}
                  className={[
                    'grid w-full grid-cols-12 items-center gap-2 px-4 py-4 text-center text-sm text-neutral-700 transition whitespace-nowrap',
                    mentee.id === selectedId
                      ? 'bg-[#F6F8FA]'
                      : 'bg-white hover:bg-[#F6F8FA]/70',
                  ].join(' ')}
                >
                  <div className="col-span-3 flex items-center gap-3 justify-start text-left">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300/70">
                      <User
                        className="h-5 w-5 text-neutral-500"
                        fill="currentColor"
                        stroke="none"
                        aria-hidden
                      />
                    </span>
                    <span className="font-semibold text-neutral-900">{mentee.name}</span>
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="h-2 w-full max-w-[180px] rounded-full bg-[#D5EBFF]">
                      <div
                        className="h-full rounded-full"
                        style={getProgressFillStyle(progressRate)}
                      />
                    </div>
                  </div>
                  <span className="col-span-2 text-sm font-semibold text-neutral-600">
                    {unsubmittedAssignments}건
                  </span>
                  <span className="col-span-2 text-sm font-semibold text-neutral-600">
                    {pendingFeedback}건
                  </span>
                  <div className="col-span-1 flex items-center">
                    <span
                      className={[
                        'inline-flex items-center justify-center rounded-full px-3 py-1.5 text-center text-xs font-semibold leading-none',
                        getLevelClasses(mentee.activeLevel),
                      ].join(' ')}
                    >
                      {getLevelLabel(mentee.activeLevel)}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenQuestions?.(mentee.id);
                      }}
                      className="rounded-full bg-[#004DFF] px-3 py-1 text-[11px] font-semibold text-white"
                    >
                      질문
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredMentees.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-neutral-400">
                조건에 맞는 멘티가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
