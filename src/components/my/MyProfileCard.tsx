'use client';

type Props = {
  name: string;
  roleLabel: string;
  totalStudySeconds: number;
};

function formatTimeFromSeconds(totalSeconds: number) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function MyProfileCard({ name, roleLabel, totalStudySeconds }: Props) {
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
        {formatTimeFromSeconds(totalStudySeconds)}
      </p>
    </section>
  );
}
