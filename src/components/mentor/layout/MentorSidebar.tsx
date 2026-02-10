'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signOut } from '@/src/services/auth.api';
import { useAuthStore } from '@/src/store/authStore';
import feedbackIcon from '@/src/assets/icons/feedback.svg';
import feedbackActiveIcon from '@/src/assets/icons/feedbackActive.svg';
import menteesIcon from '@/src/assets/icons/mentees.svg';
import menteesActiveIcon from '@/src/assets/icons/menteesActive.svg';
import plannerIcon from '@/src/assets/icons/planner.svg';
import plannerActiveIcon from '@/src/assets/icons/plannerActive.svg';

const navItems = [
  {
    href: '/mentor/mentee',
    label: '멘티',
    icon: menteesIcon,
    iconActive: menteesActiveIcon,
  },
  {
    href: '/mentor/planner',
    label: '플래너',
    icon: plannerIcon,
    iconActive: plannerActiveIcon,
  },
  {
    href: '/mentor/feedback',
    label: '피드백',
    icon: feedbackIcon,
    iconActive: feedbackActiveIcon,
  },
];

export default function MentorSidebar() {
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // ignore signout failures
    } finally {
      logout();
    }
  };

  return (
    <aside className="w-full shrink-0  border-[#F5F5F5] lg:max-w-[220px] lg:sticky lg:top-[88px]">
      <div className="flex h-full flex-col gap-6 bg-white px-4 py-6">
        <nav className="space-y-1 text-sm">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const iconValue = active ? item.iconActive ?? item.icon : item.icon ?? item.iconActive;
            const iconSrc = typeof iconValue === 'string' ? iconValue : iconValue?.src;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition',
                  active
                    ? 'bg-neutral-100 text-[#0528F3]'
                    : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700',
                ].join(' ')}
              >
                {iconSrc ? (
                  <img className="h-5 w-5" src={iconSrc} alt="" aria-hidden />
                ) : null}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  );
}
