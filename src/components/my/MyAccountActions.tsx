'use client';

import { LogOut } from 'lucide-react';

type Props = {
  onLogout: () => void;
};

export default function MyAccountActions({ onLogout }: Props) {
  return (
    <div className="flex items-center justify-center gap-6 pt-2 text-xs font-semibold text-neutral-500">
      <button
        type="button"
        onClick={onLogout}
        className="inline-flex items-center gap-2 hover:text-neutral-700"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        로그아웃
      </button>
    </div>
  );
}
