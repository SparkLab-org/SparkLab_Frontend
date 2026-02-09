'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { usePlannerStore } from '@/src/store/plannerStore';
import {
  useFindOrCreateDailyPlanMutation,
  useUpdateDailyPlanCommentMutation,
} from '@/src/hooks/dailyPlanQueries';

const STORAGE_PREFIX = 'dailyPlanComment';
const DAILY_PLAN_CACHE_PREFIX = 'dailyPlan';
const DAILY_PLAN_FAIL_PREFIX = 'dailyPlanFail';
const DAILY_PLAN_DISABLED_KEY = 'dailyPlanDisabledUntil';
const FAIL_TTL_MS = 5 * 60 * 1000;

export default function DailyPlanCommentCard() {
  const selectedDate = usePlannerStore((s) => s.selectedDate);
  const [dailyPlanId, setDailyPlanId] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const findOrCreateMutation = useFindOrCreateDailyPlanMutation();
  const updateCommentMutation = useUpdateDailyPlanCommentMutation();

  const dateLabel = useMemo(
    () => format(new Date(selectedDate), 'M월 d일', { locale: ko }),
    [selectedDate]
  );

  useEffect(() => {
    setDailyPlanId(null);
    setStatus('idle');
    if (typeof window !== 'undefined') {
      const cached = window.localStorage.getItem(`${STORAGE_PREFIX}:${selectedDate}`);
      if (cached !== null) {
        setComment(cached);
      } else {
        setComment('');
      }
      const cachedPlan = window.localStorage.getItem(`${DAILY_PLAN_CACHE_PREFIX}:${selectedDate}`);
      const parsedPlan = cachedPlan ? Number(cachedPlan) : NaN;
      if (Number.isFinite(parsedPlan) && parsedPlan > 0) {
        setDailyPlanId(parsedPlan);
        return;
      }
      const token = window.localStorage.getItem('accessToken');
      if (!token) return;
      const disabledRaw = window.localStorage.getItem(DAILY_PLAN_DISABLED_KEY);
      const disabledUntil = disabledRaw ? Number(disabledRaw) : NaN;
      if (Number.isFinite(disabledUntil) && Date.now() < disabledUntil) {
        return;
      }
      const failRaw = window.localStorage.getItem(`${DAILY_PLAN_FAIL_PREFIX}:${selectedDate}`);
      const failAt = failRaw ? Number(failRaw) : NaN;
      if (Number.isFinite(failAt) && Date.now() - failAt < FAIL_TTL_MS) {
        return;
      }
    }
    findOrCreateMutation.mutate(
      { planDate: selectedDate },
      {
        onSuccess: (res) => {
          if (res.dailyPlanId) {
            setDailyPlanId(res.dailyPlanId);
          }
        },
      }
    );
  }, [selectedDate, findOrCreateMutation]);

  const handleSave = () => {
    if (!dailyPlanId) return;
    setStatus('saving');
    updateCommentMutation.mutate(
      { dailyPlanId, input: { comment: comment.trim() } },
      {
        onSuccess: (res) => {
          const next = res.comment ?? comment.trim();
          setComment(next);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(`${STORAGE_PREFIX}:${selectedDate}`, next);
          }
          setStatus('saved');
        },
        onError: () => {
          setStatus('error');
        },
      }
    );
  };

  return (
    <section className="space-y-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">오늘의 메모</p>
          <p className="text-xs text-neutral-400">{dateLabel}</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dailyPlanId || status === 'saving'}
          className={[
            'rounded-full px-4 py-2 text-xs font-semibold',
            !dailyPlanId || status === 'saving'
              ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
              : 'bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] text-white',
          ].join(' ')}
        >
          저장
        </button>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="오늘의 학습 메모를 남겨보세요."
        className="h-28 w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none focus:border-neutral-900"
      />

      {status === 'saved' && (
        <p className="text-xs font-semibold text-emerald-600">저장되었습니다.</p>
      )}
      {status === 'error' && (
        <p className="text-xs font-semibold text-rose-500">저장에 실패했습니다.</p>
      )}
    </section>
  );
}
