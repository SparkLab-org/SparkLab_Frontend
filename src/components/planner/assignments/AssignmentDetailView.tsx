'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTodoDetailQuery, useUpdateTodoMutation } from '@/src/hooks/todoQueries';
import { getTodoStatusLabel, isOverdueTask } from '@/src/lib/utils/todoStatus';
import AssignmentSubmissionCard from './AssignmentSubmissionCard';
import AssignmentAttachmentCard from '../list/listdetail/AssignmentAttachmentCard';
import { useTimerStore } from '@/src/store/timerStore';
import {
  submitAssignment,
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
  const { data: todo, isLoading } = useTodoDetailQuery(todoId);
  const updateTodoMutation = useUpdateTodoMutation();
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<AssignmentSubmissionResponse | null>(null);
  const [submissionComment, setSubmissionComment] = useState('');
  const [isSubmissionBusy, setIsSubmissionBusy] = useState(false);
  const updateFileRef = useRef<HTMLInputElement | null>(null);
  const openPanel = useTimerStore((s) => s.openPanel);
  const setActiveTodoId = useTimerStore((s) => s.setActiveTodoId);

  const statusLabel = todo ? getTodoStatusLabel(todo) : '';
  const isLate = todo ? isOverdueTask(todo) : false;
  const isDone = todo?.status === 'DONE';

  const storageKey = todo ? `assignment-submission:${todo.id}` : null;

  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AssignmentSubmissionResponse;
      if (parsed && parsed.submissionId) {
        setLastSubmission(parsed);
        setSubmissionComment(parsed.comment ?? '');
      }
    } catch {
      // ignore storage errors
    }
  }, [storageKey]);

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

  const handleSubmit = (comment: string, files: File[]) => {
    if (!todo) return;
    setIsSubmitting(true);
    setSubmitError(null);
    submitAssignment(Number(todo.id), files, comment)
      .then((res) => {
        const latest = resolveLatestSubmission(res.submissions);
        if (latest) {
          persistSubmission(latest);
          setSubmissionComment(latest.comment ?? '');
          if (latest.createTime) {
            const parsed = Date.parse(latest.createTime);
            if (!Number.isNaN(parsed)) setSubmittedAt(parsed);
          }
        }
        updateTodoMutation.mutate(
          { id: todo.id, patch: { status: 'DONE' } },
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
      })
      .catch(() => {
        setSubmitError('과제 제출에 실패했습니다.');
        setIsSubmitting(false);
      });
  };

  const handleUpdateComment = () => {
    if (!todo || !lastSubmission) return;
    setIsSubmissionBusy(true);
    setSubmitError(null);
    updateAssignmentSubmission(
      Number(todo.id),
      lastSubmission.submissionId,
      undefined,
      submissionComment.trim()
    )
      .then((updated) => {
        persistSubmission(updated);
        setSubmissionComment(updated.comment ?? '');
        setIsSubmissionBusy(false);
      })
      .catch(() => {
        setSubmitError('제출 코멘트 수정에 실패했습니다.');
        setIsSubmissionBusy(false);
      });
  };

  const handlePickUpdateFile = () => {
    if (isSubmissionBusy || !lastSubmission) return;
    updateFileRef.current?.click();
  };

  const handleUpdateFile = (file: File) => {
    if (!todo || !lastSubmission) return;
    setIsSubmissionBusy(true);
    setSubmitError(null);
    updateAssignmentSubmission(
      Number(todo.id),
      lastSubmission.submissionId,
      file,
      submissionComment.trim()
    )
      .then((updated) => {
        persistSubmission(updated);
        setSubmissionComment(updated.comment ?? '');
        setIsSubmissionBusy(false);
      })
      .catch(() => {
        setSubmitError('재업로드에 실패했습니다.');
        setIsSubmissionBusy(false);
      });
  };

  const handleDeleteComment = () => {
    if (!todo || !lastSubmission) return;
    setIsSubmissionBusy(true);
    setSubmitError(null);
    deleteAssignmentSubmissionComment(Number(todo.id), lastSubmission.submissionId)
      .then((updated) => {
        persistSubmission(updated);
        setSubmissionComment(updated.comment ?? '');
        setIsSubmissionBusy(false);
      })
      .catch(() => {
        setSubmitError('코멘트 삭제에 실패했습니다.');
        setIsSubmissionBusy(false);
      });
  };

  const handleDeleteSubmission = () => {
    if (!todo || !lastSubmission) return;
    setIsSubmissionBusy(true);
    setSubmitError(null);
    deleteAssignmentSubmission(Number(todo.id), lastSubmission.submissionId)
      .then(() => {
        persistSubmission(null);
        setSubmissionComment('');
        setSubmittedAt(null);
        updateTodoMutation.mutate({ id: todo.id, patch: { status: 'TODO' } });
        setIsSubmissionBusy(false);
      })
      .catch(() => {
        setSubmitError('제출 삭제에 실패했습니다.');
        setIsSubmissionBusy(false);
      });
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[#F5F5F5] p-6 text-sm text-neutral-500">
        과제 정보를 불러오는 중입니다.
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
    <div className="mx-auto max-w-3xl space-y-5">
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-500">멘토 과제</p>
            <h1 className="text-xl font-semibold text-neutral-900">{todo.title}</h1>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            뒤로
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-500">
          <span className="rounded-full bg-white px-2 py-0.5">{todo.subject}</span>
          <span className="rounded-full bg-white px-2 py-0.5">마감 {todo.dueDate} {todo.dueTime}</span>
          <span
            className={[
              'rounded-full px-2 py-0.5',
              statusLabel === '완료'
                ? 'bg-emerald-100 text-emerald-700'
                : isLate
                ? 'bg-rose-100 text-rose-600'
                : 'bg-neutral-200 text-neutral-600',
            ].join(' ')}
          >
            {statusLabel}
          </span>
        </div>
      </header>

      <section className="rounded-2xl bg-[#F5F5F5] p-4">
        <p className="text-lg font-semibold text-neutral-900">목표</p>
        <p className="mt-2 text-sm text-neutral-700">
          {todo.goal ?? '등록된 목표가 없습니다.'}
        </p>
      </section>

      <section className="rounded-2xl bg-[#F5F5F5] p-4">
        <p className="text-lg font-semibold text-neutral-900">진행 시간</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-neutral-700">
            {formatHMS(todo.studySeconds)}
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTodoId(todo.id);
              openPanel();
            }}
            className="rounded-full bg-[#004DFF] px-3 py-1.5 text-xs font-semibold text-white"
          >
            타이머
          </button>
        </div>
      </section>

      <AssignmentAttachmentCard
        guideFileName={todo.guideFileName}
        guideFileUrl={todo.guideFileUrl}
        mode="guide-only"
      />

      <AssignmentSubmissionCard
        onSubmit={handleSubmit}
        disabled={isDone || isSubmitting}
      />

      {lastSubmission && (
        <section className="rounded-2xl bg-[#F5F5F5] p-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-neutral-900">최근 제출</p>
            <span className="text-xs text-neutral-500">
              {lastSubmission.createTime ? formatIso(lastSubmission.createTime) : '방금 전'}
            </span>
          </div>
          <div className="mt-3 space-y-3 rounded-xl bg-white px-3 py-4">
            <div className="flex items-center justify-between gap-2 text-xs text-neutral-600">
              <span>코멘트</span>
              <span className="text-neutral-400">
                {lastSubmission.status ?? '제출됨'}
              </span>
            </div>
            <input
              value={submissionComment}
              onChange={(e) => setSubmissionComment(e.target.value)}
              placeholder="제출 코멘트를 입력하세요."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-800 outline-none"
              disabled={isSubmissionBusy}
            />
            {lastSubmission.imageUrl ? (
              <a
                href={lastSubmission.imageUrl}
                className="block text-xs text-blue-600 hover:underline"
              >
                제출 파일 보기
              </a>
            ) : (
              <p className="text-xs text-neutral-400">첨부 파일 정보가 없습니다.</p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePickUpdateFile}
              disabled={isSubmissionBusy}
              className="rounded-full bg-[#004DFF] px-4 py-2 text-xs font-semibold text-white"
            >
              재업로드
            </button>
            <button
              type="button"
              onClick={handleUpdateComment}
              disabled={isSubmissionBusy}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700"
            >
              코멘트 수정
            </button>
            <button
              type="button"
              onClick={handleDeleteComment}
              disabled={isSubmissionBusy}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-600"
            >
              코멘트 삭제
            </button>
            <button
              type="button"
              onClick={handleDeleteSubmission}
              disabled={isSubmissionBusy}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600"
            >
              제출 삭제
            </button>
          </div>
        </section>
      )}

      <div className="rounded-2xl bg-[#F5F5F5] p-4 text-xs text-neutral-500">
        {isLate
          ? '마감 이후 제출은 지각 처리됩니다.'
          : '마감 전 제출하면 정상 처리됩니다.'}
        {submittedAt && (
          <span className="ml-2 text-neutral-600">
            제출 완료 · {formatTimestamp(submittedAt)}
          </span>
        )}
        {isSubmitting && <span className="ml-2 text-neutral-600">제출 중...</span>}
        {submitError && <p className="mt-2 text-rose-500">{submitError}</p>}
      </div>

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
