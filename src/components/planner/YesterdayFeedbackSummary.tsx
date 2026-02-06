"use client";

import Link from 'next/link';
import { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { useTodosQuery } from '@/src/hooks/todoQueries';

export default function YesterdayFeedbackSummary() {
  const { data: todos = [] } = useTodosQuery();

  const yesterdayKey = useMemo(
    () => format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    []
  );

  const yesterdayFeedbackTodos = useMemo(() => {
    return todos
      .filter(
        (todo) =>
          todo.dueDate === yesterdayKey &&
          todo.status === 'DONE' &&
          typeof todo.feedback === 'string' &&
          todo.feedback.trim().length > 0
      )
      .slice()
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
  }, [todos, yesterdayKey]);

  const hasFeedback = yesterdayFeedbackTodos.length > 0;

  return (
    <section className="space-y-3 rounded-3xl bg-[#F5F5F5] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-neutral-900">어제 피드백</p>
          {hasFeedback && (
            <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden />
          )}
        </div>
        <Link
          href="/feedback"
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          이동하기
          <span aria-hidden>›</span>
        </Link>
      </div>

      <div className="grid gap-2">
        {hasFeedback ? (
          yesterdayFeedbackTodos.slice(0, 10).map((todo) => (
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
          ))
        ) : (
          <div className="rounded-xl bg-[#FFF] px-3 py-3 text-sm text-neutral-500">
            등록된 피드백이 없습니다
          </div>
        )}
      </div>
    </section>
  );
}
