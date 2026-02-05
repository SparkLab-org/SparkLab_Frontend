import Link from 'next/link';
import type { QuestionListItem } from './data';

type Props = {
  items: QuestionListItem[];
};

export default function QuestionList({ items }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-800">질문 목록</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white"
          >
            최신순
            <span className="text-[10px]">⌄</span>
          </button>
          <Link
            href="/planner/question/new"
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black text-white"
            aria-label="질문 추가"
          >
            +
          </Link>
        </div>
      </div>

      <div className="grid gap-3">
        {items.map((q) => (
          <Link
            key={q.id}
            href={`/planner/question/${q.id}`}
            className="rounded-2xl bg-neutral-100 p-4 shadow-s transition hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-900">{q.title}</p>
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  q.status === '답변중'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-500',
                ].join(' ')}
              >
                {q.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-neutral-500">{q.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
