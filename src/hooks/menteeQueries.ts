import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listMenteesByMentor, updateMenteeActiveLevel } from '@/src/services/mentee.api';

export const menteeQueryKeys = {
  all: ['mentees'] as const,
  mentor: () => [...menteeQueryKeys.all, 'mentor'] as const,
};

export function useMentorMenteesQuery() {
  return useQuery({
    queryKey: menteeQueryKeys.mentor(),
    queryFn: () => listMenteesByMentor(),
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
