'use client';

import Link from 'next/link';

type Props = {
  feedback?: string | null;
  todoId?: string;
};

export default function MentorFeedbackCard({ feedback, todoId }: Props) {
  const message =
    feedback && feedback.trim().length > 0
      ? feedback
      : '아직 피드백이 등록되지 않았습니다.';

  return (
    <section className="rounded-2xl bg-[#F5F5F5] p-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold text-neutral-900">멘토 피드백</p>
        {todoId && (
          <Link
            href={`/feedback/${todoId}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
            aria-label="피드백 상세보기"
          >
            &gt;
          </Link>
        )}
      </div>
      <p className="mt-3 text-sm text-neutral-700">{message}</p>
    </section>
  );
}
