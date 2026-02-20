import { apiFetch } from '@/src/services/appClient';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export type AuthMeResponse = {
  accountId?: string;
  roles?: string[];
  mentorId?: number;
  menteeId?: number;
  plannerId?: number;
  [key: string]: unknown;
};

function toNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function resolveRoleFromStorage(): 'MENTOR' | 'MENTEE' {
  if (typeof window === 'undefined') return 'MENTEE';
  const stored = window.localStorage.getItem('role');
  if (stored?.toUpperCase() === 'MENTOR') return 'MENTOR';
  return 'MENTEE';
}

export async function getMe(): Promise<AuthMeResponse> {
  if (DEMO_MODE) {
    const role = resolveRoleFromStorage();
    if (typeof window === 'undefined') {
      return { roles: [role] };
    }
    const accountId =
      window.localStorage.getItem('accountId') ??
      (role === 'MENTOR' ? 'demo-mentor' : 'demo-mentee');
    const mentorId =
      role === 'MENTOR'
        ? toNumber(window.localStorage.getItem('mentorId')) ?? 1
        : undefined;
    const menteeId =
      role === 'MENTEE'
        ? toNumber(window.localStorage.getItem('menteeId')) ?? 1
        : undefined;
    const plannerId = toNumber(window.localStorage.getItem('plannerId'));
    return {
      accountId,
      roles: [role],
      mentorId,
      menteeId,
      plannerId,
    };
  }
  return apiFetch<AuthMeResponse>('/auth/me');
}
