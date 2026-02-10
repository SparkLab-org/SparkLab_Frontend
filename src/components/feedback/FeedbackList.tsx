"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { storeFeedbackPreview } from "@/src/lib/utils/feedbackPreview";
type FeedbackListItem = {
  id: string;
  todoItemId?: number;
  feedbackId?: number;
  title: string;
  subject?: string;
  feedback?: string | null;
  type?: string;
  isFixed?: boolean;
  status?: string;
};

type Props = {
  items: FeedbackListItem[];
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
        const statusLabel = todo.status
          ? todo.status === "DONE"
            ? "완료"
            : "진행중"
          : null;
        const detailId = todo.todoItemId ?? todo.feedbackId ?? Number(todo.id);
        const previewText = todo.feedback ?? "";
        const previewParam =
          previewText.trim().length > 0
            ? `?preview=${encodeURIComponent(previewText.trim().slice(0, 200))}`
            : "";
        const detailHref = `/feedback/${detailId}${previewParam}`;
        return (
          <Link
            key={todo.id}
            href={detailHref}
            className="group rounded-3xl bg-neutral-100 px-4 py-4 transition hover:shadow-sm"
            onClick={() => {
              if (detailId !== undefined && detailId !== null) {
                storeFeedbackPreview(String(detailId), previewText);
              }
              onMarkRead(todo.id);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-500">
                  {typeLabel}
                </span>
                {statusLabel && (
                  <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-neutral-600">
                    {statusLabel}
                  </span>
                )}
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
