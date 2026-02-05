'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { usePlannerStore } from '@/src/store/plannerStore';

export default function TodayTodoSummary() {
  const todos = usePlannerStore((s) => s.todos);
  const selectedDate = usePlannerStore((s) => s.selectedDate);
  const hasLoadedTodos = usePlannerStore((s) => s.hasLoadedTodos);
  const loadTodos = usePlannerStore((s) => s.loadTodos);

  useEffect(() => {
    if (!hasLoadedTodos) {
      void loadTodos();
    }
  }, [hasLoadedTodos, loadTodos]);

  const todayTodos = useMemo(() => {
    return todos
      .filter((todo) => todo.dueDate === selectedDate)
      .slice()
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
  }, [todos, selectedDate]);

  return (
    <section className="space-y-3 rounded-3xl bg-[#F5F5F5] p-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-neutral-900">오늘의 할 일</p>
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
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-3 text-center text-xs text-neutral-500">
            등록된 할 일이 없어요.
          </div>
        )}

        {todayTodos.slice(0, 3).map((todo) => (
          <div
            key={todo.id}
            className="flex flex-row gap-2 rounded-2xl bg-[#FFF] px-3 py-2 text-xs text-neutral-700"
          >
            <p className="text-sm font-semibold text-neutral-900">{todo.title}</p>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                {todo.subject}
              </span>
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  todo.status === 'DONE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-neutral-200 text-neutral-600',
                ].join(' ')}
              >
                {todo.status === 'DONE' ? '완료' : '해야 함'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
