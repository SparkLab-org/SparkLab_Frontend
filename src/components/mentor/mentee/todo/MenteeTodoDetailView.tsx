'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useMentorStore } from '@/src/store/mentorStore';
import { useTodoDetailQuery, useTodosQuery, todoQueryKeys } from '@/src/hooks/todoQueries';
import { useAuthMeQuery } from '@/src/hooks/authQueries';
import { useMenteeAssignmentsQuery } from '@/src/hooks/assignmentQueries';
import {
  useCreateFeedbackMutation,
  useFeedbacksQuery,
  useUpdateFeedbackMutation,
} from '@/src/hooks/feedbackQueries';
import MentorFeedbackWriteModal from '@/src/components/mentor/feedback/MentorFeedbackWriteModal';
import { isOverdueTask } from '@/src/lib/utils/todoStatus';
import type { Todo } from '@/src/lib/types/planner';
import { listAssignmentSubmissions } from '@/src/services/assignment.api';
import { downloadFile } from '@/src/lib/utils/downloadFile';
import { resolveAssignmentId } from '@/src/lib/utils/assignment';

const DEFAULT_MENTEE_ID = 'm1';

function getStatusLabel(todo: Todo) {
  const isLocked = isOverdueTask(todo);
  if (isLocked) {
    return todo.status === 'DONE' ? '지각' : '미제출';
  }
  return todo.status === 'DONE' ? '완료' : '진행중';
}

function SkeletonCard({
  className = '',
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`rounded-3xl bg-white p-6 shadow-sm ${className}`.trim()}>
      {children}
    </div>
  );
}

function MenteeTodoDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <SkeletonCard>
        <div className="h-3 w-32 rounded-full bg-neutral-200" />
        <div className="mt-4 h-5 w-3/5 rounded-full bg-neutral-200" />
        <div className="mt-2 h-3 w-2/5 rounded-full bg-neutral-200" />
      </SkeletonCard>
      <SkeletonCard>
        <div className="h-4 w-24 rounded-full bg-neutral-200" />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="h-20 rounded-2xl bg-[#F6F8FA]" />
          <div className="h-20 rounded-2xl bg-[#F6F8FA]" />
          <div className="h-20 rounded-2xl bg-[#F6F8FA] md:col-span-2" />
        </div>
      </SkeletonCard>
      <SkeletonCard>
        <div className="h-4 w-28 rounded-full bg-neutral-200" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 rounded-2xl bg-neutral-200" />
          ))}
        </div>
      </SkeletonCard>
      <SkeletonCard>
        <div className="h-4 w-28 rounded-full bg-neutral-200" />
        <div className="mt-4 h-24 rounded-2xl bg-neutral-200" />
        <div className="mt-4 h-8 w-24 rounded-xl bg-neutral-200" />
      </SkeletonCard>
    </div>
  );
}

