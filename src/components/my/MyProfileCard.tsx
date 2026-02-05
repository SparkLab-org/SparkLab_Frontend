'use client';

type Props = {
  name: string;
  roleLabel: string;
  totalStudyMinutes: number;
};

function formatTimeFromMinutes(totalMinutes: number) {
  const safe = Number.isFinite(totalMinutes) ? Math.max(0, Math.floor(totalMinutes)) : 0;
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:00`;
}

export default function MyProfileCard({ name, roleLabel, totalStudyMinutes }: Props) {
  return (
    <section className="flex items-center justify-between rounded-3xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-neutral-100" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">{name}</p>
          <p className="mt-1 inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
            {roleLabel}
          </p>
        </div>
      </div>
      <p className="text-base font-bold text-neutral-900">
        {formatTimeFromMinutes(totalStudyMinutes)}
      </p>
    </section>
  );
}
