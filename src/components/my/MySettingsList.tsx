'use client';

import { ChevronRight } from 'lucide-react';

export default function MySettingsList() {
  return (
    <section className="divide-y divide-neutral-100 rounded-3xl">
      <button type="button" className="flex w-full items-center justify-between px-4 py-4 text-sm font-semibold">
        <span>개인정보 관리</span>
        <ChevronRight className="h-4 w-4 text-neutral-300" aria-hidden />
      </button>
      <button type="button" className="flex w-full items-center justify-between px-4 py-4 text-sm font-semibold">
        <span>알림설정</span>
        <ChevronRight className="h-4 w-4 text-neutral-300" aria-hidden />
      </button>
    </section>
  );
}
