import Link from 'next/link';
import {
  Bell,
  BookOpenCheck,
  ClipboardCheck,
  MessageSquare,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import type { Notification } from '@/src/lib/types/notification';

type NotificationCardProps = {
  item: Notification;
  isRead: boolean;
  onMarkRead: (id: string) => void;
};

const iconForType = (type?: string) => {
  const t = (type ?? '').toUpperCase();
  if (t === 'TODO') return <ClipboardCheck className="h-4 w-4" />;
  if (t === 'ASSIGNMENT') return <BookOpenCheck className="h-4 w-4" />;
  if (t === 'FEEDBACK') return <MessageSquare className="h-4 w-4" />;
  if (t === 'QUESTION') return <MessageSquare className="h-4 w-4" />;
  if (t === 'MENTEE') return <Users className="h-4 w-4" />;
  return <Bell className="h-4 w-4" />;
};

const labelForType = (type?: string) => {
  const t = (type ?? '').toUpperCase();
  if (t === 'TODO') return '할 일';
  if (t === 'ASSIGNMENT') return '과제';
  if (t === 'FEEDBACK') return '피드백';
  if (t === 'QUESTION') return '질문';
  if (t === 'MENTEE') return '멘티';
  return '알림';
};

const formatCreatedAt = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return format(parsed, 'M월 d일 a h:mm');
};

const resolveNotificationLink = (item: Notification) => {
  const linkType = (item.linkType ?? '').toUpperCase();
  if (linkType === 'TODO' && typeof item.linkId === 'number') {
    return `/planner/list/${item.linkId}`;
  }
  if (linkType === 'ASSIGNMENT' && typeof item.linkId === 'number') {
    return `/planner/assignments/${item.linkId}`;
  }
  if (linkType === 'FEEDBACK' && typeof item.linkId === 'number') {
    return `/feedback/${item.linkId}`;
  }
  if (linkType === 'QUESTION' && typeof item.linkId === 'number') {
    return `/planner/question`;
  }
  if (linkType === 'MENTEE' && typeof item.linkId === 'number') {
    return `/mentor/mentee/${item.linkId}`;
  }
  return null;
};

export default function NotificationCard({
  item,
  isRead,
  onMarkRead,
}: NotificationCardProps) {
  const createdAt = formatCreatedAt(item.createdAt);
  const typeLabel = labelForType(item.linkType ?? item.type);
  const link = resolveNotificationLink(item);

  const content = (
    <div
      className={[
        'flex items-start gap-3 rounded-3xl p-4',
        isRead ? 'bg-[#F5F5F5]' : 'bg-white ring-1 ring-neutral-200',
      ].join(' ')}
    >
      <div
        className={[
          'flex h-8 w-8 items-center justify-center rounded-full',
          isRead ? 'bg-neutral-200 text-neutral-600' : 'bg-[#004DFF] text-white',
        ].join(' ')}
      >
        {iconForType(item.linkType)}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-neutral-900">{item.title ?? '알림'}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
          <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
            {typeLabel}
          </span>
          {createdAt && <span>· {createdAt}</span>}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        {!isRead && <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />}
      </div>
    </div>
  );

  return link ? (
    <Link href={link} className="block" onClick={() => onMarkRead(item.id)}>
      {content}
    </Link>
  ) : (
    <div>
      <div onClick={() => onMarkRead(item.id)}>{content}</div>
      <p className="mt-2 text-[11px] text-neutral-400">이동할 수 있는 링크가 없습니다.</p>
    </div>
  );
}
