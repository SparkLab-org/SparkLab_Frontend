'use client';

import { useMemo, useState } from 'react';
import { usePlannerStore } from '@/src/store/plannerStore';
import type { TodoSubject } from '@/src/lib/types/planner';
import TodoItem from './TodoItem';

export default function TodoList() {
  const { todos, addTodo, toggleTodo, removeTodo, updateTodo } = usePlannerStore();

  const [title, setTitle] = useState('');
  const [subject, setSubjectState] = useState<TodoSubject>('국어');
  const [showForm, setShowForm] = useState(false);

  const totalMinutes = useMemo(
    () => todos.reduce((acc, t) => acc + (t.studyMinutes || 0), 0),
    [todos]
  );

  const doneCount = useMemo(() => todos.filter((t) => t.status === 'DONE').length, [todos]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo(title, subject);
    setTitle('');
    setSubjectState('국어');
    setShowForm(false);
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
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-neutral-900 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
        >
          {showForm ? '닫기' : '추가하기'}
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="grid gap-2 rounded-2xl border border-neutral-200 bg-white/80 p-3 backdrop-blur"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={subject}
              onChange={(e) => setSubjectState(e.target.value as TodoSubject)}
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900"
              aria-label="과목 선택"
            >
              <option value="국어">국어</option>
              <option value="영어">영어</option>
              <option value="수학">수학</option>
            </select>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
            >
              추가
            </button>
          </div>
        </form>
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
