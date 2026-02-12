'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTodoDetailQuery, useUpdateTodoMutation } from '@/src/hooks/todoQueries';
import { useAuthMeQuery } from '@/src/hooks/authQueries';
import { useFeedbacksQuery } from '@/src/hooks/feedbackQueries';
import {
  mapAssignmentToTodo,
  useMenteeAssignmentsQuery,
} from '@/src/hooks/assignmentQueries';
import { getTodoStatusLabel, isOverdueTask, parseTodoDueAt } from '@/src/lib/utils/todoStatus';
import { resolveAssignmentId, resolveAssignmentMatch } from '@/src/lib/utils/assignment';
import AssignmentSubmissionCard from './AssignmentSubmissionCard';
import AssignmentAttachmentCard from '../list/listdetail/AssignmentAttachmentCard';
import MentorFeedbackCard from '../list/listdetail/MentorFeedbackCard';
import { readFeedbackPreview } from '@/src/lib/utils/feedbackPreview';
import { useTimerStore } from '@/src/store/timerStore';
import mentorTodoIcon from '@/src/assets/icons/mentorTodo.svg';
import {
  submitAssignment,
  listAssignmentSubmissions,
  updateAssignmentSubmission,
  deleteAssignmentSubmission,
  deleteAssignmentSubmissionComment,
  type AssignmentSubmissionResponse,
} from '@/src/services/assignment.api';

type Props = {
  todoId: string;
};

