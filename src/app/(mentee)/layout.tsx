'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/task', label: '과제' },
  { href: '/planner', label: '플래너' },
  { href: '/', label: '메인페이지' },
];

function Nav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 border-t border-neutral-200 bg-neutral-950 px-4 py-2 text-white">
      <div className="grid grid-cols-3 gap-2 text-center text-sm font-semibold">
        {navItems.map(({ href, label }) => {
          const active = href === '/'
            ? pathname === '/'
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={[
                'rounded-xl px-3 py-2 transition',
                active ? 'bg-white text-neutral-900 shadow-[0_6px_20px_rgba(0,0,0,0.12)]' : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700',
              ].join(' ')}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function MenteeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-full lg:max-w-none xl:max-w-6xl flex-col bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white px-4 py-3 sm:px-6 lg:px-10">
        <h1 className="text-lg font-semibold">설스터디 멘티</h1>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">{children}</main>

      <Nav />
    </div>
  );
}
