import { useQuery } from '@tanstack/react-query';

import { getMenteeMyPage, getMentorMyPage } from '@/src/services/mypage.api';

export const myPageQueryKeys = {
  all: ['mypage'] as const,
  mentee: () => [...myPageQueryKeys.all, 'mentee'] as const,
  mentor: () => [...myPageQueryKeys.all, 'mentor'] as const,
};

export function useMenteeMyPageQuery(enabled = true) {
  return useQuery({
    queryKey: myPageQueryKeys.mentee(),
    queryFn: getMenteeMyPage,
    enabled,
  });
}

export function useMentorMyPageQuery(enabled = true) {
  return useQuery({
    queryKey: myPageQueryKeys.mentor(),
    queryFn: getMentorMyPage,
    enabled,
  });
}
