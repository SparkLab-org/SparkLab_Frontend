'use client';

import { useEffect, useMemo, useState } from 'react';
import { useNotificationsQuery } from '@/src/hooks/notificationQueries';
import NotificationEmpty from '@/src/components/planner/notifications/NotificationEmpty';
import NotificationList from '@/src/components/planner/notifications/NotificationList';
import NotificationLoginHint from '@/src/components/planner/notifications/NotificationLoginHint';

const READ_STORAGE_KEY = 'notification-read';

export default function NotificationsPage() {
  const accountId = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const raw = window.localStorage.getItem('accountId');
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : undefined;
  }, []);

  const { data: notifications = [] } = useNotificationsQuery(accountId);
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

  if (!accountId) {
    return (
      <section className="space-y-3">
        <NotificationLoginHint />
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {notifications.length === 0 ? (
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
