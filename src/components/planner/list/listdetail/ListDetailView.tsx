'use client';

import { use, useMemo } from 'react';
import { useTodosQuery } from '@/src/hooks/todoQueries';
import { useUpdateTodoMutation } from '@/src/hooks/todoQueries';
import type { TodoStatus } from '@/src/lib/types/planner';
import { isOverdueTask } from '@/src/lib/utils/todoStatus';
import AssignmentAttachmentCard from './AssignmentAttachmentCard';
import GoalMemoCard from './GoalMemoCard';
import ListDetailHeader from './ListDetailHeader';
import MentorFeedbackCard from './MentorFeedbackCard';
import TaskProgressCard from './TaskProgressCard';

type Props = {
  params: Promise<{ todoId: string }>;
};

export default function ListDetailView({ params }: Props) {
  const { todoId } = use(params);
  const { data: todos = [] } = useTodosQuery();
  const updateTodoMutation = useUpdateTodoMutation();
  const todo = useMemo(() => todos.find((item) => item.id === todoId), [todos, todoId]);
  const isLocked = todo ? isOverdueTask(todo) : false;
  const lockUncheck = !!todo?.isFixed && todo?.status === 'DONE';
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

  return (
    <div className="space-y-4">
      <ListDetailHeader
        title={todo?.title ?? ''}
        checked={todo?.status === 'DONE'}
        onToggle={toggleStatus}
        disabled={lockUncheck}
      />
      <TaskProgressCard
        statusLabel={statusLabel}
        studySeconds={todo?.studySeconds}
        isLocked={isLocked}
        isDone={todo?.status === 'DONE'}
        todoId={todo?.id ?? ''}
      />
      <GoalMemoCard />
      <MentorFeedbackCard feedback={todo?.feedback} />
      <AssignmentAttachmentCard
        guideFileName={todo?.guideFileName}
        guideFileUrl={todo?.guideFileUrl}
      />
    </div>
  );
}
