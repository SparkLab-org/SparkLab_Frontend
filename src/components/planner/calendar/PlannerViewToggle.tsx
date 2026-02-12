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
          view === 'week'
            ? 'bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] text-white shadow-[0_8px_16px_rgba(21,0,255,0.2)]'
            : 'text-neutral-600',
        ].join(' ')}
      >
        주간
      </button>
      <button
        type="button"
        onClick={() => onChange('month')}
        className={[
          'rounded-full px-5 py-2',
          view === 'month'
            ? 'bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] text-white shadow-[0_8px_16px_rgba(21,0,255,0.2)]'
            : 'text-neutral-600',
        ].join(' ')}
      >
        월간
      </button>
    </div>
  );
}
