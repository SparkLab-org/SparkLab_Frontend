import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listMenteesByMentor, updateMenteeActiveLevel } from '@/src/services/mentee.api';

export const menteeQueryKeys = {
  all: ['mentees'] as const,
  mentor: () => [...menteeQueryKeys.all, 'mentor'] as const,
};

type QueryBehaviorOptions = {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  refetchOnMount?: boolean;
};

export function useMentorMenteesQuery(options?: QueryBehaviorOptions) {
  return useQuery({
    queryKey: menteeQueryKeys.mentor(),
    queryFn: () => listMenteesByMentor(),
    ...options,
  });
}

export function useUpdateMenteeActiveLevelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ menteeId, activeLevel }: { menteeId: number; activeLevel: Parameters<typeof updateMenteeActiveLevel>[1] }) =>
      updateMenteeActiveLevel(menteeId, activeLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menteeQueryKeys.mentor() });
    },
  });
}
