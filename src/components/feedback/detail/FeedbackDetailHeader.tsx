'use client';

import Link from 'next/link';

type Props = {
  title: string;
  subtitle?: string;
};

export default function FeedbackDetailHeader({ title, subtitle }: Props) {
  return (
    <header className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-500">피드백 상세</p>
          <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
        </div>
        <Link
          href="/planner/list"
          className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
        >
          목록으로
        </Link>
      </div>
      {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
    </header>
  );
}
