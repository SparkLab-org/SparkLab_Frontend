'use client';

import { format, isSameDay, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import {
  WEEK_LABELS,
  type DaySchedule,
} from '@/src/components/mentor/planner/mentorPlannerUtils';

type Props = {
  headerLabel: string;
  monthLabel: string;
  monthCells: Date[];
  selectedDate: Date;
  activeMonth: Date;
  scheduleByDate: Record<string, DaySchedule>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: Date) => void;
};

export default function MentorPlannerCalendarSection({
  headerLabel,
  monthLabel,
  monthCells,
  selectedDate,
  activeMonth,
  scheduleByDate,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: Props) {
  return (
    <section className="w-full max-w-[768px] rounded-3xl bg-[#F5F5F5] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{headerLabel}</p>
          <p className="text-xs text-neutral-500">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm"
            aria-label="이전 달"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm"
            aria-label="다음 달"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-xs font-semibold text-neutral-400">
        {WEEK_LABELS.map((label) => (
          <span
            key={label}
            className="ml-0.5 inline-flex h-7 w-7 items-center justify-center"
          >
            {label}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {monthCells.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const daySchedule = scheduleByDate[key];
          const dayItems = daySchedule?.items ?? [];
          const progress = daySchedule?.progress ?? 0;
          const inMonth = isSameMonth(date, activeMonth);
          const selected = isSameDay(date, selectedDate);
          const dayLabelClass = [
            'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
            selected
              ? 'bg-neutral-900 text-white'
              : inMonth
                ? 'text-neutral-900'
                : 'text-neutral-300',
          ].join(' ');

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectDate(date)}
                className={[
                  'flex aspect-square w-full flex-col items-start rounded-xl px-1 py-1.5 text-xs transition',
                  selected ? 'bg-white' : 'hover:bg-white/70',
                ].join(' ')}
              >
                <span className={`${dayLabelClass} ml-0.5`}>{format(date, 'd')}</span>
                {dayItems.length > 0 && (
                  <div className="mt-1.5 w-full px-0.5">
                    <div className="h-1.5 w-full rounded-full bg-neutral-200">
                      <div
                        className="h-full rounded-full bg-neutral-900"
                        style={{ width: `${Math.round(progress * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="mt-1.5 w-full space-y-1 px-0.5">
                  {dayItems.slice(0, 2).map((item, index) => (
                    <span
                      key={`${key}-${item.title}-${index}`}
                      className={`block w-full rounded-full px-1.5 py-0.5 text-[10px] font-medium ${item.colorClass} truncate`}
                    >
                      {item.title}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
      </div>
    </section>
  );
}
