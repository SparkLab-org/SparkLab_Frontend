import Link from 'next/link';
import type { Question } from '@/src/lib/types/question';

type Props = {
  items: Question[];
  basePath?: string;
  showCreate?: boolean;
  headerLabel?: string;
};

function getExcerpt(content: string) {
  const trimmed = content.trim();
  if (trimmed.length <= 60) return trimmed;
  return `${trimmed.slice(0, 60)}...`;
}

export default function QuestionList({
  items,
  basePath = '/planner/question',
  showCreate = true,
  headerLabel = '질문 목록',
}: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-800">{headerLabel}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-[#004DFF] px-3 py-1 text-[11px] font-semibold text-white"
          >
            최신순
            <span className="text-[10px]">⌄</span>
          </button>
          {showCreate && (
            <Link
              href={`${basePath}/new`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#004DFF] text-white"
              aria-label="질문 추가"
            >
              +
            </Link>
          )}
        </div>
      </div>

      {items.length === 0 && (
        <div className="rounded-2xl bg-neutral-100 px-4 py-6 text-center text-sm text-neutral-500">
          등록된 질문이 없어요.
        </div>
      )}

      <div className="grid gap-3">
        {items
          .slice()
          .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
          .map((q) => (
          <Link
            key={q.id}
            href={`${basePath}/${q.id}`}
            className="rounded-2xl bg-neutral-100 p-4 shadow-s transition hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-900">{q.title}</p>
              <span
                className={[
                  'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                  q.status === '답변중'
                    ? 'bg-[#004DFF] text-white'
                    : 'bg-neutral-100 text-neutral-500',
                ].join(' ')}
              >
                {q.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-neutral-500">{getExcerpt(q.content)}</p>
          </Link>
          ))}
      </div>
    </section>
  );
}
