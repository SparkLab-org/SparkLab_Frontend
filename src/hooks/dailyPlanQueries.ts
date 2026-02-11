import { useMutation, useQuery } from '@tanstack/react-query';
import {
  findOrCreateDailyPlan,
  getTodayDailyPlan,
  listDailyPlans,
  listDailyPlansForMentee,
  type DailyPlanRangeParams,
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

export function useDailyPlansQuery(params: DailyPlanRangeParams) {
  return useQuery({
    queryKey: ['dailyPlan', 'range', params.startDate, params.endDate],
    queryFn: () => listDailyPlans(params),
    enabled: Boolean(params.startDate && params.endDate),
  });
}

export function useDailyPlansForMenteeQuery(menteeId: number | null, params: DailyPlanRangeParams) {
  return useQuery({
    queryKey: ['dailyPlan', 'range', 'mentee', menteeId ?? null, params.startDate, params.endDate],
    queryFn: () => listDailyPlansForMentee(menteeId as number, params),
    enabled: typeof menteeId === 'number' && Boolean(params.startDate && params.endDate),
  });
}

export function useTodayDailyPlanQuery() {
  return useQuery({
    queryKey: ['dailyPlan', 'today'],
    queryFn: getTodayDailyPlan,
  });
}
