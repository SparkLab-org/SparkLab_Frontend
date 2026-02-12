"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { addDays, endOfMonth, format, startOfMonth, startOfWeek } from "date-fns";

import PlannerDateGrid from "../calendar/PlannerDateGrid";
import { usePlannerStore } from "@/src/store/plannerStore";
import { useTodosRangeQuery } from "@/src/hooks/todoQueries";

type Props = Record<string, never>;

export default function WeeklyCalendar({}: Props) {
  const selectedDateStr = usePlannerStore((s) => s.selectedDate);
  const selectedDate = useMemo(() => new Date(selectedDateStr), [selectedDateStr]);
  const setSelectedDate = usePlannerStore((s) => s.setSelectedDate);

  const weekStart = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 0 }),
    [selectedDate]
  );

  useEffect(() => {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    setSelectedDate(todayKey);
  }, [setSelectedDate]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const weekDateKeys = useMemo(
    () => weekDays.map((day) => format(day, "yyyy-MM-dd")),
    [weekDays]
  );
  const monthRange = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    return {
      start: format(monthStart, "yyyy-MM-dd"),
      end: format(monthEnd, "yyyy-MM-dd"),
    };
  }, [selectedDate]);
  const { data: todos = [], isFetching } = useTodosRangeQuery(weekDateKeys, {
    rangeStart: monthRange.start,
    rangeEnd: monthRange.end,
    scope: 'planner-home',
  });
  const showSkeleton = isFetching && todos.length === 0;

  const progressByDate: Record<string, number> = useMemo(() => {
    const counts = todos.reduce<Record<string, { total: number; done: number }>>((acc, todo) => {
      if (!todo.dueDate) return acc;
      const current = acc[todo.dueDate] ?? { total: 0, done: 0 };
      current.total += 1;
      if (todo.status === 'DONE') current.done += 1;
      acc[todo.dueDate] = current;
      return acc;
    }, {});

    return Object.fromEntries(
      Object.entries(counts).map(([date, { total, done }]) => [
        date,
        total > 0 ? done / total : 0,
      ])
    );
  }, [todos]);

  return (
    <section
      className="rounded-3xl p-5 bg-white"
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
        progressByDate={progressByDate}
        isLoading={showSkeleton}
      />
    </section>
  );
}
