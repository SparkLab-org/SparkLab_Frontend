'use client';

import Link from 'next/link';
import LoginCard, { LoginRole } from '@/src/components/auth/LoginCard';
import { useUiPreferenceStore } from '@/src/store/uiPreferenceStore';
import seolStudyIcon from '@/src/assets/icons/seolStudy.svg';

export default function Home() {
  const role = useUiPreferenceStore((s) => s.homeRole);
  const setRole = useUiPreferenceStore((s) => s.setHomeRole);
  const brandIconSrc = typeof seolStudyIcon === 'string' ? seolStudyIcon : seolStudyIcon?.src;

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandIconSrc ? (
              <img src={brandIconSrc} alt="설스터디" className="h-9 w-9" />
            ) : null}
            <div>
              <p className="text-3xl uppercase font-semibold text-neutral-900">설스터디</p>
              <p className="text-sm font-semibold text-neutral-500">학습 코칭 플랫폼</p>
            </div>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <h1 className="text-lg font-semibold leading-tight lg:text-4xl">로그인</h1>
            <p className="text-base text-neutral-600">
              멘티는 하루 플래너와 과제를, 멘토는 멘티 관리와 피드백을 한 곳에서.
            </p>
          </div>

          <LoginCard role={role} onRoleChange={setRole} />
        </section>
      </div>
    </main>
  );
}
