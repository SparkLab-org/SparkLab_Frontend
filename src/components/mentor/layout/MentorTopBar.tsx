'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { Bell, User } from 'lucide-react';

const ACCOUNT_ID_FALLBACK = 'OOO';

function getAccountIdSnapshot() {
  if (typeof window === 'undefined') return ACCOUNT_ID_FALLBACK;
  const stored = window.localStorage.getItem('accountId');
  return stored && stored.trim().length > 0 ? stored : ACCOUNT_ID_FALLBACK;
}

function subscribeAccountId(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener('storage', handler);
  window.addEventListener('focus', handler);
  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('focus', handler);
  };
}

export default function MentorTopBar() {
  const accountId = useSyncExternalStore(
    subscribeAccountId,
    getAccountIdSnapshot,
    () => ACCOUNT_ID_FALLBACK
  );
  const dateLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
    return formatter.format(new Date());
  }, []);

  return (
    <header className="border-b border-[#F5F5F5] bg-white">
      <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <div className="flex items-center justify-between sm:justify-start sm:gap-6">
          <div className="text-lg font-semibold text-neutral-900 sm:text-xl">설스터디</div>
          <div className="text-sm font-semibold text-neutral-900 sm:text-[16px]">
            {dateLabel}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:ml-auto sm:justify-end">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
            aria-label="알림"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
          </button>
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200">
              <User className="h-4 w-4 text-neutral-500" aria-hidden />
            </span>
            <div className="min-w-0 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-neutral-900">{accountId}</p>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  멘토
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
