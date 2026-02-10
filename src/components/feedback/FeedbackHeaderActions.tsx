"use client";

import { Star } from "lucide-react";

type Props = {
  unreadCount?: number;
};

export default function FeedbackHeaderActions({ unreadCount = 0 }: Props) {
  return (
    <button
      type="button"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600"
      aria-label="북마크"
    >
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 min-w-[16px] rounded-full bg-rose-500 px-1 py-0.5 text-[10px] font-semibold leading-none text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
