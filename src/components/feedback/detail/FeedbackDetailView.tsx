'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTodosQuery } from '@/src/hooks/todoQueries';
import { useFeedbacksQuery } from '@/src/hooks/feedbackQueries';
import { getTodoSnapshot as getMockTodoSnapshot } from '@/src/services/todo.mock';
import FeedbackDetailHeader from './FeedbackDetailHeader';
import FeedbackCommentThread from './FeedbackCommentThread';
import FeedbackCommentComposer from './FeedbackCommentComposer';

type Comment = {
  id: string;
  role: 'mentee' | 'mentor';
  content: string;
  createdAt: number;
};

type Props = {
  todoId: string;
  role?: 'mentee' | 'mentor';
};

function storageKey(todoId: string) {
  return `feedback-comments:${todoId}`;
}

export default function FeedbackDetailView({ todoId, role }: Props) {
  const { data: todos = [] } = useTodosQuery();
  const { data: feedbacks = [] } = useFeedbacksQuery();
  const todo = useMemo(() => {
    const sourceTodos = todos.length > 0 ? todos : getMockTodoSnapshot();
    return sourceTodos.find((item) => item.id === todoId);
  }, [todos, todoId]);
  const [comments, setComments] = useState<Comment[]>([]);
  const pathname = usePathname();
  const resolvedRole: 'mentee' | 'mentor' =
    role ?? (pathname.startsWith('/mentor') ? 'mentor' : 'mentee');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(storageKey(todoId));
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Comment[];
      if (Array.isArray(parsed)) {
        setComments(parsed);
      }
    } catch {
      // ignore parse errors
    }
  }, [todoId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(storageKey(todoId), JSON.stringify(comments));
  }, [todoId, comments]);

  const handleSubmit = (content: string, role: 'mentee' | 'mentor') => {
    const next: Comment = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role,
      content,
      createdAt: Date.now(),
    };
    setComments((prev) => [next, ...prev]);
  };

  const matchedFeedback = useMemo(() => {
    return feedbacks.find((item) => String(item.todoItemId ?? '') === String(todoId));
  }, [feedbacks, todoId]);

  const feedbackMessage =
    matchedFeedback?.content?.trim() ||
    matchedFeedback?.summary?.trim() ||
    (todo?.feedback && todo.feedback.trim().length > 0 ? todo.feedback : '');

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <FeedbackDetailHeader
        title={todo?.title ?? '할 일'}
        subtitle={todo ? `과목: ${todo.subject} · 상태: ${todo.status}` : undefined}
      />

      <section className="rounded-2xl bg-[#F5F5F5] p-5">
        <p className="text-lg font-semibold text-neutral-900">멘토 피드백</p>
        <p className="mt-3 text-sm text-neutral-700">
          {feedbackMessage || '아직 피드백이 등록되지 않았습니다.'}
        </p>
      </section>

      <section className="space-y-3">
        <p className="text-lg font-semibold text-neutral-900">질문/코멘트 스레드</p>
        <FeedbackCommentThread comments={comments} />
      </section>

      {resolvedRole === 'mentee' ? (
        <FeedbackCommentComposer role="mentee" onSubmit={handleSubmit} />
      ) : (
        <FeedbackCommentComposer role="mentor" onSubmit={handleSubmit} />
      )}
    </div>
  );
}
