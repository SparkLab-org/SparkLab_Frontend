'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import MentorSidebar from '@/src/components/mentor/layout/MentorSidebar';
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
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:px-6">
        <MentorSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
