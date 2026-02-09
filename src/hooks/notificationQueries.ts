import { useQuery } from '@tanstack/react-query';
import { listNotifications } from '@/src/services/notification.api';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
};

export function useNotificationsQuery(accountId?: string) {
  return useQuery({
    queryKey: notificationQueryKeys.all,
    queryFn: () => {
      if (!accountId) return Promise.resolve([]);
      return listNotifications(accountId);
    },
    enabled: !!accountId,
  });
}
