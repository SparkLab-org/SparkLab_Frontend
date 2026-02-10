'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MentorSidebar from '@/src/components/mentor/layout/MentorSidebar';
import MentorTopBar from '@/src/components/mentor/layout/MentorTopBar';
import { useAuthStore } from '@/src/store/authStore';
import { useMentorMenteesQuery } from '@/src/hooks/menteeQueries';
import { useMentorStore } from '@/src/store/mentorStore';
import type { Mentee } from '@/src/components/mentor/types';

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setMentees = useMentorStore((s) => s.setMentees);
  const { data: menteeData, isSuccess } = useMentorMenteesQuery();
  const role = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem('role');
    return stored ? stored.toUpperCase() : null;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (role && role !== 'MENTOR') {
      router.replace('/planner');
    }
  }, [isAuthenticated, role, router, pathname]);

  useEffect(() => {
    if (!isSuccess || !menteeData) return;
    if (menteeData.length === 0) return;
    const mapped: Mentee[] = menteeData.map((mentee) => ({
      id: String(mentee.menteeId),
      name: mentee.accountId ?? `멘티 ${mentee.menteeId}`,
      grade: '학년 미정',
      track: '',
      progress: 0,
      subjects: [],
      weaknessType: '',
      goalRate: 0,
      activeLevel: mentee.activeLevel ?? 'NORMAL',
      today: [],
    }));
    setMentees(mapped);
  }, [isSuccess, menteeData, setMentees]);

  return (
    <div className="min-h-screen bg-white">
      <MentorTopBar />
      <div className="flex w-full flex-col lg:flex-row lg:items-start">
        <MentorSidebar />
        <main className="flex-1 bg-[#F6F8FA] px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
