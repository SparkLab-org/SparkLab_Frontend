'use client';

import { useTimerStore } from '@/src/store/timerStore';

type Props = {
  statusLabel: string;
  studySeconds?: number;
  isLocked: boolean;
  isDone: boolean;
  todoId: string;
};

function formatHMS(totalSeconds: number) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function TaskProgressCard({
  statusLabel,
  studySeconds = 0,
  isLocked,
  isDone,
  todoId,
}: Props) {
  const openPanel = useTimerStore((s) => s.openPanel);
  const setActiveTodoId = useTimerStore((s) => s.setActiveTodoId);
  const canUseTimer = !isLocked && !isDone && Boolean(todoId);
  const statusStyles =
    statusLabel === '완료'
      ? 'bg-emerald-50 text-emerald-700'
      : statusLabel === '진행중'
      ? 'bg-blue-50 text-blue-700'
      : 'bg-neutral-100 text-neutral-600';

  return (
    <section className="rounded-2xl bg-[#F6F8FA] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-500">과제 진행</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles}`}>
          {statusLabel}
        </span>
      </div>
      <p
        className="mt-4 text-[36px] font-semibold leading-none text-neutral-900"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {formatHMS(studySeconds)}
      </p>

      {canUseTimer && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setActiveTodoId(todoId);
              openPanel();
            }}
            className="rounded-lg bg-[#004DFF] px-4 py-2 text-xs font-semibold text-white"
          >
            타이머
          </button>
        </div>
      )}
    </section>
  );
}
