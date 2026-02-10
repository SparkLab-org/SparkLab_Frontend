import { useQuery } from '@tanstack/react-query';
import { listNotifications } from '@/src/services/notification.api';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
};

export function useNotificationsQuery(enabled = true) {
  return useQuery({
    queryKey: notificationQueryKeys.all,
    queryFn: () => listNotifications(),
    enabled,
  });
}
