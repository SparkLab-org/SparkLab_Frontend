'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

import {
  getLevelBadgeClass,
  getLevelLabel,
  type MenteeCard,
} from '@/src/components/mentor/planner/mentorPlannerUtils';

type Props = {
  menteeCards: MenteeCard[];
  activeMenteeId: string;
  onSelectMentee: (id: string) => void;
};

export default function MentorPlannerMenteeSection({
  menteeCards,
  activeMenteeId,
  onSelectMentee,
}: Props) {
  const cardsRef = useRef<HTMLDivElement>(null);

  const scrollCards = (direction: 'left' | 'right') => {
    const container = cardsRef.current;
    if (!container) return;
    const amount = Math.max(240, container.clientWidth * 0.65);
    container.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const activeIndex = menteeCards.findIndex((item) => item.id === activeMenteeId);

  return (
    <section className="rounded-3xl bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollCards('left')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm"
            aria-label="이전 멘티"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollCards('right')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm"
            aria-label="다음 멘티"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={cardsRef}
        className="mt-2 flex gap-4 overflow-x-auto overflow-y-visible px-4 pb-2 pt-2 scroll-px-4"
      >
        {menteeCards.length === 0 && (
          <div className="rounded-2xl bg-[#F5F5F5] px-6 py-5 text-sm text-neutral-500">
            등록된 멘티가 없습니다.
          </div>
        )}
        {menteeCards.map((mentee, index) => {
          const isSelected = mentee.id === activeMenteeId;
          const distance = activeIndex >= 0 ? Math.abs(index - activeIndex) : 0;
          const fadedOpacity = Math.max(0.25, 1 - distance * 0.25);
          return (
            <button
              key={mentee.id}
              type="button"
              onClick={() => onSelectMentee(mentee.id)}
              className={[
                'min-w-[240px] rounded-2xl bg-[#F5F5F5] p-4 text-left shadow-sm transition-all duration-300 origin-center will-change-transform',
                isSelected
                  ? 'scale-[1.05] ring-2 ring-[#0528F3]/30 shadow-md'
                  : 'hover:opacity-85',
              ].join(' ')}
              style={isSelected ? undefined : { opacity: fadedOpacity }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
                    <User className="h-5 w-5 text-neutral-500" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{mentee.name}</p>
                    <p className="text-xs text-neutral-500">{mentee.grade ?? '학년 미정'}</p>
                  </div>
                </div>
                <span
                  className={[
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    getLevelBadgeClass(mentee.activeLevel),
                  ].join(' ')}
                >
                  {getLevelLabel(mentee.activeLevel)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {mentee.subjects.map((subject) => (
                  <span
                    key={`${mentee.id}-${subject}`}
                    className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600"
                  >
                    {subject}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[#F5F5F5] p-3 text-center text-[11px]">
                <div>
                  <p className="text-neutral-500">목표 달성률</p>
                  <p className="mt-1 font-semibold text-neutral-900">{mentee.goalRate}%</p>
                </div>
                <div>
                  <p className="text-neutral-500">약점 유형</p>
                  <p className="mt-1 font-semibold text-neutral-900">
                    {mentee.weaknessType ?? '미정'}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500">오늘 할 일</p>
                  <p className="mt-1 font-semibold text-neutral-900">
                    {mentee.todayCount}개
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
