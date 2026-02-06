'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/mentor', label: '대시보드' },
  { href: '/mentor/question', label: '질문' },
  { href: '/mentor/mentee', label: '멘티' },
];

export default function MentorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:max-w-[240px] lg:sticky lg:top-6">
      <div className="flex h-full flex-col gap-6 rounded-3xl bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-900 text-sm font-semibold text-white">
            SL
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">멘토 센터</p>
            <p className="text-xs text-neutral-400">Dashboard</p>
          </div>
        </div>

        <input
          placeholder="검색"
          className="w-full rounded-full bg-neutral-100 px-3 py-2 text-xs text-neutral-600"
        />

        <nav className="space-y-1 text-sm">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition',
                  active
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-500 hover:bg-neutral-100',
                ].join(' ')}
              >
                <span>{item.label}</span>
                {active && <span className="text-[10px]">●</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-neutral-100 px-3 py-3 text-xs text-neutral-500">
          <p className="font-semibold text-neutral-700">접속 상태</p>
          <p className="mt-1">멘토 계정 · 정상</p>
        </div>
      </div>
    </aside>
  );
}
