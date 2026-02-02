'use client';

import Link from 'next/link';
import { useState } from 'react';
import LoginCard, { LoginRole } from '@/src/components/auth/LoginCard';

export default function Home() {
  const [role, setRole] = useState<LoginRole>('mentee');

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-black" aria-hidden />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Seolstudy</p>
              <p className="text-sm font-semibold">학습 코칭 플랫폼</p>
            </div>
          </div>
          <div className="hidden gap-4 text-sm font-medium text-neutral-600 md:flex">
            <Link href="/planner" className="hover:text-neutral-900">
              플래너
            </Link>
            <Link href="/feedback" className="hover:text-neutral-900">
              피드백
            </Link>
            <Link href="/mentees" className="hover:text-neutral-900">
              멘토 대시보드
            </Link>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold leading-tight lg:text-4xl">설스터디</h1>
            <p className="text-base text-neutral-600">
              멘티는 하루 플래너와 과제를, 멘토는 멘티 관리와 피드백을 한 곳에서. 흑백 톤으로 정돈된 홈에서
              원하는 역할로 바로 로그인하세요.
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-neutral-600">
              <span className="rounded-full bg-neutral-100 px-3 py-1">반응형 지원</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1">멘티 · 멘토 분리</span>
              <span className="rounded-full bg-neutral-100 px-3 py-1">플래너·과제·피드백</span>
            </div>
            <Link
              href="/task"
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              로그인 없이 멘티 화면 둘러보기
            </Link>
          </div>

          <LoginCard role={role} onRoleChange={setRole} />
        </section>
      </div>
    </main>
  );
}
