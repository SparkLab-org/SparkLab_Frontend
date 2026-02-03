'use client';

import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth, startOfWeek, addDays } from 'date-fns';

type View = 'week' | 'month';
type Dot = 'green' | 'pink';

type Props = {
  view: View;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;

  weekDays: Date[];
  monthCells: Date[];

  dotsByDate: Record<string, Dot[]>;
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
}: Props) {
  const days = view === 'week' ? weekDays : monthCells;

  return (
    <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm font-semibold">
      {days.map((d) => {
        const key = isoDate(d);
        const isSelected = isSameDay(d, selectedDate);
        const inMonth = view === 'month' ? isSameMonth(d, selectedDate) : true;
        const dots = dotsByDate[key] ?? [];

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectDate(d)}
            className={[
              'relative flex h-10 items-center justify-center rounded-full',
              isSelected
                ? 'bg-black text-white'
                : inMonth
                ? 'bg-neutral-100 text-neutral-800'
                : 'bg-neutral-50 text-neutral-300',
            ].join(' ')}
          >
            {d.getDate()}

            {dots.length > 0 && (
              <div className="absolute -bottom-2 flex gap-1">
                {dots.slice(0, 3).map((dot, idx) => (
                  <span
                    key={idx}
                    className={[
                      'h-1.5 w-1.5 rounded-full',
                      dot === 'green' ? 'bg-emerald-400' : 'bg-fuchsia-400',
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