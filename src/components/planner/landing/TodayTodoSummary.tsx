'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePlannerStore } from '@/src/store/plannerStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTodosQuery } from '@/src/hooks/todoQueries';
import { getTodoStatusLabel } from '@/src/lib/utils/todoStatus';

export default function TodayTodoSummary() {
  const selectedDate = usePlannerStore((s) => s.selectedDate);
  const { data: todos = [] } = useTodosQuery();

  const todayTodos = useMemo(() => {
    return todos
      .filter((todo) => todo.dueDate === selectedDate)
      .slice()
      .sort((a, b) => {
        if (a.status === b.status) {
          return a.dueTime.localeCompare(b.dueTime);
        }
        if (a.status === 'DONE') return 1;
        if (b.status === 'DONE') return -1;
        return 0;
      });
  }, [todos, selectedDate]);

  const titleText = useMemo(() => {
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    if (selectedDate === todayKey) return '오늘의 할 일';
    const dateLabel = format(new Date(selectedDate), 'M월 d일', { locale: ko });
    return `${dateLabel} 할 일`;
  }, [selectedDate]);

  return (
    <section className="space-y-3 rounded-3xl bg-[#F5F5F5] p-4">
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
            href={`/planner/list/${todo.id}`}
            className="flex flex-row gap-2 rounded-xl bg-[#FFF] px-3 py-3 text-xs text-neutral-700 transition hover:ring-1 hover:ring-neutral-200"
          >
            <p className="text-sm font-semibold text-neutral-900">{todo.title}</p>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                {todo.subject}
              </span>
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  (() => {
                    const label = getTodoStatusLabel(todo);
                    if (label === '지각' || label === '미제출') return 'bg-rose-100 text-rose-600';
                    if (label === '완료') return 'bg-emerald-100 text-emerald-700';
                    return 'bg-neutral-200 text-neutral-600';
                  })(),
                ].join(' ')}
              >
                {getTodoStatusLabel(todo)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
