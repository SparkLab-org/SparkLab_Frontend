import { useQuery } from '@tanstack/react-query';

import { getMe } from '@/src/services/auth.me.api';

export const authQueryKeys = {
  me: ['auth', 'me'] as const,
};

export function useAuthMeQuery() {
  return useQuery({
    queryKey: authQueryKeys.me,
    queryFn: () => getMe(),
  });
}
