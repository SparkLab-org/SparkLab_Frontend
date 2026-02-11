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

export type DailyPlanItem = {
  dailyPlanId?: number;
  menteeId?: number;
  planDate?: string;
  comment?: string | null;
  [key: string]: unknown;
};

export type DailyPlanRangeParams = {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
};

function buildRangeQuery(params: DailyPlanRangeParams): string {
  const search = new URLSearchParams();
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function findOrCreateDailyPlan(
  input: DailyPlanCreateRequest
): Promise<DailyPlanResponse> {
  const payload = {
    ...(input.planDate ? { planDate: input.planDate } : {}),
    ...(input.comment ? { comment: input.comment } : {}),
  };
  return apiFetch<DailyPlanResponse>('/dailyPlan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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

export async function listDailyPlans(params: DailyPlanRangeParams): Promise<DailyPlanItem[]> {
  const query = buildRangeQuery(params);
  if (!query) return [];
  return apiFetch<DailyPlanItem[]>(`/dailyPlan${query}`);
}

export async function listDailyPlansForMentee(
  menteeId: number,
  params: DailyPlanRangeParams
): Promise<DailyPlanItem[]> {
  const query = buildRangeQuery(params);
  if (!query) return [];
  return apiFetch<DailyPlanItem[]>(`/dailyPlan/mentees/${menteeId}${query}`);
}

export async function getTodayDailyPlan(): Promise<DailyPlanItem | null> {
  try {
    return await apiFetch<DailyPlanItem>('/dailyPlan/today');
  } catch {
    return null;
  }
}
