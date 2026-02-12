'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNotificationsQuery } from '@/src/hooks/notificationQueries';
import NotificationEmpty from '@/src/components/planner/notifications/NotificationEmpty';
import NotificationList from '@/src/components/planner/notifications/NotificationList';
import NotificationLoginHint from '@/src/components/planner/notifications/NotificationLoginHint';

const READ_STORAGE_KEY = 'notification-read';

export default function NotificationsPage() {
  const hasToken = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const token = window.localStorage.getItem('accessToken');
    return Boolean(token);
  }, []);

  const {
    data: notifications = [],
    isLoading,
    isFetching,
  } = useNotificationsQuery(hasToken);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setReadIds(new Set(parsed.map((id) => String(id))));
      }
    } catch {
      // ignore parse errors
    }
  }, []);

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

  if (!hasToken) {
    return (
      <section className="space-y-3">
        <NotificationLoginHint />
      </section>
    );
  }

  const showSkeleton =
    (isLoading || isFetching) && notifications.length === 0 && hasToken;

  return (
    <section className="space-y-3">
      {showSkeleton ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`notification-skeleton-${index}`}
              className="rounded-3xl bg-white p-4 ring-1 ring-neutral-200"
            >
              <div className="animate-pulse space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-neutral-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-neutral-200" />
                    <div className="h-3 w-1/2 rounded bg-neutral-200" />
                  </div>
                  <div className="h-3 w-3 rounded-full bg-neutral-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <NotificationEmpty />
      ) : (
        <NotificationList
          notifications={notifications}
          readIds={readIds}
          onMarkRead={markRead}
        />
      )}
    </section>
  );
}
