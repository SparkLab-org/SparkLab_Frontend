"use client";

import { useMemo, useState } from "react";
import { useTodosQuery } from "@/src/hooks/todoQueries";
import FeedbackHeaderActions from "./FeedbackHeaderActions";
import FeedbackList from "./FeedbackList";
import FeedbackSortBar from "./FeedbackSortBar";
import FeedbackSubjectToggle, { type SubjectFilter } from "./FeedbackSubjectToggle";

type Props = {
  title: string;
};

const STORAGE_KEY = "feedback-read";

export default function FeedbackContent({ title }: Props) {
  const { data: todos = [] } = useTodosQuery();
  const [activeSubject, setActiveSubject] = useState<SubjectFilter>("전체");
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((id) => typeof id === "string"));
    } catch {
      return new Set();
    }
  });

  const feedbackItems = useMemo(() => {
    const filtered = todos.filter(
      (todo) => typeof todo.feedback === "string" && todo.feedback.trim().length > 0
    );
    const subjectFiltered =
      activeSubject === "전체"
        ? filtered
        : filtered.filter((todo) => todo.subject === activeSubject);
    return subjectFiltered.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [todos, activeSubject]);

  const unreadCount = useMemo(
    () => feedbackItems.filter((item) => !readIds.has(item.id)).length,
    [feedbackItems, readIds]
  );

  const isUnread = (id: string) => !readIds.has(id);

  const markRead = (id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
        <FeedbackHeaderActions unreadCount={unreadCount} />
      </header>
      <FeedbackSortBar />
      <FeedbackSubjectToggle activeSubject={activeSubject} onChange={setActiveSubject} />
      <FeedbackList items={feedbackItems} isUnread={isUnread} onMarkRead={markRead} />
    </div>
  );
}
