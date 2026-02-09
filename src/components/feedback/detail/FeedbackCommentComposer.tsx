'use client';

import { useState } from 'react';

type Props = {
  role: 'mentee' | 'mentor';
  onSubmit: (content: string, role: 'mentee' | 'mentor') => void;
};

export default function FeedbackCommentComposer({ role, onSubmit }: Props) {
  const [value, setValue] = useState('');

  const label = role === 'mentee' ? '멘티 질문 남기기' : '멘토 답변 남기기';
  const placeholder =
    role === 'mentee'
      ? '질문이나 궁금한 점을 적어주세요.'
      : '멘티 질문에 대한 답변을 적어주세요.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed, role);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-[#F5F5F5] p-4">
      <p className="text-lg font-semibold text-neutral-900">{label}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="mt-3 h-24 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none focus:border-neutral-900"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          className="rounded-full bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-4 py-2 text-xs font-semibold text-white hover:-translate-y-0.5 hover:shadow-lg"
        >
          등록
        </button>
      </div>
    </form>
  );
}
