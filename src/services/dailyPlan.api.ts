import { apiFetch } from '@/src/services/appClient';

type DailyPlanCreateRequest = {
  menteeId?: number;
  accountId?: string;
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
  try {
    return await apiFetch<DailyPlanResponse>('/dailyPlan', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 400) {
      if (typeof input.menteeId === 'number') {
        const { menteeId, ...rest } = input;
        try {
          return await apiFetch<DailyPlanResponse>('/dailyPlan', {
            method: 'POST',
            body: JSON.stringify(rest),
          });
        } catch (fallbackError) {
          const fallbackStatus = (fallbackError as { status?: number }).status;
          if (fallbackStatus === 400 && input.accountId) {
            const { accountId, ...restNoAccount } = rest;
            return apiFetch<DailyPlanResponse>('/dailyPlan', {
              method: 'POST',
              body: JSON.stringify(restNoAccount),
            });
          }
          throw fallbackError;
        }
      }
      if (input.accountId) {
        const { accountId, ...rest } = input;
        return apiFetch<DailyPlanResponse>('/dailyPlan', {
          method: 'POST',
          body: JSON.stringify(rest),
        });
      }
    }
    throw error;
  }
}

export async function findOrCreateDailyPlanForMentee(
  menteeId: number,
  input: DailyPlanCreateRequest
): Promise<DailyPlanResponse> {
  const payload = {
    ...(input.planDate ? { planDate: input.planDate } : {}),
    ...(input.comment ? { comment: input.comment } : {}),
  };
  return apiFetch<DailyPlanResponse>(`/dailyPlan/mentees/${menteeId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
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
