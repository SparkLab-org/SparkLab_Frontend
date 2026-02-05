'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePlannerStore } from '@/src/store/plannerStore';
import type { TodoSubject } from '@/src/lib/types/planner';
import TodoItem from './TodoItem';

export default function TodoList() {
  const { todos, addTodo, toggleTodo, selectedDate, hasLoadedTodos, loadTodos } =
    usePlannerStore();

  const [title, setTitle] = useState('');
  const [subject, setSubjectState] = useState<TodoSubject>('국어');
  const [dueDate, setDueDate] = useState(selectedDate);
  const [dueTime, setDueTime] = useState('23:59');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [activeSubject, setActiveSubject] = useState<TodoSubject>('수학');
  const [activeType, setActiveType] = useState<'전체' | '과제' | '학습'>('전체');

  useEffect(() => {
    if (!hasLoadedTodos) {
      void loadTodos();
    }
  }, [hasLoadedTodos, loadTodos]);

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

  const subjects: TodoSubject[] = ['국어', '수학', '영어'];

  const todayTodos = useMemo(
    () => todos.filter((todo) => todo.dueDate === selectedDate),
    [todos, selectedDate]
  );

  const filteredTodos = useMemo(() => {
    let items = todayTodos.filter((todo) => todo.subject === activeSubject);
    if (activeType === '과제') {
      items = items.filter((todo) => todo.isFixed);
    }
    if (activeType === '학습') {
      items = items.filter((todo) => !todo.isFixed);
    }
    return items;
  }, [todayTodos, activeSubject, activeType]);

  return (
    <section className="space-y-5">
      <div className="flex items-center">
        <div className="rounded-full bg-neutral-100 p-1">
          <div className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
            {subjects.map((item) => {
              const active = activeSubject === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveSubject(item)}
                  className={[
                    'rounded-full px-4 py-1.5 transition',
                    active ? 'bg-black text-white' : 'hover:text-neutral-800',
                  ].join(' ')}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-neutral-900">오늘의 할일</h2>
        <button
          type="button"
          onClick={openModal}
          className="inline-flex h-8 w-8 items-center justify-center text-3xl font-medium text-black"
          aria-label="추가하기"
        >
          +
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
        {(['전체', '과제', '학습'] as const).map((item) => {
          const active = activeType === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setActiveType(item)}
              className={[
                'rounded-full px-3 py-1 transition',
                active
                  ? 'bg-black text-white'
                  : 'border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-800',
              ].join(' ')}
            >
              {item}
            </button>
          );
        })}
      </div>

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

      {filteredTodos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
          등록된 할 일이 없어요.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              variant="compact"
            />
          ))}
        </div>
      )}
    </section>
  );
}
