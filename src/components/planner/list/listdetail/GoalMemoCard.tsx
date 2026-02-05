'use client';

import { useState } from 'react';

export default function GoalMemoCard() {
  const [memo, setMemo] = useState('');

  return (
    <section className="rounded-2xl p-4">
      <p className="text-lg font-semibold text-neutral-900">오늘의 목표</p>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="오늘의 목표를 기록해보세요."
        className="mt-3 min-h-[140px] w-full resize-none rounded-xl  bg-neutral-100 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-400"
      />
    </section>
  );
}
