'use client';

import { useState } from 'react';
import { useCreateTodoMutation } from '@/src/hooks/todoQueries';
import type { TodoSubject, TodoType } from '@/src/lib/types/planner';

type Props = {
  onClose: () => void;
  initialDate: string;
};

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function TodoCreateModal({ onClose, initialDate }: Props) {
  const createTodoMutation = useCreateTodoMutation();
  const [title, setTitle] = useState('');
  const [subject, setSubjectState] = useState<TodoSubject>('국어');
  const [todoType, setTodoType] = useState<TodoType>('학습');
  const [dueDate, setDueDate] = useState(initialDate || todayISO());
  const [dueTime, setDueTime] = useState('23:59');
  const [error, setError] = useState('');

  const closeModal = () => {
    setError('');
    onClose();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    const dateValue = dueDate.trim();
    const timeValue = dueTime.trim();
    if (!trimmed) {
      setError('할 일을 입력해 주세요.');
      return;
    }
    if (!dateValue || !timeValue) {
      setError('마감 날짜와 시간을 선택해 주세요.');
      return;
    }
    createTodoMutation.mutate(
      { title: trimmed, subject, dueDate: dateValue, dueTime: timeValue, type: todoType },
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
            <p className="text-lg font-semibold text-neutral-900">할 일 추가</p>
            <p className="mt-1 text-sm text-neutral-500">언제까지 완료할지 설정해 주세요.</p>
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
            <label className="text-xs font-semibold text-neutral-600">유형</label>
            <div className="flex gap-2">
              {(['과제', '학습'] as const).map((type) => {
                const active = todoType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTodoType(type)}
                    className={[
                      'flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition',
                      active
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white text-neutral-500 hover:text-neutral-800',
                    ].join(' ')}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold text-neutral-600">과목</label>
            <select
              value={subject}
              onChange={(e) => setSubjectState(e.target.value as TodoSubject)}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900"
              aria-label="과목 선택"
            >
              <option value="국어">국어</option>
              <option value="영어">영어</option>
              <option value="수학">수학</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-semibold text-neutral-600">언제까지</label>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
              />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
              />
            </div>
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
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
