"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Todo } from "@/src/lib/types/planner";

type Props = {
  items: Todo[];
  isUnread: (id: string) => boolean;
  onMarkRead: (id: string) => void;
};

export default function FeedbackList({ items, isUnread, onMarkRead }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
        등록된 피드백이 없어요.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((todo) => {
        const typeLabel = todo.type ?? (todo.isFixed ? "과제" : "학습");
        return (
          <Link
            key={todo.id}
            href={`/planner/list/${todo.id}`}
            className="group rounded-3xl bg-neutral-100 px-4 py-4 transition hover:shadow-sm"
            onClick={() => onMarkRead(todo.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <span className="rounded-full bg-white px-2 py-0.5 text-neutral-500">오답노트</span>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-500">
                  {typeLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isUnread(todo.id) && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                <ChevronRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500" />
              </div>
            </div>
            <p className="mt-2 text-base font-semibold text-neutral-900">
              {todo.title || "피드백 명칭"}
            </p>
            <p className="mt-2 text-xs leading-5 text-neutral-500 line-clamp-2">
              {todo.feedback}
            </p>
          </Link>
        );
      })}
    </div>
  );
}
