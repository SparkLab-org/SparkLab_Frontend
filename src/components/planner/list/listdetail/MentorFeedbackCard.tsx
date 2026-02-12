'use client';

import Link from 'next/link';

type Props = {
  feedback?: string | null;
  todoId?: string;
};

export default function MentorFeedbackCard({ feedback, todoId }: Props) {
  const hasFeedback = Boolean(feedback && feedback.trim().length > 0);
  const message = hasFeedback ? feedback : '아직 피드백이 등록되지 않았습니다.';

  return (
    <section className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-500">멘토 피드백</p>
          <p className="text-lg font-semibold text-neutral-900">피드백 내용</p>
        </div>
        {todoId && (
          <Link
            href={`/feedback/${todoId}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(21,0,255,0.2)] transition hover:-translate-y-0.5"
            aria-label="피드백 상세보기"
          >
            &gt;
          </Link>
        )}
      </div>
      <p
        className={[
          'mt-4 text-sm leading-relaxed',
          hasFeedback ? 'text-neutral-700' : 'text-neutral-400',
        ].join(' ')}
      >
        {message}
      </p>
    </section>
  );
}
