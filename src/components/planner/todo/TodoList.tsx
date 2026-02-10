'use client';

import { useMemo, useState } from 'react';
import {
  useDeleteTodoMutation,
  useTodosQuery,
  useUpdateTodoMutation,
} from '@/src/hooks/todoQueries';
import { usePlannerStore } from '@/src/store/plannerStore';
import type { TodoSubject } from '@/src/lib/types/planner';
import TodoItem from './TodoItem';
import TodoCreateModal from './TodoCreateModal';
import TodoEditModal from './TodoEditModal';

type SubjectFilter = '전체' | TodoSubject;
type FilterMode = 'all' | 'study' | 'assignment';

type Props = {
  filterMode?: FilterMode;
  title?: string;
  showCreate?: boolean;
};

export default function TodoList({
  filterMode = 'all',
  title = '오늘의 할일',
  showCreate = true,
}: Props) {
  const selectedDate = usePlannerStore((s) => s.selectedDate);
  const { data: todos = [] } = useTodosQuery({ planDate: selectedDate });
  const updateTodoMutation = useUpdateTodoMutation();
  const deleteTodoMutation = useDeleteTodoMutation();

  const toggleTodo = (id: string) => {
    const current = todos.find((todo) => todo.id === id);
    if (!current) return;
    const nextStatus = current.status === 'DONE' ? 'TODO' : 'DONE';
    updateTodoMutation.mutate({ id, patch: { status: nextStatus } });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [activeSubject, setActiveSubject] = useState<SubjectFilter>('전체');
  const [activeType, setActiveType] = useState<'전체' | '과제' | '학습'>('전체');

  const subjects: SubjectFilter[] = ['전체', '국어', '수학', '영어'];

  const todayTodos = useMemo(
    () =>
      todos.filter((todo) => {
        if (todo.dueDate !== selectedDate) return false;
        if (filterMode === 'assignment') return todo.isFixed;
        if (filterMode === 'study') return !todo.isFixed;
        return true;
      }),
    [todos, selectedDate, filterMode]
  );

  const filteredTodos = useMemo(() => {
    let items = todayTodos;
    if (activeSubject !== '전체') {
      items = items.filter((todo) => todo.subject === activeSubject);
    }
    if (activeType !== '전체') {
      items = items.filter((todo) => (todo.type ?? (todo.isFixed ? '과제' : '학습')) === activeType);
    }
    return items;
  }, [todayTodos, activeSubject, activeType]);

  const { activeTodos, doneTodos } = useMemo(() => {
    return filteredTodos.reduce(
      (acc, todo) => {
        if (todo.status === 'DONE') acc.doneTodos.push(todo);
        else acc.activeTodos.push(todo);
        return acc;
      },
      { activeTodos: [] as typeof filteredTodos, doneTodos: [] as typeof filteredTodos }
    );
  }, [filteredTodos]);

  const editingTodo = editingTodoId
    ? todos.find((todo) => todo.id === editingTodoId) ?? null
    : null;

  const handleRemove = (id: string) => {
    const target = todos.find((todo) => todo.id === id);
    if (!target || target.isFixed) return;
    const ok = window.confirm('이 할 일을 삭제할까요?');
    if (!ok) return;
    deleteTodoMutation.mutate(id);
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-center">
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
                    active ? 'bg-[#004DFF] text-white' : 'hover:text-neutral-800',
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
        <h2 className="text-2xl font-semibold text-neutral-900">{title}</h2>
        {showCreate && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-8 w-8 items-center justify-center text-3xl font-medium text-black"
            aria-label="추가하기"
          >
            +
          </button>
        )}
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
                  ? 'bg-[#004DFF] text-white'
                  : 'border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-800',
              ].join(' ')}
            >
              {item}
            </button>
          );
        })}
      </div>

      {isModalOpen && (
        <TodoCreateModal
          onClose={() => setIsModalOpen(false)}
          initialDate={selectedDate}
        />
      )}

      {editingTodo && (
        <TodoEditModal
          todo={editingTodo}
          onClose={() => setEditingTodoId(null)}
        />
      )}

      {filteredTodos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
          등록된 할 일이 없어요.
        </div>
      ) : (
        <div className="grid gap-4">
          {activeTodos.length > 0 && (
            <div className="grid gap-4">
              {activeTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onEdit={(id) => setEditingTodoId(id)}
                  onRemove={handleRemove}
                  variant="compact"
                />
              ))}
            </div>
          )}

          {doneTodos.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-600">완료한 할 일</p>
                <span className="text-xs font-semibold text-neutral-400">{doneTodos.length}개</span>
              </div>
              <div className="grid gap-4">
                {doneTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={toggleTodo}
                    onEdit={(id) => setEditingTodoId(id)}
                    onRemove={handleRemove}
                    variant="compact"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  );
}
