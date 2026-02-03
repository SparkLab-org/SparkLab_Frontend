'use client';

import { useState } from 'react';
import type { Mentee } from './types';

type Props = {
  mentee: Mentee;
  onSaveFeedback?: (id: string, text: string) => void;
};

export function MenteeDetail({ mentee, onSaveFeedback }: Props) {
  const [note, setNote] = useState(mentee.feedback || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      onSaveFeedback?.(mentee.id, note);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-500">선택한 멘티</p>
          <h2 className="text-xl font-semibold text-neutral-900">
            {mentee.name} · {mentee.grade}
          </h2>
          <p className="text-sm text-neutral-600">{mentee.track}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500">진행률</p>
          <p className="text-xl font-semibold text-neutral-900">{mentee.progress}%</p>
        </div>
      </header>

      <div className="rounded-2xl bg-neutral-100 p-4">
        <p className="text-sm font-semibold text-neutral-800">오늘의 할 일</p>
        <div className="mt-3 space-y-3">
          {mentee.today.map((t) => (
            <div
              key={t.todo}
              className="flex items-center justify-between rounded-xl bg-white px-3 py-3 text-sm ring-1 ring-neutral-200"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-neutral-900">{t.todo}</p>
                <p className="text-xs text-neutral-500">
                  {t.subject} · {t.duration}
                </p>
              </div>
              <span
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold ring-1',
                  t.status === 'DONE'
                    ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                    : 'bg-white text-neutral-600 ring-neutral-200',
                ].join(' ')}
              >
                {t.status === 'DONE' ? '완료' : '진행중'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-sm font-semibold text-neutral-800">주요 학습량</p>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>총 학습 시간: {mentee.today.reduce((acc, t) => acc + parseTime(t.duration), 0)}분</li>
            <li>완료 과제: {mentee.today.filter((t) => t.status === 'DONE').length}개</li>
            <li>남은 과제: {mentee.today.filter((t) => t.status !== 'DONE').length}개</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-sm font-semibold text-neutral-800">피드백</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={5}
            className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400"
            placeholder="멘티에게 남길 피드백을 작성하세요."
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving ? '저장중...' : '피드백 저장'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function parseTime(time: string): number {
  // "1:50:36" => minutes
  const parts = time.split(':').map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 60 + m + Math.floor(s / 60);
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return m + Math.floor(s / 60);
  }
  return 0;
}