export default function AssignmentDetailView({ todoId }: Props) {
  const router = useRouter();
  const { data: detailTodo, isLoading } = useTodoDetailQuery(todoId);
  const { data: me } = useAuthMeQuery();
  const menteeId = typeof me?.menteeId === 'number' ? me.menteeId : undefined;
  const { data: assignmentGroups = [] } = useMenteeAssignmentsQuery({ menteeId });
  const updateTodoMutation = useUpdateTodoMutation();
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [isSubmissionMenuOpen, setIsSubmissionMenuOpen] = useState(false);
  const [isSubmissionBusy, setIsSubmissionBusy] = useState(false);
  const updateFileRef = useRef<HTMLInputElement | null>(null);
  const openPanel = useTimerStore((s) => s.openPanel);
  const setActiveTodoId = useTimerStore((s) => s.setActiveTodoId);

  const storedAssignmentIdOverride = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const scopedKey = todoId ? `assignmentIdOverride:${todoId}` : null;
    const raw =
      (scopedKey ? window.localStorage.getItem(scopedKey) : null) ??
      window.localStorage.getItem('assignmentIdOverride');
    const override = raw ? Number(raw) : NaN;
    return Number.isFinite(override) ? override : undefined;
  }, [todoId]);

  const assignmentMatch = useMemo(
    () =>
      resolveAssignmentMatch({
        todoId,
        todo: detailTodo,
        assignmentGroups,
        overrideAssignmentId: storedAssignmentIdOverride,
      }),
    [assignmentGroups, detailTodo, storedAssignmentIdOverride, todoId]
  );
  const listTodo = assignmentMatch
    ? mapAssignmentToTodo(assignmentMatch, {
        accountId:
          assignmentGroups.find((group) =>
            (group.assignments ?? []).includes(assignmentMatch)
          )?.accountId ?? undefined,
        menteeId: assignmentMatch.menteeId ?? menteeId,
      })
    : null;
  const todo = detailTodo ?? listTodo;
  const todoItemId = Number(todo?.id ?? todoId);
  const { data: feedbacks = [] } = useFeedbacksQuery({
    todoItemId: Number.isFinite(todoItemId) ? todoItemId : undefined,
  });
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
  const previewFeedback = useMemo(
    () => readFeedbackPreview(String(todo?.id ?? todoId)),
    [todo?.id, todoId]
  );
  const mentorFeedback =
    feedbackText ?? (todo as { feedback?: string | null })?.feedback ?? previewFeedback ?? null;

  const statusLabel = todo ? getTodoStatusLabel(todo) : '';
  const headerStatusLabel = statusLabel === '완료' ? '제출완료' : statusLabel;
  const isLate = todo ? isOverdueTask(todo) : false;
  const isDone = todo?.status === 'DONE';
  const dueLabel = useMemo(() => {
    if (!todo?.dueDate) return null;
    const dueAt = parseTodoDueAt(todo.dueDate, todo.dueTime);
    if (!dueAt) return null;
    const now = new Date();
    const diffMs = dueAt.getTime() - now.getTime();
    const totalMinutes = Math.max(0, Math.floor(Math.abs(diffMs) / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const parts = [];
    if (hours > 0) parts.push(`${hours}시간`);
    parts.push(`${minutes}분`);
    const suffix = diffMs >= 0 ? '전' : '지남';
    return `${parts.join('')}${suffix}`;
  }, [todo?.dueDate, todo?.dueTime]);

  const storageKey = todoId ? `assignment-submission:${todoId}` : null;
  const initialStored = (() => {
    if (!storageKey || typeof window === 'undefined') {
      return { submission: null as AssignmentSubmissionResponse | null, comment: '' };
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return { submission: null as AssignmentSubmissionResponse | null, comment: '' };
      }
      const parsed = JSON.parse(raw) as AssignmentSubmissionResponse;
      if (parsed && parsed.submissionId) {
        return {
          submission: parsed,
          comment: parsed.comment ?? '',
        };
      }
    } catch {
      // ignore storage errors
    }
    return { submission: null as AssignmentSubmissionResponse | null, comment: '' };
  })();
  const [lastSubmission, setLastSubmission] = useState<AssignmentSubmissionResponse | null>(
    () => initialStored.submission
  );
  const submissionCommentRef = useRef(initialStored.comment);
  const commentKeyRef = useRef<string | number | null>(null);

  const resolvedAssignmentId = useMemo(
    () =>
      resolveAssignmentId({
        todoId,
        todo: detailTodo,
        assignmentGroups,
        overrideAssignmentId: storedAssignmentIdOverride,
      }),
    [assignmentGroups, detailTodo, storedAssignmentIdOverride, todoId]
  );

  const persistSubmission = (next: AssignmentSubmissionResponse | null) => {
    setLastSubmission(next);
    if (!storageKey || typeof window === 'undefined') return;
    if (!next) {
      window.localStorage.removeItem(storageKey);
      return;
    }
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const resolveLatestSubmission = (items: AssignmentSubmissionResponse[]) => {
    if (items.length === 0) return null;
    return items
      .slice()
      .sort((a, b) => {
        const aTime = a.createTime ? Date.parse(a.createTime) : 0;
        const bTime = b.createTime ? Date.parse(b.createTime) : 0;
        return bTime - aTime;
      })[0];
  };

  const { data: submissionData, isFetching: isSubmissionLoading } = useQuery({
    queryKey: ['assignment-submissions', resolvedAssignmentId],
    queryFn: () => listAssignmentSubmissions(resolvedAssignmentId as number),
    enabled: Boolean(resolvedAssignmentId) && !(lastSubmission && lastSubmission.imageUrl),
  });
  const queryLatestSubmission = useMemo(
    () => resolveLatestSubmission(submissionData?.submissions ?? []),
    [submissionData]
  );
  const resolvedSubmission = queryLatestSubmission ?? lastSubmission;
  const submissionStatusLabel = useMemo(() => {
    const status = resolvedSubmission?.status?.toUpperCase();
    if (!status || status === 'SUBMITTED' || status === 'SUBMITTTED') return '제출됨';
    return resolvedSubmission?.status ?? '제출됨';
  }, [resolvedSubmission?.status]);
  const commentDefault = resolvedSubmission?.comment ?? '';
  const commentInputKey = resolvedSubmission?.submissionId ?? 'empty';
  useEffect(() => {
    if (commentKeyRef.current !== commentInputKey) {
      commentKeyRef.current = commentInputKey;
      submissionCommentRef.current = commentDefault;
    }
  }, [commentInputKey, commentDefault]);
  const resolvedSubmittedAt = useMemo(() => {
    if (submittedAt) return submittedAt;
    if (!resolvedSubmission?.createTime) return null;
    const parsed = Date.parse(resolvedSubmission.createTime);
    return Number.isNaN(parsed) ? null : parsed;
  }, [submittedAt, resolvedSubmission?.createTime]);

  const handleSubmit = (comment: string, files: File[]) => {
    const assignmentId = resolvedAssignmentId;
    if (!assignmentId) {
      setSubmitError('assignmentId를 찾지 못했습니다.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    submitAssignment(assignmentId, files, comment)
      .then((res) => {
        const latest = resolveLatestSubmission(res.submissions);
        if (latest) {
          persistSubmission(latest);
          submissionCommentRef.current = latest.comment ?? '';
          if (latest.createTime) {
            const parsed = Date.parse(latest.createTime);
            if (!Number.isNaN(parsed)) setSubmittedAt(parsed);
          }
        }
        const todoIdForUpdate =
          detailTodo?.id ??
          (assignmentMatch?.todoItemId ? String(assignmentMatch.todoItemId) : null);
        if (todoIdForUpdate) {
          updateTodoMutation.mutate(
            {
              id: todoIdForUpdate,
              patch: { status: 'DONE', completedAt: new Date().toISOString() },
              isFixed: true,
            },
            {
              onSuccess: () => {
                if (!latest) {
                  setSubmittedAt(Date.now());
                }
                setIsSubmitting(false);
              },
              onError: () => {
                setSubmitError('제출 상태 업데이트에 실패했습니다.');
                setIsSubmitting(false);
              },
            }
          );
          return;
        }
        if (!latest) {
          setSubmittedAt(Date.now());
        }
        setIsSubmitting(false);
      })
      .catch(() => {
        setSubmitError('과제 제출에 실패했습니다.');
        setIsSubmitting(false);
      });
  };

  const handleUpdateComment = () => {
    const currentSubmission = resolvedSubmission;
    if (!currentSubmission) return;
    const assignmentId = resolvedAssignmentId;
    if (!assignmentId) {
      setSubmitError('assignmentId를 찾지 못했습니다.');
      return;
    }
    setIsSubmissionBusy(true);
    setSubmitError(null);
    const nextComment = submissionCommentRef.current.trim();
    updateAssignmentSubmission(
      assignmentId,
      currentSubmission.submissionId,
      undefined,
      nextComment
    )
      .then((updated) => {
        persistSubmission(updated);
        submissionCommentRef.current = updated.comment ?? '';
        setIsSubmissionBusy(false);
      })
      .catch(() => {
        setSubmitError('제출 코멘트 수정에 실패했습니다.');
        setIsSubmissionBusy(false);
      });
  };

  const handlePickUpdateFile = () => {
    const currentSubmission = resolvedSubmission;
    if (isSubmissionBusy || !currentSubmission) return;
    updateFileRef.current?.click();
  };

  const handleUpdateFile = (file: File) => {
    const currentSubmission = resolvedSubmission;
    if (!currentSubmission) return;
    const assignmentId = resolvedAssignmentId;
    if (!assignmentId) {
      setSubmitError('assignmentId를 찾지 못했습니다.');
      return;
    }
    setIsSubmissionBusy(true);
    setSubmitError(null);
    const nextComment = submissionCommentRef.current.trim();
    updateAssignmentSubmission(
      assignmentId,
      currentSubmission.submissionId,
      file,
      nextComment
    )
      .then((updated) => {
        persistSubmission(updated);
        submissionCommentRef.current = updated.comment ?? '';
        setIsSubmissionBusy(false);
      })
      .catch(() => {
        setSubmitError('재업로드에 실패했습니다.');
        setIsSubmissionBusy(false);
      });
  };

  const handleDeleteComment = () => {
    const currentSubmission = resolvedSubmission;
    if (!currentSubmission) return;
    const assignmentId = resolvedAssignmentId;
    if (!assignmentId) {
      setSubmitError('assignmentId를 찾지 못했습니다.');
      return;
    }
    setIsSubmissionBusy(true);
    setSubmitError(null);
    deleteAssignmentSubmissionComment(assignmentId, currentSubmission.submissionId)
      .then((updated) => {
        persistSubmission(updated);
        submissionCommentRef.current = updated.comment ?? '';
        setIsSubmissionBusy(false);
      })
      .catch(() => {
        setSubmitError('코멘트 삭제에 실패했습니다.');
        setIsSubmissionBusy(false);
      });
  };

  const handleDeleteSubmission = () => {
    const currentSubmission = resolvedSubmission;
    if (!currentSubmission || !todo) return;
    const assignmentId = resolvedAssignmentId;
    if (!assignmentId) {
      setSubmitError('assignmentId를 찾지 못했습니다.');
      return;
    }
    setIsSubmissionBusy(true);
    setSubmitError(null);
    deleteAssignmentSubmission(assignmentId, currentSubmission.submissionId)
      .then(() => {
        persistSubmission(null);
        submissionCommentRef.current = '';
        setSubmittedAt(null);
        updateTodoMutation.mutate({
          id: todo.id,
          patch: { status: 'TODO', completedAt: null },
          isFixed: todo.isFixed,
        });
        setIsSubmissionBusy(false);
      })
      .catch(() => {
        setSubmitError('제출 삭제에 실패했습니다.');
        setIsSubmissionBusy(false);
      });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 rounded-[28px] bg-[#F6F8FA] p-4 sm:p-6">
        <section className="rounded-3xl bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="h-6 w-48 rounded-full bg-neutral-200" />
              <div className="h-4 w-32 rounded-full bg-neutral-100" />
            </div>
            <div className="h-8 w-20 rounded-full bg-neutral-200" />
          </div>
          <div className="mt-5 flex gap-2">
            <div className="h-6 w-16 rounded-full bg-neutral-100" />
            <div className="h-6 w-20 rounded-full bg-neutral-100" />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
          <div className="h-4 w-20 rounded-full bg-neutral-100" />
          <div className="mt-4 h-5 w-60 rounded-full bg-neutral-200" />
        </section>

        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <section className="rounded-3xl bg-[#D5EBFF] p-4 sm:p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
            <div className="h-4 w-16 rounded-full bg-white/70" />
            <div className="mt-4 h-10 w-24 rounded-2xl bg-white/80" />
          </section>
          <section className="rounded-3xl bg-white p-4 sm:p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
            <div className="h-4 w-20 rounded-full bg-neutral-100" />
            <div className="mt-4 h-10 w-24 rounded-2xl bg-neutral-200" />
          </section>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
          <div className="h-4 w-20 rounded-full bg-neutral-100" />
          <div className="mt-4 h-5 w-3/4 rounded-full bg-neutral-200" />
        </section>
      </div>
    );
  }

  if (!todo) {
    return (
      <div className="rounded-2xl bg-[#F5F5F5] p-6 text-sm text-neutral-500">
        과제 정보를 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 rounded-[28px] bg-[#F6F8FA] p-4 sm:p-6">
      <section className="rounded-3xl bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold leading-tight text-neutral-900">
              <span className="inline-flex items-center gap-2">
                <img
                  src={typeof mentorTodoIcon === 'string' ? mentorTodoIcon : mentorTodoIcon?.src}
                  alt=""
                  aria-hidden
                  className="h-6 w-6"
                />
                {todo.title}
              </span>
            </h1>
          </div>
          <span
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold',
              statusLabel === '완료'
                ? 'bg-emerald-100 text-emerald-700'
                : isLate
                ? 'bg-rose-100 text-rose-600'
                : 'bg-neutral-200 text-neutral-600',
            ].join(' ')}
          >
            {headerStatusLabel}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-500">
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-neutral-600">
            {todo.subject}
          </span>
          {!isDone && dueLabel && (
            <span className="rounded-full bg-white px-3 py-1 text-neutral-500 ring-1 ring-neutral-200">
              마감 {dueLabel}
            </span>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
        <p className="text-sm font-semibold text-neutral-500">목표</p>
        <p className="mt-3 text-base font-semibold text-neutral-900">
          {todo.goal ?? '등록된 목표가 없습니다.'}
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <section className="rounded-3xl bg-white p-4 sm:p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-neutral-500">진행 시간</p>
          </div>
          <p className="mt-4 text-[30px] font-semibold leading-none text-neutral-900 sm:text-[40px]">
            {formatHMS(todo.studySeconds)}
          </p>
          {!isDone && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTodoId(todo.id);
                  openPanel();
                }}
                className="w-full rounded-full bg-[#004DFF] px-3 py-2 text-[11px] font-semibold text-white shadow-[0_10px_20px_rgba(21,0,255,0.2)] transition hover:-translate-y-0.5 sm:px-4 sm:py-2.5 sm:text-xs"
              >
                타이머
              </button>
            </div>
          )}
        </section>

        <AssignmentAttachmentCard
          guideFileName={todo.guideFileName}
          guideFileUrl={todo.guideFileUrl}
          mode="guide-only"
        />
      </div>

      {isDone && (
        <MentorFeedbackCard feedback={mentorFeedback} todoId={todo?.id ?? String(todoId)} />
      )}

      {!isDone && (
        <button
          type="button"
          onClick={() => setIsSubmissionOpen(true)}
          className="fixed bottom-28 right-4 z-40 rounded-full bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(21,0,255,0.22)] transition hover:-translate-y-0.5"
        >
          과제 제출
        </button>
      )}

      {resolvedSubmission && (
        <section className="rounded-3xl bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-neutral-500">최근 제출</p>
              <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                제출완료
              </span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSubmissionMenuOpen((prev) => !prev)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-neutral-600 shadow-sm hover:bg-neutral-50"
                aria-label="제출 관리"
              >
                ⋯
              </button>
              {isSubmissionMenuOpen && (
                <div className="absolute right-0 top-10 z-10 w-40 rounded-2xl border border-neutral-200 bg-white p-1 text-xs font-semibold text-neutral-700 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmissionMenuOpen(false);
                      handlePickUpdateFile();
                    }}
                    disabled={isSubmissionBusy}
                    className="w-full rounded-xl px-3 py-2 text-left hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-400"
                  >
                    재업로드
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmissionMenuOpen(false);
                      handleUpdateComment();
                    }}
                    disabled={isSubmissionBusy}
                    className="w-full rounded-xl px-3 py-2 text-left hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-400"
                  >
                    코멘트 수정
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmissionMenuOpen(false);
                      handleDeleteComment();
                    }}
                    disabled={isSubmissionBusy}
                    className="w-full rounded-xl px-3 py-2 text-left hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-400"
                  >
                    코멘트 삭제
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmissionMenuOpen(false);
                      handleDeleteSubmission();
                    }}
                    disabled={isSubmissionBusy}
                    className="w-full rounded-xl px-3 py-2 text-left text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-300"
                  >
                    제출 삭제
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {resolvedSubmission.createTime ? formatIso(resolvedSubmission.createTime) : '방금 전'}
          </div>
          <div className="mt-3 space-y-3 rounded-xl bg-white px-3 py-4">
            <div className="flex items-center justify-between gap-2 text-xs text-neutral-600">
              <span>코멘트</span>
              <span className="text-neutral-400">{submissionStatusLabel}</span>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800">
              <p className="whitespace-pre-line">
                {resolvedSubmission.comment?.trim() || '코멘트가 없습니다.'}
              </p>
            </div>
            {resolvedSubmission.imageUrl ? (
              <a
                href={resolvedSubmission.imageUrl}
                className="block text-xs text-blue-600 hover:underline"
              >
                제출 파일 보기
              </a>
            ) : isSubmissionLoading ? (
              <p className="text-xs text-neutral-400">제출 파일을 확인하는 중...</p>
            ) : (
              <p className="text-xs text-neutral-400">첨부 파일 정보가 없습니다.</p>
            )}
          </div>
        </section>
      )}

      {(isSubmitting || submitError) && (
        <div className="rounded-2xl bg-[#F5F5F5] p-4 text-xs text-neutral-500">
          {isSubmitting && <span className="ml-2 text-neutral-600">제출 중...</span>}
          {submitError && <p className="mt-2 text-rose-500">{submitError}</p>}
        </div>
      )}

      <input
        ref={updateFileRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleUpdateFile(file);
          }
          event.target.value = '';
        }}
        className="hidden"
      />

      {isSubmissionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-lg font-semibold text-neutral-900">과제 제출</p>
              <button
                type="button"
                onClick={() => setIsSubmissionOpen(false)}
                className="rounded-full px-3 py-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
              >
                닫기
              </button>
            </div>
            <AssignmentSubmissionCard
              onSubmit={handleSubmit}
              disabled={isDone || isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function formatHMS(totalSeconds: number) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatTimestamp(ms: number) {
  const date = new Date(ms);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

function formatIso(value: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return formatTimestamp(parsed);
}
