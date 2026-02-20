import { apiFetch } from '@/src/services/appClient';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const DEMO_DAILY_PLAN_STORAGE_KEY = 'demo-daily-plans-v2';

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

type DemoDailyPlan = {
  dailyPlanId: number;
  menteeId?: number;
  planDate: string;
  comment?: string | null;
};

function todayISO(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function dateOffsetISO(offsetDays: number): string {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDate(value?: string): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return todayISO();
}

function toPositiveNumber(value: unknown): number | undefined {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.floor(parsed);
}

function resolveStoredRole(): 'MENTOR' | 'MENTEE' | null {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem('role');
  if (!stored) return null;
  const normalized = stored.toUpperCase();
  if (normalized === 'MENTOR') return 'MENTOR';
  if (normalized === 'MENTEE') return 'MENTEE';
  return null;
}

function resolveDemoMenteeId(inputMenteeId?: number): number | undefined {
  if (typeof inputMenteeId === 'number') return toPositiveNumber(inputMenteeId);
  if (typeof window === 'undefined') return undefined;
  return toPositiveNumber(window.localStorage.getItem('menteeId'));
}

function defaultDemoDailyPlans(): DemoDailyPlan[] {
  return [
    {
      dailyPlanId: 1,
      menteeId: 1,
      planDate: dateOffsetISO(-1),
      comment: '수학 오답노트 복습, 영어 단어 누적 120개.',
    },
    {
      dailyPlanId: 2,
      menteeId: 1,
      planDate: dateOffsetISO(0),
      comment: '모의고사 풀이 후 약한 단원만 30분 추가 복습.',
    },
    {
      dailyPlanId: 3,
      menteeId: 2,
      planDate: dateOffsetISO(0),
      comment: '지문 해석 속도 개선 연습, 단어 테스트 2회.',
    },
    {
      dailyPlanId: 4,
      menteeId: 3,
      planDate: dateOffsetISO(0),
      comment: '실전 수학 1회 + 영어 듣기 오답 정리.',
    },
    {
      dailyPlanId: 5,
      menteeId: 4,
      planDate: dateOffsetISO(0),
      comment: '국어 서술형 구조 연습, 영어 받아쓰기 점검.',
    },
    {
      dailyPlanId: 6,
      menteeId: 5,
      planDate: dateOffsetISO(0),
      comment: '킬러문항 풀이 전략 점검, 풀이 실수 체크리스트 작성.',
    },
  ];
}

function readDemoDailyPlans(): DemoDailyPlan[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(DEMO_DAILY_PLAN_STORAGE_KEY);
  if (!raw) {
    const seeded = defaultDemoDailyPlans();
    writeDemoDailyPlans(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as DemoDailyPlan[];
    if (!Array.isArray(parsed)) return [];
    const normalized = parsed
      .map((item) => {
        const dailyPlanId = toPositiveNumber(item?.dailyPlanId);
        const menteeId = toPositiveNumber(item?.menteeId);
        if (!dailyPlanId) return null;
        return {
          dailyPlanId,
          ...(menteeId ? { menteeId } : {}),
          planDate: normalizeDate(item?.planDate),
          ...(typeof item?.comment === 'string' || item?.comment === null
            ? { comment: item.comment }
            : {}),
        } as DemoDailyPlan;
      })
      .filter((item): item is DemoDailyPlan => Boolean(item));
    if (normalized.length === 0) {
      const seeded = defaultDemoDailyPlans();
      writeDemoDailyPlans(seeded);
      return seeded;
    }
    return normalized;
  } catch {
    const seeded = defaultDemoDailyPlans();
    writeDemoDailyPlans(seeded);
    return seeded;
  }
}

function writeDemoDailyPlans(plans: DemoDailyPlan[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DEMO_DAILY_PLAN_STORAGE_KEY, JSON.stringify(plans));
}

function nextDemoDailyPlanId(plans: DemoDailyPlan[]) {
  const maxId = plans.reduce((max, item) => Math.max(max, item.dailyPlanId), 0);
  return maxId + 1;
}

function toDailyPlanItem(plan: DemoDailyPlan): DailyPlanItem {
  return {
    dailyPlanId: plan.dailyPlanId,
    menteeId: plan.menteeId,
    planDate: plan.planDate,
    comment: plan.comment ?? null,
  };
}

function findOrCreateDemoDailyPlan(input: DailyPlanCreateRequest): DailyPlanResponse {
  const planDate = normalizeDate(input.planDate);
  const menteeId = resolveDemoMenteeId(input.menteeId);
  const plans = readDemoDailyPlans();
  const found = plans.find(
    (plan) =>
      plan.planDate === planDate &&
      (typeof menteeId === 'number' ? plan.menteeId === menteeId : true)
  );
  if (found) {
    if (typeof input.comment === 'string') {
      found.comment = input.comment;
      writeDemoDailyPlans(plans);
    }
    return {
      dailyPlanId: found.dailyPlanId,
      comment: typeof found.comment === 'string' ? found.comment : undefined,
      created: false,
    };
  }

  const createdPlan: DemoDailyPlan = {
    dailyPlanId: nextDemoDailyPlanId(plans),
    ...(typeof menteeId === 'number' ? { menteeId } : {}),
    planDate,
    ...(typeof input.comment === 'string' ? { comment: input.comment } : {}),
  };
  plans.push(createdPlan);
  writeDemoDailyPlans(plans);
  return {
    dailyPlanId: createdPlan.dailyPlanId,
    comment: typeof createdPlan.comment === 'string' ? createdPlan.comment : undefined,
    created: true,
  };
}

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
  if (DEMO_MODE) {
    return findOrCreateDemoDailyPlan(input);
  }
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
  if (DEMO_MODE) {
    return findOrCreateDemoDailyPlan({
      ...input,
      menteeId,
    });
  }
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
  if (DEMO_MODE) {
    const plans = readDemoDailyPlans();
    const index = plans.findIndex((plan) => plan.dailyPlanId === dailyPlanId);
    if (index < 0) {
      return {
        dailyPlanId,
        comment: input.comment ?? '',
        created: false,
      };
    }
    plans[index] = {
      ...plans[index],
      comment: input.comment ?? '',
    };
    writeDemoDailyPlans(plans);
    return {
      dailyPlanId,
      comment: input.comment ?? '',
      created: false,
    };
  }
  return apiFetch<DailyPlanResponse>(`/dailyPlan/${dailyPlanId}/comment`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function listDailyPlans(params: DailyPlanRangeParams): Promise<DailyPlanItem[]> {
  if (DEMO_MODE) {
    const startDate = normalizeDate(params.startDate);
    const endDate = normalizeDate(params.endDate);
    const role = resolveStoredRole();
    const menteeId = role === 'MENTEE' ? resolveDemoMenteeId() : undefined;
    return readDemoDailyPlans()
      .filter((plan) => plan.planDate >= startDate && plan.planDate <= endDate)
      .filter((plan) => (typeof menteeId === 'number' ? plan.menteeId === menteeId : true))
      .sort((a, b) => a.planDate.localeCompare(b.planDate))
      .map(toDailyPlanItem);
  }
  const query = buildRangeQuery(params);
  if (!query) return [];
  return apiFetch<DailyPlanItem[]>(`/dailyPlan${query}`);
}

export async function listDailyPlansForMentee(
  menteeId: number,
  params: DailyPlanRangeParams
): Promise<DailyPlanItem[]> {
  if (DEMO_MODE) {
    const startDate = normalizeDate(params.startDate);
    const endDate = normalizeDate(params.endDate);
    return readDemoDailyPlans()
      .filter((plan) => plan.planDate >= startDate && plan.planDate <= endDate)
      .filter((plan) => plan.menteeId === menteeId)
      .sort((a, b) => a.planDate.localeCompare(b.planDate))
      .map(toDailyPlanItem);
  }
  const query = buildRangeQuery(params);
  if (!query) return [];
  return apiFetch<DailyPlanItem[]>(`/dailyPlan/mentees/${menteeId}${query}`);
}

export async function getTodayDailyPlan(): Promise<DailyPlanItem | null> {
  if (DEMO_MODE) {
    const today = todayISO();
    const role = resolveStoredRole();
    const menteeId = role === 'MENTEE' ? resolveDemoMenteeId() : undefined;
    const found = readDemoDailyPlans().find(
      (plan) =>
        plan.planDate === today &&
        (typeof menteeId === 'number' ? plan.menteeId === menteeId : true)
    );
    return found ? toDailyPlanItem(found) : null;
  }
  try {
    return await apiFetch<DailyPlanItem>('/dailyPlan/today');
  } catch {
    return null;
  }
}
