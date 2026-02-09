'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MentorPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mentor/mentee');
  }, [router]);

  return (
    <div className="rounded-3xl bg-[#F5F5F5] p-6">
      <p className="text-sm text-neutral-500">담당 멘티 화면으로 이동 중입니다.</p>
    </div>
  );
}
