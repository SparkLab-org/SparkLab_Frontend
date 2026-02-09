'use client';

import Link from 'next/link';
import type { Mentee } from '@/src/components/mentor/types';

type Props = {
  mentees: Mentee[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function MentorMenteeListPanel({ mentees, selectedId, onSelect }: Props) {
  return (
    <section className="rounded-3xl bg-[#F5F5F5] p-5">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-neutral-900 lg:text-lg">담당 멘티</p>
        <span className="text-xs text-neutral-500">총 {mentees.length}명</span>
      </div>
      <div className="mt-4 space-y-2">
        {mentees.map((m) => {
          const active = m.id === selectedId;
          return (
            <Link
              key={m.id}
              href={`/mentor/mentee/${m.id}`}
              onClick={() => onSelect(m.id)}
              className={[
                'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition',
                active
                  ? 'bg-[#004DFF] text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                <div
                  className={[
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold',
                    active ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-600',
                  ].join(' ')}
                >
                  {m.name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className={active ? 'text-xs text-neutral-200' : 'text-xs text-neutral-400'}>
                    {m.grade} · {m.track}
                  </p>
                </div>
              </div>
              <span className={active ? 'text-xs text-neutral-200' : 'text-xs text-neutral-300'}>
                ›
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
