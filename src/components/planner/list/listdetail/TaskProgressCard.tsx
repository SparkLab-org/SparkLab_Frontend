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

  return (
    <section className="rounded-2xl bg-neutral-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-neutral-500">과제 진행</p>
          <p className="mt-1 text-sm font-semibold text-neutral-900">
            {statusLabel}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-neutral-500">진행한 시간</p>
          <p className="mt-1 text-sm font-semibold text-neutral-900">
            {formatHMS(studySeconds)}
          </p>
        </div>
      </div>

      {canUseTimer && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setActiveTodoId(todoId);
              openPanel();
            }}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white"
          >
            타이머
          </button>
        </div>
      )}
    </section>
  );
}
