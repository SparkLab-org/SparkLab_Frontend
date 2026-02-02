'use client';

import { useMemo, useState } from 'react';
import { usePlannerStore } from '@/src/store/plannerStore';
import type { TodoSubject } from '@/src/lib/types/planner';
import TodoItem from './TodoItem';

export default function TodoList() {
  const { todos, addTodo, toggleTodo, removeTodo, setStudyMinutes, setSubject } = usePlannerStore();

  const [title, setTitle] = useState('');
  const [subject, setSubjectState] = useState<TodoSubject>('국어');

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
  };

  return (
    <section className="rounded-xl border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-500">오늘의 할 일</p>
          <p className="mt-1 text-sm text-neutral-700">
            완료 {doneCount}/{todos.length} · 총 {totalMinutes}분
          </p>
        </div>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="할 일을 추가하세요"
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={subject}
          onChange={(e) => setSubjectState(e.target.value as TodoSubject)}
          className="w-full sm:w-32 rounded-lg border px-3 py-2 text-sm"
          aria-label="과목 선택"
        >
          <option value="국어">국어</option>
          <option value="영어">영어</option>
          <option value="수학">수학</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
        >
          추가
        </button>
      </form>

      <div className="space-y-2">
        {todos.map((t) => (
          <TodoItem
            key={t.id}
            todo={t}
            onToggle={toggleTodo}
            onRemove={removeTodo}
            onMinutesChange={setStudyMinutes}
            onSubjectChange={setSubject}
          />
        ))}
      </div>
    </section>
  );
}
