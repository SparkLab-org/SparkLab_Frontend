'use client';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { User } from 'lucide-react';
import Link from 'next/link';
import seolStudyIcon from '@/src/assets/icons/seolStudy.svg';
import bellIcon from '@/src/assets/icons/bell.svg';
import sendIcon from '@/src/assets/icons/send.svg';
import { useNotificationsQuery } from '@/src/hooks/notificationQueries';
import NotificationEmpty from '@/src/components/planner/notifications/NotificationEmpty';
import NotificationList from '@/src/components/planner/notifications/NotificationList';
import NotificationLoginHint from '@/src/components/planner/notifications/NotificationLoginHint';

const ACCOUNT_ID_FALLBACK = 'OOO';
const READ_STORAGE_KEY = 'notification-read';

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
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((id) => String(id)));
      }
    } catch {
      // ignore parse errors
    }
    return new Set();
  });
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const accountId = useSyncExternalStore(
    subscribeAccountId,
    getAccountIdSnapshot,
    () => ACCOUNT_ID_FALLBACK
  );
  const hasToken = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const token = window.localStorage.getItem('accessToken');
    return Boolean(token);
  }, []);
  const { data: notifications = [] } = useNotificationsQuery(hasToken);
  const dateLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
    return formatter.format(new Date());
  }, []);
  const brandIconSrc = typeof seolStudyIcon === 'string' ? seolStudyIcon : seolStudyIcon?.src;
  const sendIconSrc = typeof sendIcon === 'string' ? sendIcon : sendIcon?.src;
  const hasUnread = notifications.some(
    (item) => !item.isRead && !readIds.has(item.id)
  );

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const persistRead = (next: Set<string>) => {
    setReadIds(next);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(next)));
  };

  const markRead = (id: string) => {
    if (readIds.has(id)) return;
    const next = new Set(readIds);
    next.add(id);
    persistRead(next);
  };

  return (
    <header className="border-b border-[#F5F5F5] bg-white">
      <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <div className="flex items-center justify-between sm:justify-start sm:gap-6">
          <Link href="/mentor/mentee" className="flex items-center gap-2">
            {brandIconSrc ? (
              <img src={brandIconSrc} alt="설스터디" className="h-7 w-7" />
            ) : null}
            <div className="text-lg font-semibold text-neutral-900 sm:text-xl">설스터디</div>
          </Link>
          <div className="text-sm font-semibold text-neutral-900 sm:text-[16px]">
            {dateLabel}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:ml-auto sm:justify-end">
          <Link
            href="/mentor/question"
            className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-3 py-2 text-xs font-semibold text-white"
          >
            {sendIconSrc ? (
              <img
                className="h-4 w-4 invert brightness-0"
                src={sendIconSrc}
                alt=""
                aria-hidden
              />
            ) : null}
            질문
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
              aria-label="알림"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              {typeof bellIcon === 'string' ? (
                <img className="h-4 w-4" src={bellIcon} alt="" aria-hidden />
              ) : (
                <img className="h-4 w-4" src={bellIcon?.src} alt="" aria-hidden />
              )}
              {hasUnread && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
              )}
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-3 w-[320px] max-h-[60vh] overflow-y-auto rounded-3xl border border-neutral-100 bg-white p-4 shadow-2xl sm:w-[490px]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900">알림</p>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-semibold text-neutral-400 hover:text-neutral-700"
                  >
                    닫기
                  </button>
                </div>
                {!hasToken ? (
                  <NotificationLoginHint />
                ) : notifications.length === 0 ? (
                  <NotificationEmpty />
                ) : (
                  <NotificationList
                    notifications={notifications}
                    readIds={readIds}
                    onMarkRead={markRead}
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-200">
              <User
                className="h-4 w-4 text-neutral-500"
                fill="currentColor"
                stroke="none"
                aria-hidden
              />
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
