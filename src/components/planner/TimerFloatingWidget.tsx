'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTodosQuery, useUpdateTodoMutation } from '@/src/hooks/todoQueries';
import { isOverdueTask } from '@/src/lib/utils/todoStatus';
import { useTimerStore } from '@/src/store/timerStore';

function formatHMS(totalSeconds: number) {
  const safe = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function TimerFloatingWidget() {
  const { data: todos = [], isFetching, isFetched } = useTodosQuery();
  const updateTodoMutation = useUpdateTodoMutation();

  const activeTodoId = useTimerStore((s) => s.activeTodoId);
  const elapsedSeconds = useTimerStore((s) => s.elapsedSeconds);
  const isRunning = useTimerStore((s) => s.isRunning);
  const isPanelOpen = useTimerStore((s) => s.isPanelOpen);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const reset = useTimerStore((s) => s.reset);
  const sync = useTimerStore((s) => s.sync);
  const openPanel = useTimerStore((s) => s.openPanel);
  const closePanel = useTimerStore((s) => s.closePanel);
  const setActiveTodoId = useTimerStore((s) => s.setActiveTodoId);
  const pathname = usePathname();

  const activeTodo = useMemo(
    () => todos.find((todo) => todo.id === activeTodoId),
    [todos, activeTodoId]
  );

  const isLocked = activeTodo ? isOverdueTask(activeTodo) : false;
  const isDone = activeTodo?.status === 'DONE';
  const isTimerDisabled = !activeTodo || isLocked || isDone;

  useEffect(() => {
    if (!isRunning) return undefined;
    sync();
    const id = window.setInterval(sync, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, sync]);

  useEffect(() => {
    closePanel();
  }, [pathname, closePanel]);

  useEffect(() => {
    if (!activeTodoId) return;
    if (!isFetched || isFetching) return;
    if (!activeTodo) {
      reset();
      setActiveTodoId(null);
      closePanel();
      return;
    }
    if (isLocked || isDone) {
      reset();
      setActiveTodoId(null);
      closePanel();
    }
  }, [
    activeTodoId,
    activeTodo,
    isLocked,
    isDone,
    reset,
    setActiveTodoId,
    closePanel,
    isFetched,
    isFetching,
  ]);

  const handleRecord = () => {
    if (!activeTodo) return;
    if (elapsedSeconds <= 0) return;
    updateTodoMutation.mutate({
      id: activeTodo.id,
      patch: { studySeconds: (activeTodo.studySeconds ?? 0) + elapsedSeconds },
    });
    reset();
    closePanel();
  };

  const showFloating =
    !!activeTodo && !isPanelOpen && !isTimerDisabled && (isRunning || elapsedSeconds > 0);

  return (
    <>
      {showFloating && activeTodo && (
        <div
          role="button"
          tabIndex={0}
          onClick={openPanel}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openPanel();
            }
          }}
          className="fixed bottom-23 left-3 z-40 flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-lg"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" aria-hidden />
          <Link
            href={`/planner/list/${activeTodo.id}`}
            onClick={(event) => {
              event.stopPropagation();
              closePanel();
            }}
            className="max-w-[120px] truncate text-white hover:underline"
          >
            {activeTodo.title}
          </Link>
          <span className="text-[10px] text-neutral-300">{isRunning ? '기록 중' : '일시정지'}</span>
          <span className="tabular-nums">{formatHMS(elapsedSeconds)}</span>
        </div>
      )}

      {isPanelOpen && activeTodo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href={`/planner/list/${activeTodo.id}`}
                  onClick={() => closePanel()}
                  className="text-lg font-semibold text-neutral-900 hover:underline"
                >
                  {activeTodo.title}
                </Link>
              </div>
              <button
                type="button"
                onClick={closePanel}
                className="rounded-full px-2 py-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
              >
                닫기
              </button>
            </div>

            <div className="rounded-xl bg-neutral-100 px-4 py-3 text-center text-lg font-semibold text-neutral-900">
              {formatHMS(elapsedSeconds)}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => (isRunning ? pause() : start(activeTodo.id))}
                disabled={isTimerDisabled}
                className={[
                  'flex-1 rounded-lg px-3 py-2 text-xs font-semibold',
                  isTimerDisabled
                    ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                    : 'bg-neutral-900 text-white',
                ].join(' ')}
              >
                {isRunning ? '일시정지' : '시작'}
              </button>
              <button
                type="button"
                onClick={handleRecord}
                disabled={isTimerDisabled || elapsedSeconds === 0}
                className={[
                  'flex-1 rounded-lg border px-3 py-2 text-xs font-semibold',
                  isTimerDisabled || elapsedSeconds === 0
                    ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400'
                    : 'border-neutral-200 bg-white text-neutral-700',
                ].join(' ')}
              >
                기록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
