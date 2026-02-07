'use client';

import { useState } from 'react';
import { useUpdateTodoMutation } from '@/src/hooks/todoQueries';
import type { Todo, TodoSubject } from '@/src/lib/types/planner';

type Props = {
  todo: Todo;
  onClose: () => void;
};

export default function TodoEditModal({ todo, onClose }: Props) {
  const updateTodoMutation = useUpdateTodoMutation();
  const [title, setTitle] = useState(todo.title);
  const [subject, setSubject] = useState<TodoSubject>(todo.subject);
  const [error, setError] = useState('');

  const closeModal = () => {
    setError('');
    onClose();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('할 일을 입력해 주세요.');
      return;
    }
    updateTodoMutation.mutate(
      { id: todo.id, patch: { title: trimmed, subject } },
      { onSuccess: () => closeModal() }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        onClick={closeModal}
        className="absolute inset-0 bg-black/40"
        aria-label="모달 닫기"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-neutral-900">할 일 수정</p>
            <p className="mt-1 text-sm text-neutral-500">제목, 유형, 과목을 수정할 수 있어요.</p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-full px-2 py-1 text-sm text-neutral-500 hover:text-neutral-900"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 grid gap-3">
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-neutral-600">할 일</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할 일을 입력하세요"
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold text-neutral-600">과목</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as TodoSubject)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900"
              aria-label="과목 선택"
            >
              <option value="국어">국어</option>
              <option value="영어">영어</option>
              <option value="수학">수학</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="mt-1 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
