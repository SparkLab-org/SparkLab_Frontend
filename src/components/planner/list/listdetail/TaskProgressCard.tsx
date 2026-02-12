'use client';

import { useTimerStore } from '@/src/store/timerStore';

type Props = {
  title?: string;
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
  title = '학습 진행',
  statusLabel,
  studySeconds = 0,
  isLocked,
  isDone,
  todoId,
}: Props) {
  const openPanel = useTimerStore((s) => s.openPanel);
  const setActiveTodoId = useTimerStore((s) => s.setActiveTodoId);
  const canUseTimer = !isLocked && !isDone && Boolean(todoId);
  return (
    <section className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-500">{title}</p>
      </div>
      <p
        className="mt-5 text-[40px] font-semibold leading-none text-neutral-900"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {formatHMS(studySeconds)}
      </p>
      {canUseTimer && (
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setActiveTodoId(todoId);
              openPanel();
            }}
            className="rounded-full bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(21,0,255,0.2)] transition hover:-translate-y-0.5"
          >
            타이머
          </button>
        </div>
      )}
    </section>
  );
}
