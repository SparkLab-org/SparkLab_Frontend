import { apiFetch } from '@/src/services/appClient';

type MenteeActiveLevel = 'NORMAL' | 'WARNING' | 'DANGER';

type MenteeActiveLevelResponse = {
  menteeId: number;
  activeLevel: MenteeActiveLevel;
};

export async function updateMenteeActiveLevel(
  mentorId: number,
  menteeId: number,
  activeLevel: MenteeActiveLevel
): Promise<MenteeActiveLevelResponse> {
  return apiFetch<MenteeActiveLevelResponse>(
    `/mentors/${mentorId}/mentees/${menteeId}/active-level`,
    {
      method: 'PUT',
      body: JSON.stringify({ activeLevel }),
    }
  );
}
