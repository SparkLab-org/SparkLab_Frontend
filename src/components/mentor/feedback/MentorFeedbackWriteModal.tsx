'use client';

import { X } from 'lucide-react';

type Props = {
  isOpen: boolean;
  dateLabel: string;
  summary: string;
  content: string;
  error?: string;
  successMessage?: string;
  canSubmit: boolean;
  isSubmitting?: boolean;
  headerTitle?: string;
  showSummary?: boolean;
  submitLabel?: string;
  onClose: () => void;
  onChangeSummary: (value: string) => void;
  onChangeContent: (value: string) => void;
  onSubmit: () => void;
};

export default function MentorFeedbackWriteModal({
  isOpen,
  dateLabel,
  summary,
  content,
  error,
  successMessage,
  canSubmit,
  isSubmitting,
  headerTitle,
  showSummary = true,
  submitLabel,
  onClose,
  onChangeSummary,
  onChangeContent,
  onSubmit,
}: Props) {
  if (!isOpen) return null;
  const resolvedTitle = headerTitle ?? '피드백 작성';
  const resolvedSubmitLabel = submitLabel ?? '저장';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 lg:text-lg">
              {resolvedTitle}
            </h3>
            {dateLabel && <p className="mt-1 text-xs text-neutral-500">{dateLabel}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-neutral-400 hover:text-neutral-700"
          >
            닫기
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {showSummary && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-500">제목</label>
              <input
                value={summary}
                onChange={(event) => onChangeSummary(event.target.value)}
                className="w-full rounded-2xl border border-neutral-200 bg-[#F6F8FA] px-4 py-3 text-sm text-neutral-900"
                placeholder="피드백 제목을 입력하세요"
              />
            </div>
          )}
          <textarea
            value={content}
            onChange={(event) => onChangeContent(event.target.value)}
            rows={showSummary ? 12 : 20}
            className="w-full resize-none rounded-2xl bg-[#F6F8FA] px-4 py-3 text-sm text-neutral-900"
            placeholder="멘티에게 전달할 피드백을 작성하세요"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-700"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting}
              className={[
                'rounded-xl px-4 py-2 text-xs font-semibold',
                !canSubmit || isSubmitting
                  ? 'cursor-not-allowed bg-neutral-300 text-neutral-500'
                  : 'bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] text-white',
              ].join(' ')}
            >
              {isSubmitting ? '저장 중...' : resolvedSubmitLabel}
            </button>
          </div>
          {successMessage && (
            <p className="text-xs font-semibold text-emerald-600">{successMessage}</p>
          )}
          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
