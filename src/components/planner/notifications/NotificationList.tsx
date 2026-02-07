import type { Notification } from '@/src/lib/types/notification';
import NotificationCard from '@/src/components/planner/notifications/NotificationCard';

type NotificationListProps = {
  notifications: Notification[];
  readIds: Set<string>;
  onMarkRead: (id: string) => void;
};

export default function NotificationList({
  notifications,
  readIds,
  onMarkRead,
}: NotificationListProps) {
  return (
    <div className="grid gap-3">
      {notifications.map((item) => {
        const isRead = Boolean(item.isRead) || readIds.has(item.id);
        return (
          <NotificationCard
            key={item.id}
            item={item}
            isRead={isRead}
            onMarkRead={onMarkRead}
          />
        );
      })}
    </div>
  );
}
