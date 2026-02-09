'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MentorSidebar from '@/src/components/mentor/layout/MentorSidebar';
import MentorTopBar from '@/src/components/mentor/layout/MentorTopBar';
import { useAuthStore } from '@/src/store/authStore';

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
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

  return (
    <div className="min-h-screen bg-white">
      <MentorTopBar />
      <div className="flex w-full flex-col lg:flex-row lg:items-start">
        <MentorSidebar />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
