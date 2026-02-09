import { apiFetch } from '@/src/services/appClient';

type MenteeActiveLevel = 'NORMAL' | 'WARNING' | 'DANGER';

type MenteeActiveLevelResponse = {
  menteeId: number;
  activeLevel: MenteeActiveLevel;
};

type MenteeSummaryResponse = {
  menteeId: number;
  accountId: string;
  activeLevel: MenteeActiveLevel;
};

export async function updateMenteeActiveLevel(
  menteeId: number,
  activeLevel: MenteeActiveLevel
): Promise<MenteeActiveLevelResponse> {
  return apiFetch<MenteeActiveLevelResponse>(`/mentees/${menteeId}/active-level`, {
    method: 'PUT',
    body: JSON.stringify({ activeLevel }),
  });
}

export async function listMenteesByMentor(): Promise<MenteeSummaryResponse[]> {
  return apiFetch<MenteeSummaryResponse[]>('/mentors/me/mentees');
}
