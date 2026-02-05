'use client';

import { Headphones } from 'lucide-react';

type Props = {
  onClick: () => void;
};

export default function MyHelpButton({ onClick }: Props) {
  return (
    <button
      type="button"
      className="fixed bottom-24 right-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-lg"
      aria-label="도움말"
      onClick={onClick}
    >
      <Headphones className="h-5 w-5" aria-hidden />
    </button>
  );
}
