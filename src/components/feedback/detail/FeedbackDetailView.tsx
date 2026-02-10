'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTodoDetailQuery } from '@/src/hooks/todoQueries';
import { useFeedbackDetailQuery, useFeedbacksQuery } from '@/src/hooks/feedbackQueries';
import type { Feedback } from '@/src/lib/types/feedback';
import { readFeedbackPreview, storeFeedbackPreview } from '@/src/lib/utils/feedbackPreview';
import {
  createFeedbackComment,
  deleteFeedbackComment,
  listFeedbackComments,
  listFeedbacks,
  updateFeedbackComment,
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
  const todoItemId = Number(todoId);
  const { data: feedbacksByTodo = [] } = useFeedbacksQuery({
    todoItemId: Number.isFinite(todoItemId) ? todoItemId : undefined,
  });
  const { data: feedbacksAll = [] } = useFeedbacksQuery();
  const { data: feedbackDetail } = useFeedbackDetailQuery(
    Number.isFinite(todoItemId) ? todoItemId : undefined
  );
  const [directFeedback, setDirectFeedback] = useState<Feedback | null>(null);
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedRole: 'mentee' | 'mentor' =
    role ?? (pathname.startsWith('/mentor') ? 'mentor' : 'mentee');

  useEffect(() => {
    const previewFromUrl = searchParams.get('preview');
    if (previewFromUrl && previewFromUrl.trim().length > 0) {
      setPreviewMessage(previewFromUrl);
      storeFeedbackPreview(String(todoId), previewFromUrl);
      return;
    }
    setPreviewMessage(readFeedbackPreview(String(todoId)));
  }, [todoId, searchParams]);

  const matchedFeedback = useMemo(() => {
    const byTodo = feedbacksByTodo.find(
      (item) => String(item.todoItemId ?? '') === String(todoId)
    );
    if (byTodo) return byTodo;
    const byTodoFromAll = feedbacksAll.find(
      (item) => String(item.todoItemId ?? '') === String(todoId)
    );
    if (byTodoFromAll) return byTodoFromAll;
    const byFeedbackId = feedbacksAll.find((item) => item.id === String(todoId));
    if (byFeedbackId) return byFeedbackId;
    return (
      feedbackDetail ??
      null
    );
  }, [feedbacksByTodo, feedbacksAll, todoId, feedbackDetail]);

  useEffect(() => {
    if (matchedFeedback || !Number.isFinite(todoItemId)) return;
    let cancelled = false;
    async function hydrateFeedback() {
      try {
        const byTodo = await listFeedbacks({ todoItemId });
        if (cancelled) return;
        if (byTodo.length > 0) {
          setDirectFeedback(byTodo[0]);
          return;
        }
      } catch {
        // ignore and fallback to full list
      }
      try {
        const all = await listFeedbacks();
        if (cancelled) return;
        const fromAll =
          all.find((item) => String(item.todoItemId ?? '') === String(todoId)) ??
          all.find((item) => item.id === String(todoId)) ??
          null;
        setDirectFeedback(fromAll);
      } catch {
        if (!cancelled) setDirectFeedback(null);
      }
    }
    hydrateFeedback();
    return () => {
      cancelled = true;
    };
  }, [matchedFeedback, todoItemId, todoId]);

  const resolvedFeedback = matchedFeedback ?? directFeedback;
  const { data: todoFromRoute } = useTodoDetailQuery(todoId);
  const { data: todoFromFeedback } = useTodoDetailQuery(
    resolvedFeedback?.todoItemId ? String(resolvedFeedback.todoItemId) : undefined
  );
  const todo = todoFromFeedback ?? todoFromRoute ?? null;

  const feedbackSubjectLabel = useMemo(() => {
    const subject = resolvedFeedback?.subject;
    if (!subject) return undefined;
    if (subject === 'ENGLISH') return '영어';
    if (subject === 'MATH') return '수학';
    if (subject === 'ALL') return '전체';
    return '국어';
  }, [matchedFeedback?.subject]);

  const headerTitle =
    resolvedFeedback?.title ??
    resolvedFeedback?.todoTitle ??
    todo?.title ??
    '할 일';
  const headerSubtitle = todo
    ? `과목: ${todo.subject} · 상태: ${todo.status}`
    : feedbackSubjectLabel
    ? `과목: ${feedbackSubjectLabel}`
    : undefined;

  useEffect(() => {
    if (!resolvedFeedback?.id) return;
    setLoadingComments(true);
    setCommentError(null);
    listFeedbackComments(resolvedFeedback.id)
      .then((items) => {
        const mapped: Comment[] = items.map((item) => ({
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
  }, [resolvedFeedback?.id]);

  const handleSubmit = (content: string, role: 'mentee' | 'mentor') => {
    if (!resolvedFeedback?.id) return;
    const type = role === 'mentor' ? 'MENTOR_REPLY' : 'MENTEE_QUESTION';
    createFeedbackComment(resolvedFeedback.id, { type, content })
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

  const handleEditStart = (comment: Comment) => {
    setEditingId(comment.id);
    setEditingValue(comment.content);
    setCommentError(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleEditSave = (commentId: string) => {
    if (!resolvedFeedback?.id) return;
    const nextContent = editingValue.trim();
    if (!nextContent) return;
    updateFeedbackComment(resolvedFeedback.id, commentId, { content: nextContent })
      .then((updated) => {
        setComments((prev) =>
          prev.map((item) =>
            item.id === commentId ? { ...item, content: updated.content } : item
          )
        );
        handleEditCancel();
        setCommentError(null);
      })
      .catch(() => {
        setCommentError('댓글 수정에 실패했습니다.');
      });
  };

  const handleDelete = (commentId: string) => {
    if (!resolvedFeedback?.id) return;
    deleteFeedbackComment(resolvedFeedback.id, commentId)
      .then(() => {
        setComments((prev) => prev.filter((item) => item.id !== commentId));
        setCommentError(null);
      })
      .catch(() => {
        setCommentError('댓글 삭제에 실패했습니다.');
      });
  };

  const feedbackMessage =
    resolvedFeedback?.content?.trim() ||
    resolvedFeedback?.summary?.trim() ||
    resolvedFeedback?.title?.trim() ||
    (todo?.feedback && todo.feedback.trim().length > 0 ? todo.feedback : '') ||
    previewMessage ||
    '';

  useEffect(() => {
    if (!resolvedFeedback) return;
    const fallbackText =
      resolvedFeedback.content ||
      resolvedFeedback.summary ||
      resolvedFeedback.title ||
      '';
    storeFeedbackPreview(String(todoId), fallbackText);
  }, [resolvedFeedback, todoId]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <FeedbackDetailHeader
        title={headerTitle}
        subtitle={headerSubtitle}
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
          <FeedbackCommentThread
            comments={comments}
            currentRole={resolvedRole}
            editingId={editingId}
            editingValue={editingValue}
            onEditingChange={setEditingValue}
            onEditStart={handleEditStart}
            onEditCancel={handleEditCancel}
            onEditSave={handleEditSave}
            onDelete={handleDelete}
          />
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
