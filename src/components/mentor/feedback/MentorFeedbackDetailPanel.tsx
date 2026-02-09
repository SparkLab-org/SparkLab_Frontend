'use client';

import { useEffect, useState } from 'react';
import type { Todo } from '@/src/lib/types/planner';
import { formatSeconds } from '@/src/components/mentor/feedback/mentorFeedbackUtils';
import { getProgressFillStyle } from '@/src/lib/utils/progressStyle';
import FeedbackCommentThread from '@/src/components/feedback/detail/FeedbackCommentThread';
import FeedbackCommentComposer from '@/src/components/feedback/detail/FeedbackCommentComposer';
import {
  createFeedbackComment,
  listFeedbackComments,
} from '@/src/services/feedback.api';

type Props = {
  todo: Todo | null;
  progressPercent: number;
  feedbackText: string;
  feedbackId?: string;
  onOpenModal: () => void;
};

export default function MentorFeedbackDetailPanel({
  todo,
  progressPercent,
  feedbackText,
  feedbackId,
  onOpenModal,
}: Props) {
  const [comments, setComments] = useState<
    { id: string; role: 'mentee' | 'mentor'; content: string; createdAt: number }[]
  >([]);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (!feedbackId) {
      setComments([]);
      setCommentError(null);
      return;
    }
    setCommentLoading(true);
    setCommentError(null);
    listFeedbackComments(feedbackId)
      .then((items) => {
        const mapped = items.map((item) => ({
          id: String(item.feedbackCommentId),
          role: item.type === 'MENTOR_REPLY' ? 'mentor' : 'mentee',
          content: item.content,
          createdAt: item.createTime ? Date.parse(item.createTime) : Date.now(),
        }));
        setComments(mapped);
        setCommentLoading(false);
      })
      .catch(() => {
        setCommentError('댓글을 불러오지 못했습니다.');
        setComments([]);
        setCommentLoading(false);
      });
  }, [feedbackId]);

  const handleSubmitComment = (content: string) => {
    if (!feedbackId) return;
    createFeedbackComment(feedbackId, { type: 'MENTOR_REPLY', content })
      .then((created) => {
        const next = {
          id: String(created.feedbackCommentId),
          role: 'mentor' as const,
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

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">
          {todo?.title ?? '과제를 선택해 주세요'}
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          {todo
            ? `${todo.subject} · ${todo.dueDate ?? ''} ${todo.dueTime}`
            : '멘티의 과제를 선택하면 상세 정보를 확인할 수 있습니다.'}
        </p>
      </div>

      <section className="rounded-3xl bg-[#F5F5F5] p-5">
        <h3 className="text-sm font-semibold text-neutral-900">학습 기록</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold text-neutral-500">학습 시간</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {formatSeconds(todo?.studySeconds)}
            </p>
            <p className="mt-2 text-[10px] text-neutral-400">
              마감 시간 {todo?.dueTime ?? '--:--'}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>학습 진행도</span>
              <span className="font-semibold text-neutral-900">{progressPercent}%</span>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full bg-[#D5EBFF]">
              <div
                className="h-full rounded-full"
                style={getProgressFillStyle(progressPercent)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-900">학습 점검</h3>
        <div className="min-h-[120px] rounded-3xl bg-white p-4 text-sm text-neutral-600">
          {feedbackText || (
            <div className="space-y-2 text-neutral-300">
              <div className="h-3 w-full rounded-full bg-neutral-200" />
              <div className="h-3 w-4/5 rounded-full bg-neutral-200" />
              <div className="h-3 w-3/5 rounded-full bg-neutral-200" />
            </div>
          )}
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-900">멘티 제출물</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {todo?.guideFileUrl ? (
            <a
              href={todo.guideFileUrl}
              className="flex h-24 items-center justify-center rounded-2xl bg-neutral-200 text-xs text-neutral-500"
            >
              {todo.guideFileName ?? '첨부파일'}
            </a>
          ) : (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="h-24 rounded-2xl bg-neutral-200"
              />
            ))
          )}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenModal}
          disabled={!todo}
          className={[
            'w-full rounded-xl px-4 py-2 text-sm font-semibold',
            todo
              ? 'bg-neutral-200 text-neutral-700'
              : 'cursor-not-allowed bg-neutral-100 text-neutral-400',
          ].join(' ')}
        >
          피드백 작성
        </button>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-900">질문/코멘트</h3>
        {!feedbackId ? (
          <div className="rounded-2xl bg-[#F5F5F5] p-4 text-sm text-neutral-500">
            피드백을 작성한 뒤 댓글을 남길 수 있습니다.
          </div>
        ) : commentLoading ? (
          <div className="rounded-2xl bg-[#F5F5F5] p-4 text-sm text-neutral-500">
            댓글을 불러오는 중...
          </div>
        ) : (
          <FeedbackCommentThread comments={comments} />
        )}
        {commentError && (
          <p className="text-xs font-semibold text-rose-500">{commentError}</p>
        )}
        {feedbackId && (
          <FeedbackCommentComposer
            role="mentor"
            onSubmit={(content) => handleSubmitComment(content)}
          />
        )}
      </section>
    </section>
  );
}
