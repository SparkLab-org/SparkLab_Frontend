'use client';

import Link from 'next/link';
import type { Todo } from '@/src/lib/types/planner';
import { getTodoStatusLabel, isOverdueTask } from '@/src/lib/utils/todoStatus';

type Props = {
  todo: Todo;
};

export default function AssignmentItem({ todo }: Props) {
  const statusLabel = getTodoStatusLabel(todo);
  const isLate = isOverdueTask(todo) && todo.status !== 'DONE';
  const handleClick = () => {
    if (typeof window === 'undefined') return;
    if (todo.assignmentId) {
      window.localStorage.setItem(`assignmentIdOverride:${todo.id}`, String(todo.assignmentId));
      window.localStorage.setItem('assignmentIdOverride', String(todo.assignmentId));
    }
  };

  return (
    <Link
      href={`/planner/assignments/${todo.id}`}
      onClick={handleClick}
      className="rounded-3xl bg-[#F5F5F5] px-4 py-4 transition hover:translate-y-[-1px]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500">
          <span className="rounded-full bg-white px-2 py-0.5">멘토 과제</span>
          <span className="rounded-full bg-white px-2 py-0.5">{todo.subject}</span>
        </div>
        <span
          className={[
            'rounded-full px-2 py-0.5 text-[11px] font-semibold',
            statusLabel === '완료'
              ? 'bg-emerald-100 text-emerald-700'
              : isLate
              ? 'bg-rose-100 text-rose-600'
              : 'bg-neutral-200 text-neutral-600',
          ].join(' ')}
        >
          {statusLabel}
        </span>
      </div>
      <p className="mt-3 text-lg font-semibold text-neutral-900">{todo.title}</p>
      <p className="mt-2 text-xs text-neutral-500">
        마감 {todo.dueDate} {todo.dueTime}
      </p>
      {todo.goal && (
        <p className="mt-2 text-xs text-neutral-600 line-clamp-2">목표: {todo.goal}</p>
      )}
    </Link>
  );
}
