import { apiFetch } from '@/src/services/appClient';

type DailyPlanCreateRequest = {
  planDate?: string; // YYYY-MM-DD
  comment?: string;
};

type DailyPlanCommentRequest = {
  comment?: string;
};

type DailyPlanResponse = {
  dailyPlanId?: number;
  comment?: string;
  created?: boolean;
};

export async function findOrCreateDailyPlan(
  input: DailyPlanCreateRequest
): Promise<DailyPlanResponse> {
  return apiFetch<DailyPlanResponse>('/dailyPlan', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateDailyPlanComment(
  dailyPlanId: number,
  input: DailyPlanCommentRequest
): Promise<DailyPlanResponse> {
  return apiFetch<DailyPlanResponse>(`/dailyPlan/${dailyPlanId}/comment`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}
