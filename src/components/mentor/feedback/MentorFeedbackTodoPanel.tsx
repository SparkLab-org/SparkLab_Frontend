'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';

import type { FeedbackTypeFilter } from '@/src/components/mentor/feedback/mentorFeedbackTypes';
import type { Todo } from '@/src/lib/types/planner';

type Props = {
  menteeName?: string;
  menteeGrade?: string;
  activeType: FeedbackTypeFilter;
  onChangeType: (type: FeedbackTypeFilter) => void;
  pendingTodos: Todo[];
  completedTodos: Todo[];
  activeTodoId: string;
  onSelectTodo: (id: string) => void;
};

export default function MentorFeedbackTodoPanel({
  menteeName,
  menteeGrade,
  activeType,
  onChangeType,
  pendingTodos,
  completedTodos,
  activeTodoId,
  onSelectTodo,
}: Props) {
  return (
    <section className="rounded-3xl bg-[#F5F5F5] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{menteeName ?? '멘티 선택'}</p>
          <p className="text-xs text-neutral-400">{menteeGrade ?? ''}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-neutral-400" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['전체', '학습', '과제'] as const).map((type) => {
          const isActive = type === activeType;
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChangeType(type)}
              className={[
                'rounded-full px-3 py-1 text-xs font-semibold',
                isActive ? 'bg-[#004DFF] text-white' : 'bg-white text-neutral-500',
              ].join(' ')}
            >
              {type}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-400">확인중</p>
          {pendingTodos.length === 0 && (
            <div className="rounded-2xl bg-white px-3 py-4 text-xs text-neutral-400">
              확인 중인 과제가 없습니다.
            </div>
          )}
          {pendingTodos.map((todo) => {
            const isActive = todo.id === activeTodoId;
            return (
              <button
                key={todo.id}
                type="button"
                onClick={() => onSelectTodo(todo.id)}
                className={[
                  'w-full rounded-2xl border px-3 py-3 text-left text-xs transition',
                  isActive
                    ? 'border-[#004DFF] bg-white'
                    : 'border-transparent bg-white/70 hover:bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-800">{todo.title}</p>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-500">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-600">
                    확인중
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5">
                    {todo.subject}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-400">완료</p>
          {completedTodos.length === 0 && (
            <div className="rounded-2xl bg-white px-3 py-4 text-xs text-neutral-400">
              완료된 피드백이 없습니다.
            </div>
          )}
          {completedTodos.map((todo) => {
            const isActive = todo.id === activeTodoId;
            return (
              <button
                key={todo.id}
                type="button"
                onClick={() => onSelectTodo(todo.id)}
                className={[
                  'w-full rounded-2xl border px-3 py-3 text-left text-xs transition',
                  isActive
                    ? 'border-neutral-900 bg-white'
                    : 'border-transparent bg-white/70 hover:bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-800">{todo.title}</p>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-500">
                  <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-neutral-600">
                    완료
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5">
                    {todo.subject}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
