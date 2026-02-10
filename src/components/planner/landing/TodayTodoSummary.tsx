'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePlannerStore } from '@/src/store/plannerStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTodosQuery } from '@/src/hooks/todoQueries';
import { getTodoType } from '@/src/lib/utils/todoStatus';
import { getTodoDetailHref } from '@/src/lib/utils/todoLink';
import mentorTodoIcon from '@/src/assets/icons/mentorTodo.svg';

export default function TodayTodoSummary() {
  const selectedDate = usePlannerStore((s) => s.selectedDate);
  const { data: todos = [] } = useTodosQuery({ planDate: selectedDate });

  const todayTodos = useMemo(() => {
    return todos
      .filter((todo) => todo.dueDate === selectedDate && todo.status !== 'DONE')
      .slice()
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
  }, [todos, selectedDate]);

  const titleText = useMemo(() => {
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    if (selectedDate === todayKey) return '오늘의 할 일';
    const dateLabel = format(new Date(selectedDate), 'M월 d일', { locale: ko });
    return `${dateLabel} 할 일`;
  }, [selectedDate]);

  const formatStudyTime = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '';
    const total = Math.floor(seconds);
    const hh = String(Math.floor(total / 3600)).padStart(1, '0');
    const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };
  const mentorTodoSrc =
    typeof mentorTodoIcon === 'string' ? mentorTodoIcon : mentorTodoIcon?.src;

  return (
    <section className="space-y-3 rounded-3xl bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-neutral-900">{titleText}</p>
        <Link
          href="/planner/list"
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          이동하기
          <span aria-hidden>›</span>
        </Link>
      </div>

      <div className="grid gap-2">
        {todayTodos.length === 0 && (
          <div className="rounded-xl bg-[#FFF] px-3 py-3 text-sm text-neutral-500">
            등록된 할 일이 없어요
          </div>
        )}

        {todayTodos.slice(0, 10).map((todo) => (
          <Link
            key={todo.id}
            href={getTodoDetailHref(todo)}
            className="flex flex-row items-center gap-2 rounded-xl bg-[#F6F8FA] px-3 py-3.5 text-xs text-neutral-700 transition hover:ring-1 hover:ring-neutral-200"
          >
            <div className="flex w-full items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  {(todo.isFixed || getTodoType(todo) === '과제') && mentorTodoSrc ? (
                    <img
                      src={mentorTodoSrc}
                      alt=""
                      aria-hidden
                      className="h-6 w-6 shrink-0"
                    />
                  ) : null}
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {todo.title}
                  </p>
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      (() => {
                        const type = getTodoType(todo);
                        return type === '과제'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-emerald-100 text-emerald-700';
                      })(),
                    ].join(' ')}
                  >
                    {getTodoType(todo)}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#B2B3B6]">
                    {todo.subject}
                  </span>
                </div>
              </div>
              {formatStudyTime(todo.studySeconds) && (
                <span className="shrink-0 text-[14px] text-[#6B7389]">
                  {formatStudyTime(todo.studySeconds)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
