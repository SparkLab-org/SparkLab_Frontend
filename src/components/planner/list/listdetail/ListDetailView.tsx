'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTodoDetailQuery, useTodosQuery } from '@/src/hooks/todoQueries';
import { useFeedbacksQuery } from '@/src/hooks/feedbackQueries';
import { useDeleteTodoMutation, useUpdateTodoMutation } from '@/src/hooks/todoQueries';
import type { TodoStatus } from '@/src/lib/types/planner';
import { getTodoType, parseTodoDueAt, isOverdueTask } from '@/src/lib/utils/todoStatus';
import { readFeedbackPreview } from '@/src/lib/utils/feedbackPreview';
import ListDetailHeader from './ListDetailHeader';
import MentorFeedbackCard from './MentorFeedbackCard';
import TaskProgressCard from './TaskProgressCard';
import TodoEditModal from '../../todo/TodoEditModal';

type Props = {
  params: Promise<{ todoId: string }>;
};

export default function ListDetailView({ params }: Props) {
  const { todoId } = use(params);
  const { data: todos = [] } = useTodosQuery();
  const { data: todoDetail } = useTodoDetailQuery(todoId);
  const todoItemId = Number(todoId);
  const { data: feedbacks = [] } = useFeedbacksQuery({
    todoItemId: Number.isFinite(todoItemId) ? todoItemId : undefined,
  });
  const updateTodoMutation = useUpdateTodoMutation();
  const deleteTodoMutation = useDeleteTodoMutation();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const todo = useMemo(
    () => todoDetail ?? todos.find((item) => item.id === todoId),
    [todoDetail, todos, todoId]
  );
  const typeLabel = todo ? getTodoType(todo) : null;
  const subjectLabel = todo?.subject ?? null;
  const dueLabel = useMemo(() => {
    if (!todo?.dueDate) return null;
    const dueAt = parseTodoDueAt(todo.dueDate, todo.dueTime);
    if (!dueAt) return null;
    const month = dueAt.getMonth() + 1;
    const day = dueAt.getDate();
    const hour24 = dueAt.getHours();
    const period = hour24 < 12 ? 'AM' : 'PM';
    const hour = hour24 % 12 || 12;
    const minute = String(dueAt.getMinutes()).padStart(2, '0');
    return `${month}월 ${day}일 ${period} ${hour}:${minute}`;
  }, [todo?.dueDate, todo?.dueTime]);
  const feedbackText = useMemo(() => {
    const first = feedbacks[0];
    if (!first) return null;
    return (
      first.content?.trim() ||
      first.summary?.trim() ||
      first.title?.trim() ||
      null
    );
  }, [feedbacks]);
  const previewFeedback = useMemo(() => readFeedbackPreview(String(todoId)), [todoId]);
  const mentorFeedback = feedbackText ?? todo?.feedback ?? previewFeedback ?? null;
  const isLocked = todo ? isOverdueTask(todo) : false;
  const lockUncheck = !!todo?.isFixed;
  const statusLabel = todo
    ? todo.status === 'DONE'
      ? '완료'
      : (todo.studySeconds ?? 0) > 0
      ? '진행중'
      : '시작전'
    : '시작전';
  const progressTitle = typeLabel ? `${typeLabel} 진행` : '학습 진행';
  const statusBadgeStyles =
    statusLabel === '완료'
      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
      : statusLabel === '진행중'
      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
      : 'bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200';

  const toggleStatus = () => {
    if (!todo) return;
    if (lockUncheck) return;
    const nextStatus: TodoStatus = todo.status === 'DONE' ? 'TODO' : 'DONE';
    updateTodoMutation.mutate({ id: todo.id, patch: { status: nextStatus } });
  };

  const handleDelete = () => {
    if (!todo || todo.isFixed) return;
    const ok = window.confirm('이 할 일을 삭제할까요?');
    if (!ok) return;
    deleteTodoMutation.mutate(todo.id, {
      onSuccess: () => {
        router.push('/planner/list');
      },
    });
  };

  return (
    <div className="space-y-5 rounded-[28px] bg-[#F6F8FA] p-4 sm:p-6">
      <section className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400">
                <span className="h-2 w-2 rounded-full bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)]" />
                학습 상세
              </div>
              <ListDetailHeader
                title={todo?.title ?? ''}
                checked={todo?.status === 'DONE'}
                onToggle={toggleStatus}
                disabled={lockUncheck}
              />
            </div>
            {!todo?.isFixed && (
              <div className="relative flex justify-end">
                <button
                  type="button"
                  onClick={() => setActionMenuOpen((prev) => !prev)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 shadow-sm transition hover:-translate-y-0.5"
                  aria-label="작업 메뉴"
                >
                  ⋯
                </button>
                {actionMenuOpen && (
                  <div className="absolute right-0 top-11 z-10 w-32 rounded-2xl border border-neutral-200 bg-white p-1 text-xs font-semibold text-neutral-700 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setActionMenuOpen(false);
                        setEditOpen(true);
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left hover:bg-neutral-50"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionMenuOpen(false);
                        handleDelete();
                      }}
                      className="w-full rounded-xl px-3 py-2 text-left text-rose-500 hover:bg-rose-50"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {subjectLabel && (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                {subjectLabel}
              </span>
            )}
            {typeLabel && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-500 ring-1 ring-neutral-200">
                {typeLabel}
              </span>
            )}
            {dueLabel && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-500 ring-1 ring-neutral-200">
                {dueLabel}
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <TaskProgressCard
          title={progressTitle}
          statusLabel={statusLabel}
          studySeconds={todo?.studySeconds}
          isLocked={isLocked}
          isDone={todo?.status === 'DONE'}
          todoId={todo?.id ?? ''}
        />
        <MentorFeedbackCard feedback={mentorFeedback} todoId={todo?.id} />
      </div>

      {todo && editOpen && (
        <TodoEditModal
          todo={todo}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
