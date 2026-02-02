'use client';

import Link from 'next/link';
import type { Todo, TodoSubject } from '@/src/lib/types/planner';

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onMinutesChange: (id: string, minutes: number) => void;
  onSubjectChange: (id: string, subject: TodoSubject) => void;
};

export default function TodoItem({
  todo,
  onToggle,
  onRemove,
  onMinutesChange,
  onSubjectChange,
}: Props) {
  const isDone = todo.status === 'DONE';

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggle(todo.id)}
            className={[
              'flex h-6 w-6 items-center justify-center rounded-lg border text-xs font-semibold transition',
              isDone
                ? 'border-neutral-900 bg-neutral-900 text-white'
                : 'border-neutral-300 bg-neutral-50 text-neutral-400 hover:border-neutral-500',
            ].join(' ')}
            aria-label="완료 체크"
          >
            {isDone ? '✓' : ''}
          </button>

          {/* 과제 상세로 이동: 나중에 학습지/업로드 붙이면 됨 */}
          <Link
            href={`/task/${todo.id}`}
            className={[
              'truncate text-sm font-medium',
              isDone ? 'text-neutral-400 line-through' : 'text-neutral-900',
            ].join(' ')}
          >
            {todo.title}
          </Link>

          {todo.isFixed && (
            <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
              고정
            </span>
          )}
          <span className="shrink-0 rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-semibold text-white">
            {todo.subject}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500">
          <span>공부시간</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1440}
            value={todo.studyMinutes}
            onChange={(e) => onMinutesChange(todo.id, Number(e.target.value))}
            className="w-20 rounded-md border border-neutral-300 bg-neutral-50 px-2 py-1 text-xs text-neutral-900"
            aria-label="공부시간(분)"
          />
          <span>분</span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500">
          <span>과목</span>
          <select
            value={todo.subject}
            onChange={(e) => onSubjectChange(todo.id, e.target.value as TodoSubject)}
            className="w-28 rounded-md border border-neutral-300 bg-neutral-50 px-2 py-1 text-xs text-neutral-900"
            aria-label="과목 선택"
          >
            <option value="국어">국어</option>
            <option value="영어">영어</option>
            <option value="수학">수학</option>
          </select>
        </div>
      </div>

      {!todo.isFixed && (
        <button
          type="button"
          onClick={() => onRemove(todo.id)}
          className="shrink-0 rounded-md border px-2 py-1 text-xs text-neutral-700"
        >
          삭제
        </button>
      )}
    </div>
  );
}
