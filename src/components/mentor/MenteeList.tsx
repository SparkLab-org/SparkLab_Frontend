'use client';

import type { Mentee } from './types';

type Props = {
  mentees: Mentee[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function MenteeList({ mentees, selectedId, onSelect }: Props) {
  return (
    <aside className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-neutral-900">멘티 목록</h2>
        <span className="text-xs text-neutral-500">총 {mentees.length}명</span>
      </header>
      <div className="space-y-2">
        {mentees.map((m) => {
          const active = m.id === selectedId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelect(m.id)}
              className={[
                'w-full rounded-xl border px-3 py-3 text-left transition shadow-sm',
                active
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'border-neutral-200 bg-white hover:border-neutral-400',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{m.name}</p>
                  <p className="text-xs text-neutral-400">
                    {m.grade} · {m.track}
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-semibold">{m.progress}%</p>
                  <p className="text-neutral-400">진행</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
