'use client';

import Link from 'next/link';
import LoginCard, { LoginRole } from '@/src/components/auth/LoginCard';
import { useUiPreferenceStore } from '@/src/store/uiPreferenceStore';
import seolStudyIcon from '@/src/assets/icons/seolStudy.svg';
import sparkLabIcon from '@/src/assets/icons/sparkLab.svg';

export default function Home() {
  const role = useUiPreferenceStore((s) => s.homeRole);
  const setRole = useUiPreferenceStore((s) => s.setHomeRole);
  const brandIconSrc = typeof seolStudyIcon === 'string' ? seolStudyIcon : seolStudyIcon?.src;
  const sparkLabIconSrc = typeof sparkLabIcon === 'string' ? sparkLabIcon : sparkLabIcon?.src;

  return (
    <main className="min-h-screen bg-[#F6F8FA] text-neutral-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandIconSrc ? (
              <img src={brandIconSrc} alt="설스터디" className="h-10 w-10 sm:h-15 sm:w-15" />
            ) : null}
            <div>
              <p className="text-2xl uppercase font-semibold text-neutral-900 sm:text-3xl">설스터디</p>
              <p className="text-xs font-semibold text-neutral-500 sm:text-sm">학습 코칭 플랫폼</p>
            </div>
          </div>
          <a
            href="https://forms.gle/FchKdDcm23JdGHpK9"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-4 py-2 text-xs font-semibold text-white"
          >
            상담 받기
          </a>
        </header>

        <section className="flex flex-col items-center gap-5 text-center">
          <div className="space-y-4">
            <h1 className="text-lg font-semibold leading-tight lg:text-4xl">로그인</h1>
            
          </div>

          <div className="w-full max-w-md">
            <LoginCard role={role} onRoleChange={setRole} />
          </div>
        </section>

        <footer className="mt-12 flex flex-col items-center gap-2 text-center text-[9px] text-neutral-500 sm:mt-62 sm:text-xs">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {sparkLabIconSrc ? (
              <img src={sparkLabIconSrc} alt="SparkLab" className="h-12 w-auto sm:h-24" />
            ) : null}
            <div>
              <p>제4회 2026 블레이버스 MVP 개발 해커톤</p>
              <p>차유진 · 양보경 · 이채윤 · 차재혁 · 허가경</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
