'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTodoDetailQuery, useTodosQuery } from '@/src/hooks/todoQueries';
import { useFeedbacksQuery } from '@/src/hooks/feedbackQueries';
import { useDeleteTodoMutation, useUpdateTodoMutation } from '@/src/hooks/todoQueries';
import type { TodoStatus } from '@/src/lib/types/planner';
import { isOverdueTask } from '@/src/lib/utils/todoStatus';
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
  const todo = useMemo(
    () => todoDetail ?? todos.find((item) => item.id === todoId),
    [todoDetail, todos, todoId]
  );
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
    <div className="space-y-6">
      <section className="rounded-2xl bg-[#F6F8FA] p-5">
        <ListDetailHeader
          title={todo?.title ?? ''}
          checked={todo?.status === 'DONE'}
          onToggle={toggleStatus}
          disabled={lockUncheck}
        />
        {!todo?.isFixed && (
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              수정
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50"
            >
              삭제
            </button>
          </div>
        )}
      </section>
      <TaskProgressCard
        statusLabel={statusLabel}
        studySeconds={todo?.studySeconds}
        isLocked={isLocked}
        isDone={todo?.status === 'DONE'}
        todoId={todo?.id ?? ''}
      />
      <MentorFeedbackCard feedback={mentorFeedback} todoId={todo?.id} />

      {todo && editOpen && (
        <TodoEditModal
          todo={todo}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
