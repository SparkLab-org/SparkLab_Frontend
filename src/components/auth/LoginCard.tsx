'use client';

import { useMemo } from 'react';
import { useState } from 'react';
import { signIn } from '@/src/services/auth.api';
import { useAuthStore } from '@/src/store/authStore';


export type LoginRole = 'mentee' | 'mentor';

type Props = {
  role: LoginRole;
  onRoleChange: (role: LoginRole) => void;
};

export default function LoginCard({ role, onRoleChange }: Props) {
  const [accountId, setAccountId] = useState('');
  const [accountPw, setAccountPw] = useState('');
  const [error, setError] = useState('');


  const title = useMemo(
    () => (role === 'mentee' ? '멘티 로그인' : '멘토 로그인'),
    [role]
  );

  const subtitle = useMemo(
    () =>
      role === 'mentee'
        ? '플래너 · 과제 · 마이페이지'
        : '멘티 목록 · 피드백 작성',
    [role]
  );

  const cta = useMemo(
    () => (role === 'mentee' ? '멘티로 로그인' : '멘토로 로그인'),
    [role]
  );

   const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await signIn({ accountId, accountPw });
      console.log('signin res:', res);
      // ✅ 토큰 저장
      localStorage.setItem('accessToken', res.accessToken);
      setAuthenticated(true);

      // 로그인 성공 후 이동
      window.location.href = '/planner';
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };


  return (
    <div className="space-y-4 rounded-3xl border border-neutral-200 bg-neutral-50 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
      <div className="flex justify-center">
        <div className="inline-flex rounded-full bg-neutral-200 p-1 text-sm font-semibold">
          {(
            [
              { value: 'mentee', label: '멘티' },
              { value: 'mentor', label: '멘토' },
            ] as const
          ).map((item) => {
            const active = role === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onRoleChange(item.value)}
                className={[
                  'rounded-full px-4 py-2 transition',
                  active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800',
                ].join(' ')}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            value={accountId}
            onChange={(e)=>setAccountId(e.target.value)}
            placeholder="아이디"
            className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />
          <input
            value={accountPw}
            onChange={(e)=>setAccountPw(e.target.value)}
            type="password"
            placeholder="비밀번호"
            className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {cta}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-600">
        계정이 없다면 설스터디에서 학습코칭 상담을 받아보세요.
      </div>
    </div>
  );
}
