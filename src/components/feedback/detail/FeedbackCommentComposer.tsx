'use client';

import { useState } from 'react';
import sendIcon from '@/src/assets/icons/send.svg';

type Props = {
  role: 'mentee' | 'mentor';
  onSubmit: (content: string, role: 'mentee' | 'mentor') => void;
};

export default function FeedbackCommentComposer({ role, onSubmit }: Props) {
  const [value, setValue] = useState('');

  const placeholder =
    role === 'mentee'
      ? '질문을 적어주세요.'
      : '멘티 질문에 대한 답변을 적어주세요.';
  const sendIconSrc = typeof sendIcon === 'string' ? sendIcon : sendIcon?.src;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed, role);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-3">
      <div className="flex items-end gap-2 rounded-2xl bg-[#F6F8FA] px-4 py-5 shadow-sm">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          rows={1}
          className="min-h-[90px] w-full resize-none text-sm text-neutral-800 outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-3 py-2 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(21,0,255,0.2)] transition hover:-translate-y-0.5"
          aria-label="전송"
        >
          {sendIconSrc ? (
            <img
              src={sendIconSrc}
              alt=""
              aria-hidden
              className="h-4 w-4 invert"
            />
          ) : (
            '전송'
          )}
        </button>
      </div>
    </form>
  );
}
