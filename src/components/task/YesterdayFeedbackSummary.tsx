"use client";

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { usePlannerStore } from '@/src/store/plannerStore';

export default function YesterdayFeedbackSummary() {
  const todos = usePlannerStore((s) => s.todos);
  const hasLoadedTodos = usePlannerStore((s) => s.hasLoadedTodos);
  const loadTodos = usePlannerStore((s) => s.loadTodos);

  useEffect(() => {
    if (!hasLoadedTodos) {
      void loadTodos();
    }
  }, [hasLoadedTodos, loadTodos]);

  const yesterdayKey = useMemo(
    () => format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    []
  );

  const yesterdayTodos = useMemo(() => {
    return todos
      .filter((todo) => todo.dueDate === yesterdayKey && todo.status === 'DONE')
      .slice()
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
  }, [todos, yesterdayKey]);

  return (
    <section className="space-y-3 rounded-3xl bg-[#F5F5F5] p-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-neutral-900">어제 피드백</p>
        <Link
          href="/feedback"
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          이동하기
          <span aria-hidden>›</span>
        </Link>
      </div>

      <div className="grid gap-2">
        {yesterdayTodos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-3 text-center text-xs text-neutral-500">
            어제 완료한 할 일이 없어요.
          </div>
        )}

        {yesterdayTodos.slice(0, 10).map((todo) => (
          <div
            key={todo.id}
            className="flex flex-row gap-2 rounded-xl bg-[#FFF] px-3 py-3 text-xs text-neutral-700"
          >
            <p className="text-sm font-semibold text-neutral-900">{todo.title}</p>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                {todo.subject}
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                완료
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
