'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTodosQuery, useUpdateTodoMutation } from '@/src/hooks/todoQueries';
import { getTodoSnapshot as getMockTodoSnapshot } from '@/src/services/todo.mock';
import { getTodoStatusLabel, isOverdueTask } from '@/src/lib/utils/todoStatus';
import AssignmentSubmissionCard from './AssignmentSubmissionCard';
import AssignmentAttachmentCard from '../list/listdetail/AssignmentAttachmentCard';
import { useTimerStore } from '@/src/store/timerStore';
import { submitAssignment } from '@/src/services/assignment.api';

type Props = {
  todoId: string;
};

export default function AssignmentDetailView({ todoId }: Props) {
  const router = useRouter();
  const { data: todos = [] } = useTodosQuery();
  const updateTodoMutation = useUpdateTodoMutation();
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const openPanel = useTimerStore((s) => s.openPanel);
  const setActiveTodoId = useTimerStore((s) => s.setActiveTodoId);

  const todo = useMemo(() => {
    const sourceTodos = todos.length > 0 ? todos : getMockTodoSnapshot();
    return sourceTodos.find((item) => item.id === todoId);
  }, [todos, todoId]);

  const statusLabel = todo ? getTodoStatusLabel(todo) : '';
  const isLate = todo ? isOverdueTask(todo) : false;
  const isDone = todo?.status === 'DONE';

  const handleSubmit = (comment: string, files: File[]) => {
    if (!todo) return;
    const file = files[0];
    submitAssignment(Number(todo.id), file, comment)
      .then(() => {
        updateTodoMutation.mutate(
          { id: todo.id, patch: { status: 'DONE' } },
          {
            onSuccess: () => {
              setSubmittedAt(Date.now());
            },
          }
        );
      })
      .catch(() => {
        // ignore submit errors for now
      });
  };

  if (!todo) {
    return (
      <div className="rounded-2xl bg-[#F5F5F5] p-6 text-sm text-neutral-500">
        과제 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500">멘토 과제</p>
            <h1 className="text-xl font-semibold text-neutral-900">{todo.title}</h1>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            뒤로
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-500">
          <span className="rounded-full bg-white px-2 py-0.5">{todo.subject}</span>
          <span className="rounded-full bg-white px-2 py-0.5">마감 {todo.dueDate} {todo.dueTime}</span>
          <span
            className={[
              'rounded-full px-2 py-0.5',
              statusLabel === '완료'
                ? 'bg-emerald-100 text-emerald-700'
                : isLate
                ? 'bg-rose-100 text-rose-600'
                : 'bg-neutral-200 text-neutral-600',
            ].join(' ')}
          >
            {statusLabel}
          </span>
        </div>
      </header>

      <section className="rounded-2xl bg-[#F5F5F5] p-4">
        <p className="text-lg font-semibold text-neutral-900">목표</p>
        <p className="mt-2 text-sm text-neutral-700">
          {todo.goal ?? '등록된 목표가 없습니다.'}
        </p>
      </section>

      <section className="rounded-2xl bg-[#F5F5F5] p-4">
        <p className="text-lg font-semibold text-neutral-900">진행 시간</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-neutral-700">
            {formatHMS(todo.studySeconds)}
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTodoId(todo.id);
              openPanel();
            }}
            className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white"
          >
            타이머
          </button>
        </div>
      </section>

      <AssignmentAttachmentCard
        guideFileName={todo.guideFileName}
        guideFileUrl={todo.guideFileUrl}
        mode="guide-only"
      />

      <AssignmentSubmissionCard
        onSubmit={handleSubmit}
        disabled={isDone}
      />

      <div className="rounded-2xl bg-[#F5F5F5] p-4 text-xs text-neutral-500">
        {isLate
          ? '마감 이후 제출은 지각 처리됩니다.'
          : '마감 전 제출하면 정상 처리됩니다.'}
        {submittedAt && (
          <span className="ml-2 text-neutral-600">제출 완료</span>
        )}
      </div>
    </div>
  );
}

function formatHMS(totalSeconds: number) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
