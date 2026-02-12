'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTodoDetailQuery } from '@/src/hooks/todoQueries';
import { useFeedbackDetailQuery, useFeedbacksQuery } from '@/src/hooks/feedbackQueries';
import type { Feedback } from '@/src/lib/types/feedback';
import { readFeedbackPreview, storeFeedbackPreview } from '@/src/lib/utils/feedbackPreview';
import { getTodoDetailHref } from '@/src/lib/utils/todoLink';
import { getTodoStatusLabel, getTodoType } from '@/src/lib/utils/todoStatus';
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
  const [commentError, setCommentError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resolvedRole: 'mentee' | 'mentor' =
    role ?? (pathname.startsWith('/mentor') ? 'mentor' : 'mentee');
  const backHref = pathname.startsWith('/mentor') ? '/mentor/feedback' : '/feedback';
  const queryClient = useQueryClient();

  const previewFromUrl = searchParams.get('preview');
  const previewMessage = useMemo(() => {
    if (previewFromUrl && previewFromUrl.trim().length > 0) {
      return previewFromUrl;
    }
    return readFeedbackPreview(String(todoId));
  }, [previewFromUrl, todoId]);

  useEffect(() => {
    if (previewFromUrl && previewFromUrl.trim().length > 0) {
      storeFeedbackPreview(String(todoId), previewFromUrl);
    }
  }, [previewFromUrl, todoId]);

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

  const subjectBadgeLabel = todo?.subject ?? feedbackSubjectLabel;
  const statusBadgeLabel = todo ? getTodoStatusLabel(todo) : undefined;
  const moveLabel = todo ? `해당 ${getTodoType(todo)} 이동` : '해당 항목으로 이동';
  const detailHref = todo ? getTodoDetailHref(todo) : undefined;

  const headerTitle =
    resolvedFeedback?.title ??
    resolvedFeedback?.todoTitle ??
    todo?.title ??
    '할 일';
  const headerSubtitle = !todo && feedbackSubjectLabel ? `과목: ${feedbackSubjectLabel}` : undefined;

  const commentQueryKey = useMemo(
    () => ['feedbackComments', resolvedFeedback?.id ?? 'none'],
    [resolvedFeedback?.id]
  );
  const {
    data: comments = [],
    isLoading: loadingComments,
    isError: commentLoadFailed,
  } = useQuery({
    queryKey: commentQueryKey,
    queryFn: () => listFeedbackComments(resolvedFeedback?.id as string),
    enabled: Boolean(resolvedFeedback?.id),
    select: (items): Comment[] =>
      items.map((item) => ({
        id: String(item.feedbackCommentId),
        role: item.type === 'MENTOR_REPLY' ? 'mentor' : 'mentee',
        content: item.content,
        createdAt: item.createTime ? Date.parse(item.createTime) : 0,
      })),
  });

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
        queryClient.setQueryData<Comment[]>(commentQueryKey, (prev) => {
          const safe = Array.isArray(prev) ? prev : [];
          return [next, ...safe];
        });
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
        queryClient.setQueryData<Comment[]>(commentQueryKey, (prev) => {
          const safe = Array.isArray(prev) ? prev : [];
          return safe.map((item) =>
            item.id === commentId ? { ...item, content: updated.content } : item
          );
        });
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
        queryClient.setQueryData<Comment[]>(commentQueryKey, (prev) => {
          const safe = Array.isArray(prev) ? prev : [];
          return safe.filter((item) => item.id !== commentId);
        });
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
    <div className="mx-auto max-w-3xl space-y-5 rounded-[28px] bg-[#F6F8FA] p-4 sm:p-6">
      <div className="flex items-center">
        <Link
          href={backHref}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition hover:-translate-y-0.5 hover:text-neutral-900"
          aria-label="뒤로가기"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
      </div>

      <section className="rounded-3xl bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
        <FeedbackDetailHeader
          title={headerTitle}
          subtitle={headerSubtitle}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {subjectBadgeLabel && (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
                {subjectBadgeLabel}
              </span>
            )}
            {statusBadgeLabel && statusBadgeLabel !== '완료' && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-500 ring-1 ring-neutral-200">
                {statusBadgeLabel}
              </span>
            )}
          </div>
          {detailHref && (
            <Link
              href={detailHref}
              className="rounded-full bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(21,0,255,0.2)] transition hover:-translate-y-0.5"
            >
              {moveLabel}
            </Link>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
        <p className="text-sm font-semibold text-neutral-500">멘토 피드백</p>
        <p className="mt-3 text-sm font-semibold text-neutral-700">
          {feedbackMessage || '아직 피드백이 등록되지 않았습니다.'}
        </p>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
        <p className="text-sm font-semibold text-neutral-900">질문/코멘트</p>
        <div className="mt-4">
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
        </div>
        {commentError && (
          <p className="mt-3 text-xs font-semibold text-rose-500">{commentError}</p>
        )}
        {commentLoadFailed && !commentError && (
          <p className="mt-3 text-xs font-semibold text-rose-500">
            댓글을 불러오지 못했습니다.
          </p>
        )}
        <div className="mt-4">
          {resolvedRole === 'mentee' ? (
            <FeedbackCommentComposer role="mentee" onSubmit={handleSubmit} />
          ) : (
            <FeedbackCommentComposer role="mentor" onSubmit={handleSubmit} />
          )}
        </div>
      </section>
    </div>
  );
}
