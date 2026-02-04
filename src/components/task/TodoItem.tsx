'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Todo, TodoSubject } from '@/src/lib/types/planner';

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, title: string, subject: TodoSubject) => void;
};

export default function TodoItem({
  todo,
  onToggle,
  onRemove,
  onUpdate,
}: Props) {
  const isDone = todo.status === 'DONE';
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(todo.title);
  const [draftSubject, setDraftSubject] = useState<TodoSubject>(todo.subject);

  const save = () => {
    onUpdate(todo.id, draftTitle, draftSubject);
    setEditing(false);
  };

  return (
    <div
      className="flex items-start justify-between gap-3 rounded-3xl p-4 shadow-sm ring-1 ring-neutral-100"
      style={{
        background:
          'linear-gradient(180deg, rgba(245, 245, 245, 0) 46.7%, #F5F5F5 100%)',
      }}
    >
      <div className="min-w-0 flex-1 space-y-3 overflow-hidden">
        <div className="flex items-center gap-2 overflow-hidden">
          {!editing && (
            <button
              type="button"
              onClick={() => onToggle(todo.id)}
              className={[
                'flex h-7 w-7 items-center justify-center rounded-xl text-xs font-semibold transition ring-1',
                isDone
                  ? 'bg-neutral-900 text-white ring-neutral-900'
                  : 'bg-white text-neutral-500 ring-neutral-200 hover:ring-neutral-300',
              ].join(' ')}
              aria-label="완료 체크"
            >
              {isDone ? '✓' : ''}
            </button>
          )}

          <div className="flex min-w-0 flex-col gap-1 overflow-hidden">
            {editing ? (
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900"
              />
            ) : (
              <Link
                href={`/task/${todo.id}`}
                className={[
                  'truncate text-sm font-semibold',
                  isDone ? 'text-neutral-400 line-through' : 'text-neutral-900',
                ].join(' ')}
              >
                {todo.title}
              </Link>
            )}

            {editing ? (
              <select
                value={draftSubject}
                onChange={(e) => setDraftSubject(e.target.value as TodoSubject)}
                className="w-24 rounded-xl border border-neutral-200 bg-white px-2 py-1 text-[11px] font-semibold text-neutral-900"
              >
                <option value="국어">국어</option>
                <option value="영어">영어</option>
                <option value="수학">수학</option>
              </select>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="w-fit rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-semibold text-white ring-1 ring-neutral-900">
                  {todo.subject}
                </span>
                <span className="text-[11px] text-neutral-500">
                  마감 {todo.dueDate} {todo.dueTime}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!todo.isFixed && (
          editing ? (
            <button
              type="button"
              onClick={save}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white ring-1 ring-neutral-900 transition"
              aria-label="저장"
            >
              ✓
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftTitle(todo.title);
                setDraftSubject(todo.subject);
                setEditing(true);
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-neutral-700 ring-1 ring-neutral-200 transition hover:ring-neutral-300"
              aria-label="수정"
            >
              ✎
            </button>
          )
        )}

        {!editing && (
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-neutral-700 ring-1 ring-neutral-200 transition hover:ring-neutral-300"
            aria-label="타이머 시작"
          >
            ▶
          </button>
        )}

        {!todo.isFixed && !editing && (
          <button
            type="button"
            onClick={() => onRemove(todo.id)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-neutral-700 ring-1 ring-neutral-200 transition hover:ring-neutral-300"
            aria-label="삭제"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}
