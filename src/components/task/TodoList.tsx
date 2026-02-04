'use client';

import { useMemo, useState } from 'react';
import { usePlannerStore } from '@/src/store/plannerStore';
import type { TodoSubject } from '@/src/lib/types/planner';
import TodoItem from './TodoItem';

export default function TodoList() {
  const { todos, addTodo, toggleTodo, removeTodo, updateTodo, selectedDate } =
    usePlannerStore();

  const [title, setTitle] = useState('');
  const [subject, setSubjectState] = useState<TodoSubject>('국어');
  const [dueDate, setDueDate] = useState(selectedDate);
  const [dueTime, setDueTime] = useState('23:59');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const totalMinutes = useMemo(
    () => todos.reduce((acc, t) => acc + (t.studyMinutes || 0), 0),
    [todos]
  );

  const doneCount = useMemo(() => todos.filter((t) => t.status === 'DONE').length, [todos]);

  const openModal = () => {
    setTitle('');
    setSubjectState('국어');
    setDueDate(selectedDate);
    setDueTime('23:59');
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('할 일을 입력해 주세요.');
      return;
    }
    if (!dueDate || !dueTime) {
      setError('마감 날짜와 시간을 선택해 주세요.');
      return;
    }
    addTodo(trimmed, subject, dueDate, dueTime);
    closeModal();
  };

  const mentorTodos = todos.filter((t) => t.isFixed);
  const menteeTodos = todos.filter((t) => !t.isFixed);

  return (
    <section
      className="space-y-4 rounded-[26px] border border-neutral-100 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
      style={{
        background: 'linear-gradient(180deg, rgba(245, 245, 245, 0) 46.7%, #F5F5F5 100%)',
      }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold text-neutral-800">오늘의 할 일</p>
          <p className="mt-1 text-sm text-neutral-600">
            완료 {doneCount}/{todos.length} · 총 {totalMinutes}분
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="rounded-full bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
        >
          추가하기
        </button>
      </header>

      {isModalOpen && (
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
      )}

      <div className="space-y-3">
        {mentorTodos.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-neutral-500">멘토</p>
            <div className="grid gap-3">
              {mentorTodos.map((t) => (
                <TodoItem
                  key={t.id}
                  todo={t}
                  onToggle={toggleTodo}
                  onRemove={removeTodo}
                  onUpdate={updateTodo}
                />
              ))}
            </div>
          </div>
        )}

        {menteeTodos.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-neutral-500">멘티</p>
            <div className="grid gap-3">
              {menteeTodos.map((t) => (
                <TodoItem
                  key={t.id}
                  todo={t}
                  onToggle={toggleTodo}
                  onRemove={removeTodo}
                  onUpdate={updateTodo}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
