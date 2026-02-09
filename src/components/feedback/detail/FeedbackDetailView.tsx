'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTodosQuery } from '@/src/hooks/todoQueries';
import { useFeedbacksQuery } from '@/src/hooks/feedbackQueries';
import {
  createFeedbackComment,
  listFeedbackComments,
} from '@/src/services/feedback.api';
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

export default function FeedbackDetailView({ todoId, role }: Props) {
  const { data: todos = [] } = useTodosQuery();
  const todoItemId = Number(todoId);
  const { data: feedbacks = [] } = useFeedbacksQuery({
    todoItemId: Number.isFinite(todoItemId) ? todoItemId : undefined,
  });
  const todo = useMemo(() => {
    return todos.find((item) => item.id === todoId);
  }, [todos, todoId]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const pathname = usePathname();
  const resolvedRole: 'mentee' | 'mentor' =
    role ?? (pathname.startsWith('/mentor') ? 'mentor' : 'mentee');

  useEffect(() => {
    if (!matchedFeedback?.id) return;
    setLoadingComments(true);
    setCommentError(null);
    listFeedbackComments(matchedFeedback.id)
      .then((items) => {
        const mapped = items.map((item) => ({
          id: String(item.feedbackCommentId),
          role: item.type === 'MENTOR_REPLY' ? 'mentor' : 'mentee',
          content: item.content,
          createdAt: item.createTime ? Date.parse(item.createTime) : Date.now(),
        }));
        setComments(mapped);
        setLoadingComments(false);
      })
      .catch(() => {
        setCommentError('댓글을 불러오지 못했습니다.');
        setComments([]);
        setLoadingComments(false);
      });
  }, [matchedFeedback?.id]);

  const handleSubmit = (content: string, role: 'mentee' | 'mentor') => {
    if (!matchedFeedback?.id) return;
    const type = role === 'mentor' ? 'MENTOR_REPLY' : 'MENTEE_QUESTION';
    createFeedbackComment(matchedFeedback.id, { type, content })
      .then((created) => {
        const next: Comment = {
          id: String(created.feedbackCommentId),
          role,
          content: created.content,
          createdAt: created.createTime ? Date.parse(created.createTime) : Date.now(),
        };
        setComments((prev) => [next, ...prev]);
        setCommentError(null);
      })
      .catch(() => {
        setCommentError('댓글 등록에 실패했습니다.');
      });
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
        {loadingComments ? (
          <div className="rounded-2xl bg-[#F5F5F5] p-4 text-sm text-neutral-500">
            댓글을 불러오는 중...
          </div>
        ) : (
          <FeedbackCommentThread comments={comments} />
        )}
        {commentError && (
          <p className="text-xs font-semibold text-rose-500">{commentError}</p>
        )}
      </section>

      {resolvedRole === 'mentee' ? (
        <FeedbackCommentComposer role="mentee" onSubmit={handleSubmit} />
      ) : (
        <FeedbackCommentComposer role="mentor" onSubmit={handleSubmit} />
      )}
    </div>
  );
}
