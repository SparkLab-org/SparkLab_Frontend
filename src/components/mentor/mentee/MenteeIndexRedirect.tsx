'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMentorStore } from '@/src/store/mentorStore';

export default function MenteeIndexRedirect() {
  const mentees = useMentorStore((s) => s.mentees);
  const router = useRouter();

  useEffect(() => {
    if (mentees[0]) {
      router.replace(`/mentor/mentee/${mentees[0].id}`);
    }
  }, [mentees, router]);

  return (
    <div className="rounded-3xl bg-white p-6">
      <p className="text-sm text-neutral-500">멘티를 선택해주세요.</p>
    </div>
  );
}
