'use client';

import { useEffect, useState } from 'react';

type Props = {
  statusLabel: string;
  studyMinutes?: number;
  isLocked: boolean;
  onRecord: (elapsedSeconds: number) => void;
};

function formatHMS(totalSeconds: number) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatMinutes(totalMinutes: number) {
  const safe = Number.isFinite(totalMinutes) ? Math.max(0, Math.floor(totalMinutes)) : 0;
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:00`;
}

export default function TaskProgressCard({
  statusLabel,
  studyMinutes = 0,
  isLocked,
  onRecord,
}: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return undefined;
    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

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
            {formatMinutes(studyMinutes)}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-white p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-neutral-500">타이머</p>
          <p className="text-sm font-semibold text-neutral-900">{formatHMS(elapsedSeconds)}</p>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => setIsRunning((prev) => !prev)}
            disabled={isLocked}
            className={[
              'flex-1 rounded-lg px-3 py-2 text-xs font-semibold',
              isLocked
                ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                : 'bg-neutral-900 text-white',
            ].join(' ')}
          >
            {isRunning ? '일시정지' : '시작'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              onRecord(elapsedSeconds);
              setElapsedSeconds(0);
            }}
            disabled={isLocked || elapsedSeconds === 0}
            className={[
              'flex-1 rounded-lg border px-3 py-2 text-xs font-semibold',
              isLocked || elapsedSeconds === 0
                ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                : 'border-neutral-200 bg-white text-neutral-700',
            ].join(' ')}
          >
            기록하기
          </button>
        </div>
      </div>
    </section>
  );
}
