'use client';

type View = 'week' | 'month';

type Props = {
  view: View;
  onChange: (v: View) => void;
};

export default function PlannerViewToggle({ view, onChange }: Props) {
  return (
    <div className="inline-flex rounded-full bg-neutral-200 p-1 text-xs font-semibold">
      <button
        type="button"
        onClick={() => onChange('week')}
        className={[
          'rounded-full px-5 py-2',
          view === 'week' ? 'bg-black text-white' : 'text-neutral-600',
        ].join(' ')}
      >
        주간
      </button>
      <button
        type="button"
        onClick={() => onChange('month')}
        className={[
          'rounded-full px-5 py-2',
          view === 'month' ? 'bg-black text-white' : 'text-neutral-600',
        ].join(' ')}
      >
        월간
      </button>
    </div>
  );
}