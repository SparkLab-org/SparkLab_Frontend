"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useTodosQuery } from "@/src/hooks/todoQueries";
import { useFeedbacksQuery } from "@/src/hooks/feedbackQueries";
import { useAuthMeQuery } from "@/src/hooks/authQueries";
import FeedbackHeaderActions from "./FeedbackHeaderActions";
import FeedbackList from "./FeedbackList";
import FeedbackSortBar from "./FeedbackSortBar";
import FeedbackSubjectToggle, { type SubjectFilter } from "./FeedbackSubjectToggle";

type Props = {
  title: string;
};

const STORAGE_KEY = "feedback-read";

const feedbackReadStore = (() => {
  const listeners = new Set<() => void>();
  let hydrated = false;

  const emit = () => {
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const getSnapshot = () => {
    if (!hydrated) return "";
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  };

  const getServerSnapshot = () => "";

  const markHydrated = () => {
    if (hydrated) return;
    hydrated = true;
    emit();
  };

  const setReadIds = (ids: string[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // ignore storage errors
    }
    emit();
  };

  return { subscribe, getSnapshot, getServerSnapshot, markHydrated, setReadIds };
})();

export default function FeedbackContent({ title }: Props) {
  const { data: todos = [] } = useTodosQuery();
  const { data: me } = useAuthMeQuery();
  const menteeId = useMemo(() => {
    if (typeof me?.menteeId === "number") return me.menteeId;
    if (typeof window === "undefined") return undefined;
    const raw = window.localStorage.getItem("menteeId");
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [me?.menteeId]);
  const { data: feedbacks = [] } = useFeedbacksQuery({ menteeId });
  const [activeSubject, setActiveSubject] = useState<SubjectFilter>("전체");
  const rawReadIds = useSyncExternalStore(
    feedbackReadStore.subscribe,
    feedbackReadStore.getSnapshot,
    feedbackReadStore.getServerSnapshot
  );

  const readIds = useMemo(() => {
    if (!rawReadIds) return new Set<string>();
    try {
      const parsed = JSON.parse(rawReadIds);
      if (!Array.isArray(parsed)) return new Set<string>();
      return new Set(parsed.filter((id) => typeof id === "string"));
    } catch {
      return new Set<string>();
    }
  }, [rawReadIds]);

  useEffect(() => {
    feedbackReadStore.markHydrated();
  }, []);

  const feedbackItems = useMemo(() => {
    const todoById = new Map(todos.map((todo) => [todo.id, todo]));
    const mapped = feedbacks.map((feedback) => {
      const todo = feedback.todoItemId
        ? todoById.get(String(feedback.todoItemId))
        : undefined;
      return {
        id: feedback.id,
        feedbackId: Number(feedback.id),
        todoItemId: feedback.todoItemId,
        title: todo?.title ?? feedback.summary ?? "피드백",
        subject: todo?.subject ?? "국어",
        feedback: feedback.content ?? feedback.summary ?? "",
        type: todo?.type ?? (todo?.isFixed ? "과제" : "학습"),
        isFixed: todo?.isFixed ?? false,
        status: todo?.status,
        createdAt: todo?.createdAt ?? Date.now(),
      };
    });
    const subjectFiltered =
      activeSubject === "전체"
        ? mapped
        : mapped.filter((item) => item.subject === activeSubject);
    return subjectFiltered.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [todos, feedbacks, activeSubject]);

  const unreadCount = useMemo(
    () => feedbackItems.filter((item) => !readIds.has(item.id)).length,
    [feedbackItems, readIds]
  );

  const isUnread = (id: string) => !readIds.has(id);

  const markRead = (id: string) => {
    if (readIds.has(id)) return;
    const next = Array.from(new Set([...readIds, id]));
    feedbackReadStore.setReadIds(next);
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
