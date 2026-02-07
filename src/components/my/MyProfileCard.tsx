'use client';

type Props = {
  name: string;
  roleLabel: string;
  totalStudySeconds: number;
  activeLevel?: 'NORMAL' | 'WARNING' | 'DANGER';
  onOpenLevelInfo?: () => void;
};

function formatTimeFromSeconds(totalSeconds: number) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getLevelLabel(level?: 'NORMAL' | 'WARNING' | 'DANGER') {
  if (level === 'WARNING') return '주의';
  if (level === 'DANGER') return '위험';
  return '정상';
}

function getLevelClass(level?: 'NORMAL' | 'WARNING' | 'DANGER') {
  if (level === 'WARNING') return 'bg-amber-100 text-amber-700';
  if (level === 'DANGER') return 'bg-rose-100 text-rose-600';
  return 'bg-emerald-100 text-emerald-700';
}

export default function MyProfileCard({
  name,
  roleLabel,
  totalStudySeconds,
  activeLevel,
  onOpenLevelInfo,
}: Props) {
  return (
    <section className="flex items-center justify-between rounded-3xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-neutral-100" aria-hidden />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-900">{name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-1">
            <p className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
              {roleLabel}
            </p>
            <p
              className={[
                'inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold',
                getLevelClass(activeLevel),
              ].join(' ')}
            >
              {getLevelLabel(activeLevel)}
            </p>
            {onOpenLevelInfo && (
              <button
                type="button"
                onClick={onOpenLevelInfo}
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-neutral-200 text-[10px] font-semibold text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
                aria-label="멘티 레벨 기준 안내"
              >
                ?
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="text-base font-bold text-neutral-900">
        {formatTimeFromSeconds(totalStudySeconds)}
      </p>
    </section>
  );
}
