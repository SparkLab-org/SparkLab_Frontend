'use client';

import { useMemo } from 'react';
import { useState } from 'react';
import { signIn } from '@/src/services/auth.api';
import { getMe } from '@/src/services/auth.me.api';
import { findOrCreateDailyPlan } from '@/src/services/dailyPlan.api';
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


  const title = useMemo(() => '', []);

  const subtitle = useMemo(
    () =>
      role === 'mentee'
        ? ''
        : '',
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
      if (typeof window !== 'undefined') {
        // 이전 계정 정보 정리 (계정 섞임 방지)
        const keysToRemove = ['accountId', 'menteeId', 'mentorId', 'plannerId', 'role'];
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        for (let i = localStorage.length - 1; i >= 0; i -= 1) {
          const key = localStorage.key(i);
          if (!key) continue;
          if (key.startsWith('dailyPlan:') || key.startsWith('plannerId:')) {
            localStorage.removeItem(key);
          }
        }
      }
      const res = await signIn({ accountId, password: accountPw });
      console.log('signin res:', res);
      // ✅ 토큰 저장
      localStorage.setItem('accessToken', res.accessToken);
      const fallbackRole = role === 'mentor' ? 'MENTOR' : 'MENTEE';
      let nextPath = fallbackRole === 'MENTOR' ? '/mentor' : '/planner';
      try {
        const me = await getMe();
        let resolvedMenteeId: number | null = null;
        let resolvedMentorId: number | null = null;
        if (typeof me.accountId === 'string') {
          localStorage.setItem('accountId', me.accountId);
        }
        if (me.menteeId !== undefined && me.menteeId !== null) {
          const parsed =
            typeof me.menteeId === 'number'
              ? me.menteeId
              : Number(me.menteeId);
          if (Number.isFinite(parsed)) {
            resolvedMenteeId = parsed;
          }
        }
        if (me.mentorId !== undefined && me.mentorId !== null) {
          const parsed =
            typeof me.mentorId === 'number'
              ? me.mentorId
              : Number(me.mentorId);
          if (Number.isFinite(parsed)) {
            resolvedMentorId = parsed;
          }
        }
        if (resolvedMentorId !== null) {
          localStorage.setItem('mentorId', String(resolvedMentorId));
        }
        if (me.plannerId !== undefined && me.plannerId !== null) {
          const parsed =
            typeof me.plannerId === 'number'
              ? me.plannerId
              : Number(me.plannerId);
          if (Number.isFinite(parsed)) {
            localStorage.setItem('plannerId', String(parsed));
          }
        } else {
          // 임시 값: 백엔드에 실제 plannerId가 없을 때 0으로 저장
          localStorage.setItem('plannerId', '0');
        }

        let resolvedRole = fallbackRole;
        if (resolvedMentorId !== null) {
          resolvedRole = 'MENTOR';
        } else if (resolvedMenteeId !== null) {
          resolvedRole = 'MENTEE';
        } else if (Array.isArray(me.roles)) {
          const roles = me.roles.map((role) => String(role).toUpperCase());
          if (roles.some((item) => item.includes('MENTOR'))) {
            resolvedRole = 'MENTOR';
          } else if (roles.some((item) => item.includes('MENTEE'))) {
            resolvedRole = 'MENTEE';
          }
        }

        if (resolvedRole === 'MENTEE' && resolvedMenteeId === null) {
          const rawAccountId = typeof me.accountId === 'string' ? me.accountId : '';
          const numericMatch = rawAccountId.match(/\d+/);
          const fallbackAccountId = numericMatch ? Number(numericMatch[0]) : undefined;
          if (fallbackAccountId && Number.isFinite(fallbackAccountId)) {
            resolvedMenteeId = fallbackAccountId;
          }
        }

        if (resolvedRole === 'MENTEE' && resolvedMenteeId !== null) {
          localStorage.setItem('menteeId', String(resolvedMenteeId));
          const now = new Date();
          const yyyy = now.getFullYear();
          const mm = String(now.getMonth() + 1).padStart(2, '0');
          const dd = String(now.getDate()).padStart(2, '0');
          const planDate = `${yyyy}-${mm}-${dd}`;
          try {
            const res = await findOrCreateDailyPlan({ planDate });
            if (res.dailyPlanId && res.dailyPlanId > 0) {
              localStorage.setItem('plannerId', String(res.dailyPlanId));
              if (typeof me.accountId === 'string') {
                localStorage.setItem(
                  `plannerId:${me.accountId}`,
                  String(res.dailyPlanId)
                );
              }
            }
          } catch {
            // ignore dailyPlan failures
          }
        }

        localStorage.setItem('role', resolvedRole);
        nextPath = resolvedRole === 'MENTOR' ? '/mentor' : '/planner';
      } catch {
        localStorage.setItem('role', fallbackRole);
      }
      setAuthenticated(true);

      // 로그인 성공 후 이동
      window.location.href = nextPath;
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };


  return (
    <div className="space-y-4 rounded-3xl bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
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
                  active
                    ? 'bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800',
                ].join(' ')}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl px-3 py-1">
        {title ? (
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
        ) : null}
        {subtitle ? (
          <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
        ) : null}
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            value={accountId}
            onChange={(e)=>setAccountId(e.target.value)}
            placeholder="아이디"
            className="w-full rounded-lg bg-[#F6F8FA] px-3 py-3 text-sm font-semibold text-[#2B2B2B] outline-none focus:border-[#3D9DF3]"
          />
          <input
            value={accountPw}
            onChange={(e)=>setAccountPw(e.target.value)}
            type="password"
            placeholder="비밀번호"
            className="w-full rounded-lg bg-[#F6F8FA] px-3 py-3 text-sm font-semibold text-[#2B2B2B] outline-none focus:border-[#3D9DF3]"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-xl bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-3 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            {cta}
          </button>
        </form>
      </div>

      <p className="text-sm text-neutral-400">
        계정이 없다면 설스터디에서
        <span className="block sm:inline"> 학습코칭 상담을 받아보세요.</span>
      </p>
    </div>
  );
}
