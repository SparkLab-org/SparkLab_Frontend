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

function formatPeriodTime(value?: string) {
  if (!value) return '';
  const [hhRaw, mmRaw] = value.split(':');
  const hour24 = Number(hhRaw);
  const minute = Number(mmRaw ?? '0');
  if (!Number.isFinite(hour24) || !Number.isFinite(minute)) return value;
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${period} ${hour12}:${String(minute).padStart(2, '0')}`;
}

function formatKoreanDate(value?: string) {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length < 3) return value;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return value;
  return `${year}년 ${month}월 ${day}일`;
}

function formatKoreanDateTimeFromEpoch(value?: number) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${year}년 ${month}월 ${day}일 ${period} ${hour12}:${String(minutes).padStart(2, '0')}`;
}

function getStatusBadgeClass(status: Todo['status']) {
  return status === 'DONE'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-sky-100 text-sky-700';
}

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
    <section className="rounded-3xl bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-neutral-900">{menteeName ?? '멘티 선택'}</p>
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
                isActive
                  ? 'bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] text-white'
                  : 'bg-[#F6F8FA] text-neutral-500',
              ].join(' ')}
            >
              {type}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-neutral-400">피드백 요청</p>
          {pendingTodos.length === 0 && (
            <div className="rounded-2xl bg-white px-3 py-4 text-xs text-neutral-400">
              모든 피드백 작성을 완료했습니다.
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
                    ? 'border-[#004DFF] bg-[#F6F8FA]'
                    : 'border-transparent bg-[#F6F8FA] hover:bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-semibold text-neutral-800">{todo.title}</p>
                    <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                      {todo.subject}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-500">
                  <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden />
                  <span>
                    {(() => {
                      const label = [
                        formatKoreanDate(todo.dueDate),
                        formatPeriodTime(todo.dueTime),
                      ]
                        .filter(Boolean)
                        .join(' ');
                      return label || formatKoreanDateTimeFromEpoch(todo.createdAt);
                    })()}
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
                    ? 'border-neutral-900 bg-[#F6F8FA]'
                    : 'border-transparent bg-[#F6F8FA] hover:bg-white',
                ].join(' ')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-semibold text-neutral-800">{todo.title}</p>
                    <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                      {todo.subject}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-neutral-500">
                  <span
                    className={[
                      'rounded-full px-2 py-0.5 font-semibold',
                      getStatusBadgeClass(todo.status),
                    ].join(' ')}
                  >
                    완료
                  </span>
                  <span>{formatPeriodTime(todo.dueTime)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
