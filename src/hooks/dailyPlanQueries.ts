import { useMutation } from '@tanstack/react-query';
import {
  findOrCreateDailyPlan,
  updateDailyPlanComment,
} from '@/src/services/dailyPlan.api';

export function useFindOrCreateDailyPlanMutation() {
  return useMutation({
    mutationFn: findOrCreateDailyPlan,
  });
}

export function useUpdateDailyPlanCommentMutation() {
  return useMutation({
    mutationFn: ({ dailyPlanId, input }: { dailyPlanId: number; input: Parameters<typeof updateDailyPlanComment>[1] }) =>
      updateDailyPlanComment(dailyPlanId, input),
  });
}
