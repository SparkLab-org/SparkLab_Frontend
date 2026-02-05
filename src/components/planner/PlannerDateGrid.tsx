'use client';

import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, addDays } from 'date-fns';

type View = 'week' | 'month';
type Dot = 'green' | 'pink';
type TodoSummary = { title: string; status: string };

type Props = {
  view: View;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;

  weekDays: Date[];
  monthCells: Date[];

  dotsByDate: Record<string, Dot[]>;
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
  dotsByDate,
  itemsByDate,
}: Props) {
  const days = view === 'week' ? weekDays : monthCells;

  return (
    <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm font-semibold">
      {days.map((d) => {
        const key = isoDate(d);
        const isSelected = isSameDay(d, selectedDate);
        const inMonth = view === 'month' ? isSameMonth(d, selectedDate) : true;
        const dots = dotsByDate[key] ?? [];
        const items = view === 'month' ? itemsByDate?.[key] ?? [] : [];

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectDate(d)}
            className={[
              view === 'month'
                ? 'relative flex min-h-[96px] flex-col items-start gap-1 rounded-2xl px-2 py-2 text-left'
                : 'relative flex h-10 items-center justify-center rounded-full',
              view === 'month'
                ? inMonth
                  ? 'text-neutral-900'
                  : 'text-neutral-300'
                : isSelected
                ? 'bg-black text-white'
                : inMonth
                ? 'bg-neutral-100 text-neutral-800'
                : 'bg-neutral-50 text-neutral-300',
            ].join(' ')}
          >
            {view === 'month' ? (
              <span
                className={[
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  isSelected
                    ? 'bg-black text-white'
                    : inMonth
                    ? 'bg-neutral-100 text-neutral-800'
                    : 'bg-neutral-50 text-neutral-300',
                ].join(' ')}
              >
                {d.getDate()}
              </span>
            ) : (
              d.getDate()
            )}

            {view === 'month' && items.length > 0 && (
              <div className="mt-1 flex w-full flex-col gap-1">
                {items.slice(0, 2).map((item, idx) => (
                  <span
                    key={`${key}-${idx}`}
                    className={[
                      'truncate text-[10px] font-semibold',
                      item.status === 'DONE'
                        ? 'text-emerald-500'
                        : 'text-purple-500',
                    ].join(' ')}
                  >
                    {item.title}
                  </span>
                ))}
              </div>
            )}

            {view === 'week' && dots.length > 0 && (
              <div className="absolute -bottom-2 flex gap-1">
                {dots.slice(0, 3).map((dot, idx) => (
                  <span
                    key={idx}
                    className={[
                      'h-1.5 w-1.5 rounded-full',
                      dot === 'green' ? 'bg-emerald-400' : 'bg-purple-400',
                    ].join(' ')}
                  />
                ))}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
