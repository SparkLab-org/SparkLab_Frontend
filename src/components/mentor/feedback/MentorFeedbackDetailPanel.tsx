'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Todo } from '@/src/lib/types/planner';
import { formatSeconds } from '@/src/components/mentor/feedback/mentorFeedbackUtils';
import FeedbackCommentThread from '@/src/components/feedback/detail/FeedbackCommentThread';
import FeedbackCommentComposer from '@/src/components/feedback/detail/FeedbackCommentComposer';
import { useTodoDetailQuery } from '@/src/hooks/todoQueries';
import { useMenteeAssignmentsQuery } from '@/src/hooks/assignmentQueries';
import {
  createFeedbackComment,
  listFeedbackComments,
} from '@/src/services/feedback.api';
import {
  listAssignmentSubmissions,
  type AssignmentSubmissionResponse,
} from '@/src/services/assignment.api';
import { downloadFile } from '@/src/lib/utils/downloadFile';
import { resolveAssignmentId } from '@/src/lib/utils/assignment';

type Props = {
  todo: Todo | null;
  feedbackText: string;
  feedbackId?: string;
  onOpenModal: () => void;
};

function formatPeriodTime(value?: string) {
  if (!value) return '';
  const [hhRaw, mmRaw] = value.split(':');
  const hour24 = Number(hhRaw);
  const minute = Number(mmRaw ?? '0');
  if (!Number.isFinite(hour24) || !Number.isFinite(minute)) return value;
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${period} ${hour12}:${String(minute).padStart(2, '0')}`;
}

function formatKoreanDate(value?: string) {
  if (!value) return '';
  const parts = value.split('-');
  if (parts.length < 3) return value;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return value;
  return `${year}년 ${month}월 ${day}일`;
}

function formatKoreanDateTimeFromIso(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${year}년 ${month}월 ${day}일 ${period} ${hour12}:${String(minutes).padStart(2, '0')}`;
}

