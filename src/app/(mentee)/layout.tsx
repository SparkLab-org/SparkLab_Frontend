'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import TimerFloatingWidget from '@/src/components/planner/TimerFloatingWidget';
import { useAuthStore } from '@/src/store/authStore';
import feedbackIcon from '@/src/assets/icons/feedback.svg';
import feedbackActiveIcon from '@/src/assets/icons/feedbackActive.svg';
import plannerIcon from '@/src/assets/icons/planner.svg';
import plannerActiveIcon from '@/src/assets/icons/plannerActive.svg';
import mypageIcon from '@/src/assets/icons/mypage.svg';
import mypageActiveIcon from '@/src/assets/icons/mypageActive.svg';

const navItems = [
  {
    href: '/feedback',
    label: '피드백',
    icon: feedbackIcon,
    iconActive: feedbackActiveIcon,
  },
  {
    href: '/planner',
    label: '플래너',
    icon: plannerIcon,
    iconActive: plannerActiveIcon,
  },
  {
    href: '/my',
    label: '마이페이지',
    icon: mypageIcon,
    iconActive: mypageActiveIcon,
  },
];

function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-5 z-50 mx-4 rounded-[50px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(240,240,240,0.35)_100%)] px-5 py-0.3 text-neutral-700 shadow-[0_10px_24px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(255,255,255,0.25)] backdrop-blur-[28px] backdrop-saturate-180 ring-1 ring-white/35">
      <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
        {navItems.map(({ href, label, icon, iconActive }) => {
          const active = href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(`${href}/`);
          const iconValue = active ? iconActive ?? icon : icon ?? iconActive;
          let iconNode: React.ReactNode = null;
          if (iconValue) {
            if (typeof iconValue === 'function') {
              const IconComponent = iconValue as React.ComponentType<{ className?: string }>;
              iconNode = <IconComponent className="h-10 w-10" aria-hidden />;
            } else {
              const src = typeof iconValue === 'string' ? iconValue : iconValue?.src;
              if (src) {
                iconNode = <img className="h-10 w-10" src={src} alt="" aria-hidden />;
              }
            }
          }
          const activePillClass = [
            'flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition',
            active ? 'bg-neutral-200/50' : 'bg-transparent',
          ].join(' ');

          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 transition',
                active ? 'text-[#0528F3]' : 'text-neutral-400 hover:text-neutral-600',
              ].join(' ')}
            >
              <span className={activePillClass}>
                <span className="flex h-8 w-20 items-center justify-center rounded-full" aria-hidden>
                  {iconNode ?? (
                    <span
                      className={[
                        'h-8 w-8 rounded-[30px]',
                        active ? 'bg-[#004DFF]' : 'bg-neutral-300',
                      ].join(' ')}
                    />
                  )}
                </span>
                <span>{label}</span>
              </span>
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
  const isPlannerOrMy = pathname === '/planner' || pathname === '/my';
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

  const layoutBgClass = isPlannerOrMy ? 'bg-[#F6F8FA]' : 'bg-white';

  return (
    <div
      className={[
        'mx-auto flex min-h-screen w-full max-w-full flex-col text-neutral-900 lg:max-w-none xl:max-w-6xl',
        layoutBgClass,
      ].join(' ')}
    >
      <main className="flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-10">{children}</main>

      <TimerFloatingWidget />
      <Nav />
    </div>
  );
}
