'use client';

import { ChevronRight } from 'lucide-react';
import { getProgressFillStyle } from '@/src/lib/utils/progressStyle';

export type MyAchievementTab = 'routine' | 'today';

type Props = {
  monthPercent: number;
  monthDoneCount: number;
  monthTotalCount: number;
  activeTab: MyAchievementTab;
  onChangeTab: (tab: MyAchievementTab) => void;
};

export default function MyAchievementCard({
  monthPercent,
  monthDoneCount,
  monthTotalCount,
  activeTab,
  onChangeTab,
}: Props) {
  return (
    <section className="rounded-3xl bg-neutral-100 p-4">
      <button
        type="button"
        className="relative flex w-full items-center justify-start pr-5"
        aria-label="이번 달 내 성취도 상세"
      >
        <p className="text-lg font-semibold text-neutral-900">이번 달 내 성취도</p>
        <ChevronRight className="absolute right-0 h-4 w-4 text-neutral-400" aria-hidden />
      </button>

      <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-neutral-400">
        <p>학습 진행시간 (%)</p>
        <div className="flex items-center gap-8">
          <p>
            현재 <span className="text-neutral-900">{monthPercent}%</span>
          </p>
          <p>
            목표 <span className="text-neutral-900">100%</span>
          </p>
        </div>
      </div>

      <div className="mt-2 h-6 w-full overflow-hidden rounded-md bg-[#D5EBFF]">
        <div
          className="h-full rounded-md"
          style={getProgressFillStyle(monthPercent)}
          aria-label={`이번 달 성취도 ${monthPercent}%`}
        />
      </div>

      <p className="mt-2 text-xs text-neutral-400">
        완료 {monthDoneCount}/{monthTotalCount}
      </p>

      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 text-sm font-semibold">
        <button
          type="button"
          onClick={() => onChangeTab('routine')}
          className={[
            'px-4 py-3 transition',
            activeTab === 'routine' ? 'bg-white text-neutral-900' : 'text-neutral-500',
          ].join(' ')}
        >
          루틴
        </button>
        <button
          type="button"
          onClick={() => onChangeTab('today')}
          className={[
            'border-l border-neutral-200 px-4 py-3 transition',
            activeTab === 'today' ? 'bg-white text-neutral-900' : 'text-neutral-500',
          ].join(' ')}
        >
          오늘 할일
        </button>
      </div>
    </section>
  );
}
