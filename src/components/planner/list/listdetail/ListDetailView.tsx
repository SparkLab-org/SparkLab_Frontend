'use client';

import { use, useMemo } from 'react';
import { useTodosQuery } from '@/src/hooks/todoQueries';
import { useUpdateTodoMutation } from '@/src/hooks/todoQueries';
import type { TodoStatus } from '@/src/lib/types/planner';
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

  const toggleStatus = () => {
    if (!todo) return;
    const nextStatus: TodoStatus = todo.status === 'DONE' ? 'TODO' : 'DONE';
    updateTodoMutation.mutate({ id: todo.id, patch: { status: nextStatus } });
  };

  const recordStudyMinutes = (elapsedSeconds: number) => {
    if (!todo) return;
    if (elapsedSeconds <= 0) return;
    const minutesToAdd = Math.ceil(elapsedSeconds / 60);
    if (minutesToAdd <= 0) return;
    updateTodoMutation.mutate({
      id: todo.id,
      patch: { studyMinutes: (todo.studyMinutes ?? 0) + minutesToAdd },
    });
  };

  return (
    <div className="space-y-4">
      <ListDetailHeader title={todo?.title ?? ''} checked={todo?.status === 'DONE'} onToggle={toggleStatus} />
      <TaskProgressCard
        status={todo?.status}
        studyMinutes={todo?.studyMinutes}
        onRecord={recordStudyMinutes}
      />
      <GoalMemoCard />
      <MentorFeedbackCard feedback={todo?.feedback} />
      <AssignmentAttachmentCard />
    </div>
  );
}
