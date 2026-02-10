import { apiFetch } from '@/src/services/appClient';
import type { Notification } from '@/src/lib/types/notification';

type NotificationApiItem = {
  notificationId: number;
  type?: string;
  title?: string;
  linkType?: string;
  linkId?: number;
  isRead?: boolean;
  createdAt?: string;
};

const NOTIFICATION_BASE_PATH = '/notifications';

function mapNotificationFromApi(item: NotificationApiItem): Notification {
  return {
    id: String(item.notificationId),
    type: item.type,
    title: item.title,
    linkType: item.linkType,
    linkId: item.linkId,
    isRead: item.isRead,
    createdAt: item.createdAt,
  };
}

export async function listNotifications(): Promise<Notification[]> {
  const items = await apiFetch<NotificationApiItem[]>(NOTIFICATION_BASE_PATH);
  return items.map(mapNotificationFromApi);
}
