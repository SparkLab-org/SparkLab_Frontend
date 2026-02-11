import { apiFetch } from '@/src/services/appClient';

export type MentorMyPageRes = {
  mentorId?: number;
  accountId?: string;
  subject?: string;
  menteeCount?: number;
};

export type MenteeMyPageRes = {
  menteeId?: number;
  accountId?: string;
  activeLevel?: 'NORMAL' | 'WARNING' | 'DANGER';
  mentorId?: number;
  mentorAccountId?: string;
  mentorSubject?: string;
  totalTodoCount?: number;
  completedTodoCount?: number;
  achievementRate?: number;
};

export async function getMentorMyPage(): Promise<MentorMyPageRes> {
  return apiFetch<MentorMyPageRes>('/mypage/mentor');
}

export async function getMenteeMyPage(): Promise<MenteeMyPageRes> {
  return apiFetch<MenteeMyPageRes>('/mypage/mentee');
}
