import { useQuery } from '@tanstack/react-query';
import { listNotifications } from '@/src/services/notification.api';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
};

export function useNotificationsQuery(accountId?: number) {
  return useQuery({
    queryKey: notificationQueryKeys.all,
    queryFn: () => {
      if (typeof accountId !== 'number') return Promise.resolve([]);
      return listNotifications(accountId);
    },
    enabled: typeof accountId === 'number',
  });
}
