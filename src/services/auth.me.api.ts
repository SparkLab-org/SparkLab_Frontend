import { apiFetch } from '@/src/services/appClient';

export type AuthMeResponse = {
  accountId?: string;
  roles?: string[];
  mentorId?: number;
  menteeId?: number;
  plannerId?: number;
  [key: string]: unknown;
};

export async function getMe(): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>('/auth/me');
}
