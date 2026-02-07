'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import TimerFloatingWidget from '@/src/components/planner/TimerFloatingWidget';
import { useAuthStore } from '@/src/store/authStore';

const navItems = [
  { href: '/feedback', label: '피드백' },
  { href: '/planner', label: '플래너' },
  { href: '/my', label: '마이페이지' },
];

function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 border-t border-neutral-200 bg-white/90 px-4 py-3 text-neutral-800 backdrop-blur">
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        {navItems.map(({ href, label }) => {
          const active = href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition',
                active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600',
              ].join(' ')}
            >
              <span
                className={[
                  'h-5 w-5 rounded-full',
                  active ? 'bg-neutral-900' : 'bg-neutral-300',
                ].join(' ')}
                aria-hidden
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function MenteeLayout({ children }: { children: React.ReactNode }) {
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
    if (role && role !== 'MENTEE') {
      router.replace('/mentor');
    }
  }, [isAuthenticated, role, router, pathname]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-full lg:max-w-none xl:max-w-6xl flex-col bg-white text-neutral-900">
      <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10">{children}</main>

      <TimerFloatingWidget />
      <Nav />
    </div>
  );
}
