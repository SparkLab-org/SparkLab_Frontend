'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useNotificationsQuery } from '@/src/hooks/notificationQueries';

export default function NotificationsPage() {
  const accountId = useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const raw = window.localStorage.getItem('accountId');
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : undefined;
  }, []);

  const { data: notifications = [] } = useNotificationsQuery(accountId);

  if (!accountId) {
    return (
      <section className="space-y-3">
        <div className="rounded-3xl bg-neutral-100 p-4 text-sm text-neutral-600">
          로그인 후 알림을 확인할 수 있어요.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      {notifications.length === 0 ? (
        <div className="rounded-3xl bg-neutral-100 p-4 text-sm text-neutral-600">
          새로운 알림이 없어요.
        </div>
      ) : (
        <div className="grid gap-3">
          {notifications.map((item) => {
            const linkType = (item.linkType ?? '').toUpperCase();
            const link =
              linkType === 'TODO' && typeof item.linkId === 'number'
                ? `/planner/list/${item.linkId}`
              : linkType === 'ASSIGNMENT' && typeof item.linkId === 'number'
                ? `/planner/assignments/${item.linkId}`
              : linkType === 'FEEDBACK' && typeof item.linkId === 'number'
                ? `/feedback/${item.linkId}`
              : linkType === 'QUESTION' && typeof item.linkId === 'number'
                ? `/planner/question`
              : linkType === 'MENTEE' && typeof item.linkId === 'number'
                ? `/mentor/mentee/${item.linkId}`
              : null;

            const content = (
              <div className="rounded-3xl bg-[#F5F5F5] p-4">
                <p className="text-sm font-semibold text-neutral-900">{item.title ?? '알림'}</p>
                <p className="mt-1 text-xs text-neutral-500">{item.type ?? ''}</p>
              </div>
            );

            return link ? (
              <Link key={item.id} href={link} className="block">
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })}
        </div>
      )}
    </section>
  );
}