export default function MentorFeedbackDetailPanel({
  todo,
  feedbackText,
  feedbackId,
  onOpenModal,
}: Props) {
  const { data: detailTodo } = useTodoDetailQuery(todo?.id);
  const resolvedTodo = detailTodo ?? todo;
  const menteeNumericId = useMemo(() => {
    const value = resolvedTodo?.assigneeId;
    if (!value) return undefined;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }, [resolvedTodo?.assigneeId]);
  const { data: assignmentGroups = [] } = useMenteeAssignmentsQuery({
    menteeId: menteeNumericId,
    enabled: Number.isFinite(menteeNumericId),
  });
  const assignmentId = useMemo(
    () =>
      resolveAssignmentId({
        todo: resolvedTodo,
        assignmentGroups,
      }) ?? null,
    [assignmentGroups, resolvedTodo]
  );
  const queryClient = useQueryClient();
  const [commentError, setCommentError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const {
    data: commentItems = [],
    isLoading: commentLoading,
    isError: commentLoadFailed,
  } = useQuery({
    queryKey: ['feedbackComments', feedbackId ?? 'none'],
    queryFn: () => listFeedbackComments(feedbackId as string),
    enabled: Boolean(feedbackId),
    staleTime: 30 * 1000,
  });

  const comments = useMemo(
    () =>
      commentItems.map((item) => ({
        id: String(item.feedbackCommentId),
        role: (item.type === 'MENTOR_REPLY' ? 'mentor' : 'mentee') as
          | 'mentor'
          | 'mentee',
        content: item.content,
        createdAt: item.createTime ? Date.parse(item.createTime) : 0,
      })),
    [commentItems]
  );

  const {
    data: submissionData,
    isLoading: submissionLoading,
    isError: submissionFailed,
  } = useQuery({
    queryKey: ['assignmentSubmissions', assignmentId ?? 'none'],
    queryFn: () => listAssignmentSubmissions(assignmentId as number),
    enabled: typeof assignmentId === 'number',
    staleTime: 30 * 1000,
  });

  const submissionError = submissionFailed ? '제출물을 불러오지 못했습니다.' : null;

  const submissions = submissionData?.submissions ?? [];
  const latestSubmission = useMemo(() => {
    if (submissions.length === 0) return null;
    return submissions.reduce<AssignmentSubmissionResponse | null>((latest, current) => {
      if (!latest) return current;
      const latestTime = latest.createTime ? Date.parse(latest.createTime) : 0;
      const currentTime = current.createTime ? Date.parse(current.createTime) : 0;
      return currentTime >= latestTime ? current : latest;
    }, null);
  }, [submissions]);
  const submissionCount = submissions.length;

  const handleSubmitComment = (content: string) => {
    if (!feedbackId) return;
    createFeedbackComment(feedbackId, { type: 'MENTOR_REPLY', content })
      .then((created) => {
        queryClient.setQueryData(['feedbackComments', feedbackId], (old) => {
          const items = Array.isArray(old) ? old : [];
          return [...items, created];
        });
        setCommentError(null);
      })
      .catch(() => {
        setCommentError('댓글 등록에 실패했습니다.');
      });
  };

  const handleDownload = async (url?: string | null, name?: string | null) => {
    if (!url) return;
    setDownloadError(null);
    try {
      await downloadFile(url, name ?? undefined);
    } catch {
      try {
        window.open(url, '_blank', 'noopener,noreferrer');
      } catch {
        setDownloadError('다운로드에 실패했습니다.');
      }
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-[24px] font-semibold text-neutral-900">
          {resolvedTodo?.title ?? '과제를 선택해 주세요'}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          {resolvedTodo?.subject && (
            <span className="inline-flex rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
              {resolvedTodo.subject}
            </span>
          )}
          <span>
            {resolvedTodo
              ? latestSubmission?.createTime
                ? formatKoreanDateTimeFromIso(latestSubmission.createTime)
                : `${formatKoreanDate(resolvedTodo.dueDate)} ${formatPeriodTime(resolvedTodo.dueTime)}`
              : '멘티의 과제를 선택하면 상세 정보를 확인할 수 있습니다.'}
          </span>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-5">
        <h3 className="text-sm font-semibold text-neutral-900">학습 기록</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#F6F8FA] p-4">
            <p className="text-[14px] font-semibold text-neutral-500">학습 시간</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {formatSeconds(resolvedTodo?.studySeconds)}
            </p>
          </div>
          <div className="rounded-2xl bg-[#F6F8FA] p-4">
            <div className="flex items-center justify-between text-[14px] font-semibold text-neutral-500">
              <span>멘티 제출물</span>
              <span className="font-semibold text-neutral-900">{submissionCount}</span>
            </div>
            <div className="mt-3 space-y-2">
              {submissionLoading ? (
                <div className="text-sm text-neutral-500">제출물을 불러오는 중...</div>
              ) : submissionError ? (
                <div className="text-sm text-rose-500">{submissionError}</div>
              ) : submissions.length === 0 ? (
                <div className="text-sm text-neutral-500">제출 파일이 아직 없습니다.</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {submissions.map((item, index) => (
                    <div
                      key={`${item.submissionId ?? 'submission'}-${index}`}
                      className="space-y-1"
                    >
                      <div className="group flex h-20 items-center justify-center overflow-hidden rounded-2xl bg-neutral-200 text-[10px] text-neutral-500">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt="제출물"
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          '첨부파일'
                        )}
                      </div>
                      {item.imageUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(item.imageUrl, `submission-${item.submissionId}`)
                          }
                          className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[10px] font-semibold text-neutral-700 hover:text-neutral-900"
                        >
                          다운로드
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-400"
                        >
                          다운로드
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {downloadError && (
                <p className="text-xs font-semibold text-rose-500">{downloadError}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-neutral-900">멘티 코멘트</h3>
        <div className="min-h-[88px] rounded-2xl bg-white p-4 text-sm text-neutral-700">
          {latestSubmission?.comment?.trim()
            ? latestSubmission.comment
            : '등록된 코멘트가 없습니다.'}
        </div>
      </section>

      {feedbackId || feedbackText.trim() ? (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-900">피드백</h3>
            <button
              type="button"
              onClick={onOpenModal}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              수정
            </button>
          </div>
          <div className="min-h-[120px] rounded-3xl bg-white p-4 text-sm text-neutral-600">
            {feedbackText.trim() ? (
              <p className="whitespace-pre-line">{feedbackText}</p>
            ) : (
              '피드백 내용이 없습니다.'
            )}
          </div>
        </section>
      ) : (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenModal}
            disabled={!todo}
            className={[
              'w-full rounded-xl px-4 py-2 text-sm font-semibold',
              todo
                ? 'bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] text-white'
                : 'cursor-not-allowed bg-neutral-100 text-neutral-400',
            ].join(' ')}
          >
            피드백 작성
          </button>
        </div>
      )}

      {feedbackId && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-900">질문/코멘트</h3>
          {commentLoading ? (
            <div className="rounded-2xl bg-white p-4 text-sm text-neutral-500">
              댓글을 불러오는 중...
            </div>
          ) : (
            <FeedbackCommentThread comments={comments} />
          )}
          {commentError && (
            <p className="text-xs font-semibold text-rose-500">{commentError}</p>
          )}
          {commentLoadFailed && (
            <p className="text-xs font-semibold text-rose-500">
              댓글을 불러오지 못했습니다.
            </p>
          )}
          <FeedbackCommentComposer
            role="mentor"
            onSubmit={(content) => handleSubmitComment(content)}
          />
        </section>
      )}
    </section>
  );
}
