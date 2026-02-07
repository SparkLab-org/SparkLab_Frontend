'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/planner/assignments')) return '과제';
  if (pathname.startsWith('/planner/calendar')) return '계획표';
  if (pathname.startsWith('/planner/list')) return '학습';
  if (pathname.startsWith('/planner/question')) return '질문';
  if (pathname.startsWith('/planner/')) return '할 일';
  return '';
}

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const showHeader = pathname !== '/planner';
  const title = getPageTitle(pathname);

  return (
    <div className="space-y-4">
      {showHeader && (
        <header className="flex items-center gap-2 text-l font-semibold text-neutral-900">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
            aria-label="뒤로"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          {/* <span>{title}</span> */}
        </header>
      )}
      {children}
    </div>
  );
}
