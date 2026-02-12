'use client';

import Link from 'next/link';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { getProgressFillStyle } from '@/src/lib/utils/progressStyle';
import { getTodoDetailHref } from '@/src/lib/utils/todoLink';

type View = 'week' | 'month';
type TodoSummary = {
  id: string;
  title: string;
  status: string;
  isFixed?: boolean;
  type?: string;
};

type Props = {
  view: View;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;

  weekDays: Date[];
  monthCells: Date[];

  progressByDate?: Record<string, number>;
  itemsByDate?: Record<string, TodoSummary[]>;
  isLoading?: boolean;
};

function isoDate(d: Date) {
  return format(d, 'yyyy-MM-dd');
}

export default function PlannerDateGrid({
  view,
  selectedDate,
  onSelectDate,
  weekDays,
  monthCells,
  progressByDate,
  itemsByDate,
  isLoading = false,
}: Props) {
  const days = view === 'week' ? weekDays : monthCells;

  return (
    <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm font-semibold">
      {days.map((d) => {
        const key = isoDate(d);
        const isSelected = isSameDay(d, selectedDate);
        const inMonth = view === 'month' ? isSameMonth(d, selectedDate) : true;
        const progress = progressByDate?.[key];
        const hasProgress =
          !!progressByDate && Object.prototype.hasOwnProperty.call(progressByDate, key);
        const progressPercent = typeof progress === 'number' ? Math.round(progress * 100) : 0;
        const items = view === 'month' ? itemsByDate?.[key] ?? [] : [];
        const assignmentCount =
          view === 'month'
            ? items.filter((item) => item.type === '과제' || item.isFixed).length
            : 0;
        const studyCount =
          view === 'month' ? Math.max(0, items.length - assignmentCount) : 0;
        const showSummarySkeleton = isLoading && view === 'month' && inMonth;

        const containerClassName = [
          view === 'month'
            ? 'relative flex min-h-[96px] flex-col items-start gap-1 rounded-2xl px-2 py-2 text-left'
            : 'relative flex h-10 items-center justify-center rounded-lg',
          view === 'month'
            ? inMonth
              ? 'text-neutral-900'
              : 'text-neutral-300'
            : isSelected
            ? 'bg-[#004DFF] text-white'
            : inMonth
            ? 'bg-transparent text-neutral-800'
            : 'bg-transparent text-neutral-300',
        ].join(' ');

        const cellContent = (
          <>
            {view === 'month' ? (
              <span
                className={[
                  'flex h-6 w-6 items-center justify-center rounded-lg text-xs font-semibold',
                  isSelected
                    ? 'bg-[#004DFF] text-white'
                    : inMonth
                    ? 'bg-transparent text-neutral-800'
                    : 'bg-transparent text-neutral-300',
                ].join(' ')}
              >
                {d.getDate()}
              </span>
            ) : (
              d.getDate()
            )}

            {view === 'month' && hasProgress && !isLoading && (
              <div className="w-full">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#D5EBFF]">
                  <div
                    className="h-full"
                    style={getProgressFillStyle(progressPercent)}
                  />
                </div>
              </div>
            )}

            {view === 'month' && (showSummarySkeleton || items.length > 0) && (
              <div className="mt-1 flex w-full flex-col gap-1">
                {showSummarySkeleton ? (
                  <div className="space-y-1.5 animate-pulse">
                    <div className="inline-flex w-fit items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-200" />
                      <span className="h-2 w-4 rounded bg-neutral-200" />
                    </div>
                    <div className="inline-flex w-fit items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-200" />
                      <span className="h-2 w-4 rounded bg-neutral-200" />
                    </div>
                  </div>
                ) : (
                  <>
                    {assignmentCount > 0 && (
                      <div className="inline-flex w-fit items-center gap-1 text-[10px] font-semibold text-purple-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        {assignmentCount}
                      </div>
                    )}
                    {studyCount > 0 && (
                      <div className="inline-flex w-fit items-center gap-1 text-[10px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {studyCount}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {view === 'week' && (isLoading || (hasProgress && typeof progress === 'number')) && (
              <div className="absolute -bottom-2 left-1/2 w-10 -translate-x-1/2">
                <div
                  className={[
                    'h-1.5 w-full overflow-hidden rounded-full',
                    'bg-[#D5EBFF]',
                  ].join(' ')}
                >
                  {isLoading ? (
                    <div className="h-full w-full animate-pulse bg-neutral-200" />
                  ) : (
                    <div
                      className="h-full"
                      style={getProgressFillStyle(progressPercent)}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        );

        return view === 'month' ? (
          <div
            key={key}
            role="button"
            tabIndex={0}
            onClick={() => onSelectDate(d)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectDate(d);
              }
            }}
            className={containerClassName}
          >
            {cellContent}
          </div>
        ) : (
          <button
            key={key}
            type="button"
            onClick={() => onSelectDate(d)}
            className={containerClassName}
          >
            {cellContent}
          </button>
        );
      })}
    </div>
  );
}
