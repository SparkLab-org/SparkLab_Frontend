'use client';

import { X } from 'lucide-react';

type Props = {
  isOpen: boolean;
  dateLabel: string;
  summary: string;
  content: string;
  error?: string;
  canSubmit: boolean;
  isSubmitting?: boolean;
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
  canSubmit,
  isSubmitting,
  onClose,
  onChangeSummary,
  onChangeContent,
  onSubmit,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className={[
          'absolute inset-0 bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />
      <div
        className={[
          'absolute inset-0 flex items-center justify-center px-4 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">피드백 작성</h3>
              <p className="mt-1 text-xs text-neutral-500">{dateLabel}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-500">제목</label>
              <input
                value={summary}
                onChange={(event) => onChangeSummary(event.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                placeholder="피드백 제목을 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-500">내용</label>
              <textarea
                value={content}
                onChange={(event) => onChangeContent(event.target.value)}
                rows={5}
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                placeholder="멘티에게 전달할 피드백을 작성하세요"
              />
            </div>
            {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSubmit || isSubmitting}
              className={[
                'w-full rounded-xl px-3 py-2 text-sm font-semibold',
                !canSubmit || isSubmitting
                  ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                  : 'bg-neutral-900 text-white',
              ].join(' ')}
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
