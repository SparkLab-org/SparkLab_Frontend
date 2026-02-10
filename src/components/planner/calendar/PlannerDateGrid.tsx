'use client';

import Link from 'next/link';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { useEffect, useState } from 'react';
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
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }
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

            {view === 'month' && items.length > 0 && (
              <div className="mt-1 flex w-full flex-col gap-1">
                {items.slice(0, 2).map((item) => (
                  <Link
                    key={`${key}-${item.id}`}
                    href={getTodoDetailHref({
                      id: item.id,
                      isFixed: Boolean(item.isFixed),
                      type: item.type === '과제' ? '과제' : '학습',
                    })}
                    onClick={(event) => event.stopPropagation()}
                    className={[
                      'truncate text-[10px] font-semibold transition hover:underline',
                      item.status === 'DONE'
                        ? 'text-emerald-500'
                        : 'text-purple-500',
                    ].join(' ')}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}

            {view === 'week' && hasProgress && typeof progress === 'number' && (
              <div className="absolute -bottom-2 left-1/2 w-10 -translate-x-1/2">
                <div
                  className={[
                    'h-1.5 w-full overflow-hidden rounded-full',
                    'bg-[#D5EBFF]',
                  ].join(' ')}
                >
                  <div
                    className="h-full"
                    style={getProgressFillStyle(progressPercent)}
                  />
                </div>
              </div>
            )}
          </>
        );

        return (
          view === 'month' ? (
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
          )
        );
      })}
    </div>
  );
}
