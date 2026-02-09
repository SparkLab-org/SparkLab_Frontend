'use client';

import Link from 'next/link';
import type { Question } from '@/src/lib/types/question';

type Props = {
  pendingCount: number;
  recentQuestions: Question[];
};

export default function MentorQuestionPanel({ pendingCount, recentQuestions }: Props) {
  return (
    <section className="rounded-3xl bg-[#F5F5F5] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-neutral-900 lg:text-lg">질문 현황</p>
          <p className="mt-1 text-xs text-neutral-500">답변 대기 {pendingCount}건</p>
        </div>
        <Link
          href="/mentor/question"
          className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          전체보기 →
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {recentQuestions.map((q) => (
          <Link
            key={q.id}
            href={`/mentor/question/${q.id}`}
            className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-xs text-neutral-700 transition hover:bg-neutral-100"
          >
            <span className="truncate font-semibold text-neutral-900">{q.title}</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-neutral-500">
              {q.status}
            </span>
          </Link>
        ))}
        {recentQuestions.length === 0 && (
          <div className="rounded-2xl bg-white px-4 py-6 text-center text-xs text-neutral-400">
            등록된 질문이 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}
