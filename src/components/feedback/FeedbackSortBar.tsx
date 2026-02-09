"use client";

import { ChevronDown } from "lucide-react";

export default function FeedbackSortBar() {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full bg-[#004DFF] px-4 py-2 text-xs font-semibold text-white"
      >
        최신순
        <ChevronDown className="h-3 w-3" aria-hidden />
      </button>
      <button
        type="button"
        className="rounded-xl border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold text-neutral-700"
      >
        북마크
      </button>
    </div>
  );
}