function formatSeconds(value?: number) {
  const total = Math.max(0, value ?? 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = Math.floor(total % 60);
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatKoreanDateTime(date?: string, time?: string) {
  if (!date) return '';
  const parts = date.split('-');
  if (parts.length < 3) return date;
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!month || !day) return date;
  if (!time) return `${month}월${day}일`;
  const [hhRaw, mmRaw] = time.split(':');
  const hour24 = Number(hhRaw);
  const minute = Number(mmRaw);
  if (!Number.isFinite(hour24) || !Number.isFinite(minute)) {
    return `${month}월${day}일`;
  }
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minuteLabel = String(minute).padStart(2, '0');
  return `${month}월${day}일 ${period} ${hour12}:${minuteLabel}`;
}

function getStatusBadgeClass(label: string) {
  switch (label) {
    case '완료':
      return 'bg-emerald-100 text-emerald-700';
    case '미제출':
      return 'bg-rose-100 text-rose-600';
    case '지각':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-sky-100 text-sky-700';
  }
}

export default function MenteeTodoDetailView() {
  const params = useParams<{ menteeId?: string | string[]; todoId?: string | string[] }>();
  const menteeIdParam = params?.menteeId;
  const todoIdParam = params?.todoId;
  const menteeId = Array.isArray(menteeIdParam)
    ? menteeIdParam[0]
    : menteeIdParam ?? DEFAULT_MENTEE_ID;
  const todoId = Array.isArray(todoIdParam) ? todoIdParam[0] : todoIdParam ?? '';

  const mentees = useMentorStore((s) => s.mentees);
  const setSelectedId = useMentorStore((s) => s.setSelectedId);
  const selectedMentee = useMemo(
    () => mentees.find((m) => m.id === menteeId) ?? mentees[0],
    [menteeId, mentees]
  );
  const resolvedMenteeId = selectedMentee?.id ?? DEFAULT_MENTEE_ID;

  useEffect(() => {
    if (resolvedMenteeId) setSelectedId(resolvedMenteeId);
  }, [resolvedMenteeId, setSelectedId]);

  const { data: todos = [], isLoading: isTodosLoading } = useTodosQuery();
  const { data: me } = useAuthMeQuery();
  const createFeedbackMutation = useCreateFeedbackMutation();
  const updateFeedbackMutation = useUpdateFeedbackMutation();
  const todo = useMemo(() => todos.find((item) => item.id === todoId), [todos, todoId]);
  const { data: detailTodo, isLoading: isDetailLoading } = useTodoDetailQuery(
    todo?.id ?? todoId
  );
  const resolvedTodo = detailTodo ?? todo;
  const menteeNumericId = useMemo(() => {
    const numeric = Number(resolvedMenteeId);
    return Number.isFinite(numeric) ? numeric : undefined;
  }, [resolvedMenteeId]);
  const { data: assignmentGroups = [] } = useMenteeAssignmentsQuery({
    menteeId: menteeNumericId,
    enabled: Number.isFinite(menteeNumericId),
  });
  const assignmentId = useMemo(
    () =>
      resolveAssignmentId({
        todoId,
        todo: resolvedTodo,
        assignmentGroups,
      }) ?? null,
    [assignmentGroups, resolvedTodo, todoId]
  );

  const [downloadError, setDownloadError] = useState<string | null>(null);
  const todoItemId = Number(resolvedTodo?.id ?? todoId);
  const { data: feedbacks = [] } = useFeedbacksQuery({
    todoItemId: Number.isFinite(todoItemId) ? todoItemId : undefined,
  });
  const existingFeedback = feedbacks[0];
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

  const submissions = submissionData?.submissions ?? [];
  const submissionError = submissionFailed ? '제출물을 불러오지 못했습니다.' : null;

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

  if ((isDetailLoading || (isTodosLoading && !todo)) && !resolvedTodo) {
    return <MenteeTodoDetailSkeleton />;
  }

  if (!resolvedTodo) {
    return (
      <div className="rounded-3xl bg-white p-6">
        <Link
          href={`/mentor/mentee/${resolvedMenteeId}`}
          className="text-xs text-neutral-500 hover:text-neutral-900"
        >
          ← 멘티 상세로 돌아가기
        </Link>
        <p className="mt-4 text-sm text-neutral-500">과제를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const statusLabel = getStatusLabel(resolvedTodo);
  const mentorId = typeof me?.mentorId === 'number' ? me.mentorId : undefined;
  const menteeIdNum = Number.isFinite(Number(menteeId)) ? Number(menteeId) : undefined;
  const feedbackEditorKey = `${resolvedTodo.id ?? 'todo'}-${existingFeedback?.id ?? 'new'}`;

  return (
    <div className="space-y-6">
      <Link
        href={`/mentor/mentee/${resolvedMenteeId}`}
        className="text-xs text-neutral-500 hover:text-neutral-900"
      >
        ← 멘티 상세로 돌아가기
      </Link>
      <section className="mt-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  'rounded-full px-3 py-1 text-sm font-semibold',
                  getStatusBadgeClass(statusLabel),
                ].join(' ')}
              >
                {statusLabel}
              </span>
              <h1 className="text-xl font-semibold text-neutral-900 lg:text-2xl">
                {resolvedTodo.title}
              </h1>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                {resolvedTodo.subject}
              </span>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                {resolvedTodo.type}
              </span>
              <span>{formatKoreanDateTime(resolvedTodo.dueDate, resolvedTodo.dueTime)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">세부사항</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-[#F6F8FA] p-4">
              <p className="text-xs font-semibold text-neutral-500">목표</p>
              {resolvedTodo.goal && resolvedTodo.goal.trim() ? (
                <p className="mt-2 text-base font-semibold text-neutral-900">
                  {resolvedTodo.goal}
                </p>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">등록된 목표가 없습니다.</p>
              )}
            </div>
            <div className="rounded-2xl bg-[#F6F8FA] p-4">
              <p className="text-xs font-semibold text-neutral-500">누적 학습 시간</p>
              {resolvedTodo.studySeconds && resolvedTodo.studySeconds > 0 ? (
                <p className="mt-2 text-base font-semibold text-neutral-900">
                  {formatSeconds(resolvedTodo.studySeconds)}
                </p>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">기록되지 않았습니다.</p>
              )}
            </div>
            <div className="rounded-2xl bg-[#F6F8FA] p-4 md:col-span-2">
              <p className="text-xs font-semibold text-neutral-500">학습지</p>
              {resolvedTodo.guideFileUrl ? (
                <a
                  href={resolvedTodo.guideFileUrl}
                  download
                  className="mt-2 inline-flex text-sm font-semibold text-neutral-700 hover:text-neutral-900"
                >
                  {resolvedTodo.guideFileName ?? '학습지 다운로드'} →
                </a>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">등록된 학습지가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">멘티 제출물</h2>
          {submissionLoading ? (
            <div className="mt-4 rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
              제출물을 불러오는 중...
            </div>
          ) : submissionError ? (
            <div className="mt-4 rounded-2xl bg-white px-4 py-6 text-center text-sm text-rose-500">
              {submissionError}
            </div>
          ) : submissions.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
              제출 파일이 아직 없습니다.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {submissions.map((item) => (
              <div key={item.submissionId} className="space-y-2">
                <div className="group flex h-4 items-center justify-center overflow-hidden rounded-2xl bg-neutral-200 text-xs text-neutral-500">
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
                {item.comment ? (
                  <p className="min-h-[72px] rounded-xl bg-[#F6F8FA] px-3 py-3 text-[12px] text-neutral-700">
                    {item.comment}
                  </p>
                ) : (
                  <p className="text-[11px] text-neutral-400">코멘트 없음</p>
                )}
                {item.imageUrl ? (
                  <button
                    type="button"
                    onClick={() => handleDownload(item.imageUrl, `submission-${item.submissionId}`)}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[11px] font-semibold text-neutral-700 hover:text-neutral-900"
                    >
                      다운로드
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-200 bg-neutral-100 px-2 py-1 text-[11px] font-semibold text-neutral-400"
                    >
                      다운로드
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          {downloadError && (
            <p className="mt-2 text-xs font-semibold text-rose-500">{downloadError}</p>
          )}
        </div>
      </section>

      <FeedbackEditor
        key={feedbackEditorKey}
        resolvedTodo={resolvedTodo}
        existingFeedback={existingFeedback}
        mentorId={mentorId}
        menteeId={menteeIdNum}
        todoItemId={todoItemId}
        createFeedbackMutation={createFeedbackMutation}
        updateFeedbackMutation={updateFeedbackMutation}
      />
    </div>
  );
}

function FeedbackEditor({
  resolvedTodo,
  existingFeedback,
  mentorId,
  menteeId,
  todoItemId,
  createFeedbackMutation,
  updateFeedbackMutation,
}: {
  resolvedTodo: Todo;
  existingFeedback?: { id?: number | string; content?: string | null };
  mentorId?: number;
  menteeId?: number;
  todoItemId: number;
  createFeedbackMutation: ReturnType<typeof useCreateFeedbackMutation>;
  updateFeedbackMutation: ReturnType<typeof useUpdateFeedbackMutation>;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(() => {
    if (existingFeedback?.content) return existingFeedback.content;
    if (typeof window !== 'undefined') {
      const cached = window.localStorage.getItem(`todoFeedback:${resolvedTodo.id}`);
      if (cached !== null) return cached;
    }
    return resolvedTodo.feedback ?? '';
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const feedbackContent = existingFeedback?.content ?? '';
  const isSaving = createFeedbackMutation.isPending || updateFeedbackMutation.isPending;
  const hasFeedback = Boolean(
    (feedbackContent && feedbackContent.trim().length > 0) ||
      (saveSuccess && draft.trim().length > 0)
  );
  const isDone = resolvedTodo.status === 'DONE';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(`todoFeedback:${resolvedTodo.id}`, draft);
  }, [draft, resolvedTodo.id]);

  const handleSaveFeedback = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    const nextFeedbackText = draft.trim();
    const canUseApi =
      typeof mentorId === 'number' &&
      typeof menteeId === 'number' &&
      Number.isFinite(todoItemId);

    try {
      if (canUseApi) {
        if (existingFeedback?.id) {
          await updateFeedbackMutation.mutateAsync({
            id: existingFeedback.id,
            patch: {
              title: resolvedTodo.title,
              summary: resolvedTodo.title,
              content: nextFeedbackText,
              todoItemId,
              targetDate: resolvedTodo.dueDate,
            },
          });
        } else {
          await createFeedbackMutation.mutateAsync({
            mentorId,
            menteeId,
            todoItemId,
            targetDate: resolvedTodo.dueDate,
            title: resolvedTodo.title,
            summary: resolvedTodo.title,
            content: nextFeedbackText,
          });
        }
      } else if (typeof window !== 'undefined') {
        window.localStorage.setItem(`todoFeedback:${resolvedTodo.id}`, nextFeedbackText);
      }
      queryClient.setQueriesData({ queryKey: todoQueryKeys.all }, (old) => {
        const isRecord = (value: unknown): value is Record<string, unknown> =>
          typeof value === 'object' && value !== null;
        const applyToTodo = (todo: unknown): unknown => {
          if (!isRecord(todo)) return todo;
          const todoId = todo.id ?? todo.todoItemId;
          if (String(todoId ?? '') !== String(todoItemId)) return todo;
          return { ...todo, feedback: nextFeedbackText };
        };
        const applyToList = (list: unknown[]) => list.map((item) => applyToTodo(item));

        if (Array.isArray(old)) {
          return applyToList(old);
        }
        if (isRecord(old)) {
          const todosByDate = old['todosByDate'];
          if (Array.isArray(todosByDate)) {
            const nextGroups = todosByDate.map((group) => {
              if (!isRecord(group)) return group;
              const groupTodos = group['todos'];
              return {
                ...group,
                todos: Array.isArray(groupTodos) ? applyToList(groupTodos) : groupTodos,
              };
            });
            return { ...old, todosByDate: nextGroups };
          }
          const todos = old['todos'];
          if (Array.isArray(todos)) {
            return { ...old, todos: applyToList(todos) };
          }
        }
        return old;
      });
      setSaveSuccess(true);
      setIsOpen(false);
    } catch {
      setSaveError('피드백 저장에 실패했습니다.');
    }
  };

  if (!isDone && !hasFeedback) {
    return null;
  }

  return (
    <>
      {hasFeedback ? (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">멘토 피드백</h2>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              수정
            </button>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm text-neutral-800">
            {feedbackContent && feedbackContent.trim().length > 0
              ? feedbackContent
              : draft.trim()}
          </p>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full rounded-3xl bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-6 py-6 text-sm font-semibold text-white shadow-sm"
        >
          피드백 작성
        </button>
      )}

      <MentorFeedbackWriteModal
        isOpen={isOpen}
        headerTitle="멘토 피드백 작성"
        dateLabel="멘티에게 전달될 내용"
        summary={draft}
        content={draft}
        error={saveError ?? undefined}
        successMessage={saveSuccess ? '피드백이 저장되었습니다.' : undefined}
        canSubmit={!isSaving}
        isSubmitting={isSaving}
        showSummary={false}
        submitLabel={existingFeedback?.id ? '수정완료' : '작성완료'}
        onClose={() => setIsOpen(false)}
        onChangeSummary={(value) => setDraft(value)}
        onChangeContent={(value) => setDraft(value)}
        onSubmit={handleSaveFeedback}
      />
    </>
  );
}
