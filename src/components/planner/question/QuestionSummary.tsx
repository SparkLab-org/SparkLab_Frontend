'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuestionsQuery } from '@/src/hooks/questionQueries';

export default function QuestionSummary() {
  const { data: questions = [] } = useQuestionsQuery();
  const topQuestions = useMemo(() => questions.slice(0, 2), [questions]);

  return (
    <section className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-900">질문</p>
        <Link
          href="/planner/question"
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          전체보기
          <span aria-hidden>›</span>
        </Link>
      </div>

      <div className="grid gap-2">
        {topQuestions.map((q) => (
          <div
            key={q.id}
            className="flex items-center justify-between rounded-2xl bg-neutral-100 px-3 py-2 text-xs"
          >
            <p className="truncate font-semibold text-neutral-900">{q.title}</p>
            <span
              className={[
                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                q.status === '답변중'
                  ? 'bg-[#004DFF] text-white'
                  : 'bg-neutral-200 text-neutral-600',
              ].join(' ')}
            >
              {q.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
