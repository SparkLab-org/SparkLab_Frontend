"use client";

import Link from 'next/link';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { usePlannerStore } from '@/src/store/plannerStore';
import { useTodosQuery } from '@/src/hooks/todoQueries';

export default function CalendarSummary() {
  const selectedDate = usePlannerStore((s) => s.selectedDate);
  const { data: todos = [] } = useTodosQuery({ planDate: selectedDate });

  const monthLabel = useMemo(
    () => format(new Date(selectedDate), 'yyyy년 M월', { locale: ko }),
    [selectedDate]
  );

  const monthCount = useMemo(() => {
    const monthKey = selectedDate.slice(0, 7);
    return todos.filter((todo) => todo.dueDate.startsWith(monthKey)).length;
  }, [selectedDate, todos]);

  return (
    <section className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-900">캘린더</p>
        <Link
          href="/planner/calendar"
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          전체보기
          <span aria-hidden>›</span>
        </Link>
      </div>

      <div className="rounded-2xl bg-neutral-100 px-4 py-3">
        <p className="text-xs text-neutral-500">이번 달</p>
        <p className="mt-1 text-base font-semibold text-neutral-900">{monthLabel}</p>
        <p className="mt-1 text-xs text-neutral-500">등록된 할 일 {monthCount}개</p>
      </div>
    </section>
  );
}
