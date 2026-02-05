"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { addDays, addWeeks, format, startOfWeek, subWeeks } from "date-fns";
import { ko } from "date-fns/locale";

import PlannerDateGrid from "./PlannerDateGrid";
import { usePlannerStore } from "@/src/store/plannerStore";

type Dot = "green" | "pink";

type Props = Record<string, never>;

export default function WeeklyCalendar({}: Props) {
  const selectedDateStr = usePlannerStore((s) => s.selectedDate);
  const selectedDate = useMemo(() => new Date(selectedDateStr), [selectedDateStr]);
  const setSelectedDate = usePlannerStore((s) => s.setSelectedDate);
  const todos = usePlannerStore((s) => s.todos);
  const hasLoadedTodos = usePlannerStore((s) => s.hasLoadedTodos);
  const loadTodos = usePlannerStore((s) => s.loadTodos);

  const weekStart = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 0 }),
    [selectedDate]
  );
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  useEffect(() => {
    if (!hasLoadedTodos) {
      void loadTodos();
    }
  }, [hasLoadedTodos, loadTodos]);

  useEffect(() => {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    setSelectedDate(todayKey);
  }, [setSelectedDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const dotsByDate: Record<string, Dot[]> = useMemo(() => {
    return todos.reduce<Record<string, Dot[]>>((acc, todo) => {
      if (!todo.dueDate) return acc;
      const dot: Dot = todo.status === "DONE" ? "green" : "pink";
      acc[todo.dueDate] = acc[todo.dueDate]
        ? [...acc[todo.dueDate], dot]
        : [dot];
      return acc;
    }, {});
  }, [todos]);

  const headerText = useMemo(() => {
    const startText = format(weekStart, "M월 d일(EEE)", { locale: ko });
    const endText = format(weekEnd, "M월 d일(EEE)", { locale: ko });
    return `${startText} ~ ${endText}`;
  }, [weekStart, weekEnd]);

  const goPrev = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const goNext = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  return (
    <section
      className="rounded-3xl p-5 bg-[#F5F5F5]"
    >
      <div className="flex items-center justify-between gap-3 text-sm text-neutral-700">
        {/* <button
          type="button"
          aria-label="이전 주"
          className="rounded-full px-2 py-1 text-neutral-600"
          onClick={goPrev}
        >
          ←
        </button> */}

        <div className="text-center">
          <p className="text-lg font-bold text-neutral-900">계획표</p>
        </div>

        {/* <button
          type="button"
          aria-label="다음 주"
          className="rounded-full px-2 py-1 text-neutral-600"
          onClick={goNext}
        >
          →
        </button> */}
        
        <Link
          href="/planner/calendar"
          className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900"
        >
          이동하기
          <span aria-hidden>›</span>
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-2 text-center text-m text-neutral-400">
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <PlannerDateGrid
        view="week"
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
        weekDays={weekDays}
        monthCells={[]}
        dotsByDate={dotsByDate}
      />

      
    </section>
  );
}
