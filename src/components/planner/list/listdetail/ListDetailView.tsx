'use client';

import { use, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTodosQuery } from '@/src/hooks/todoQueries';
import { useDeleteTodoMutation, useUpdateTodoMutation } from '@/src/hooks/todoQueries';
import type { TodoStatus } from '@/src/lib/types/planner';
import { isOverdueTask } from '@/src/lib/utils/todoStatus';
import AssignmentAttachmentCard from './AssignmentAttachmentCard';
import GoalMemoCard from './GoalMemoCard';
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
  const updateTodoMutation = useUpdateTodoMutation();
  const deleteTodoMutation = useDeleteTodoMutation();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const todo = useMemo(() => todos.find((item) => item.id === todoId), [todos, todoId]);
  const isLocked = todo ? isOverdueTask(todo) : false;
  const lockUncheck = !!todo?.isFixed;
  const statusLabel = todo
    ? isLocked
      ? todo.status === 'DONE'
        ? '지각'
        : '미제출'
      : todo.status === 'DONE'
      ? '완료'
      : '진행중'
    : '진행중';

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
    <div className="space-y-4">
      <ListDetailHeader
        title={todo?.title ?? ''}
        checked={todo?.status === 'DONE'}
        onToggle={toggleStatus}
        disabled={lockUncheck}
      />
      {!todo?.isFixed && (
        <div className="flex justify-end gap-2">
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
      <TaskProgressCard
        statusLabel={statusLabel}
        studySeconds={todo?.studySeconds}
        isLocked={isLocked}
        isDone={todo?.status === 'DONE'}
        todoId={todo?.id ?? ''}
      />
      <GoalMemoCard />
      <MentorFeedbackCard feedback={todo?.feedback} todoId={todo?.id} />
      <AssignmentAttachmentCard
        guideFileName={todo?.guideFileName}
        guideFileUrl={todo?.guideFileUrl}
      />

      {todo && editOpen && (
        <TodoEditModal
          todo={todo}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
