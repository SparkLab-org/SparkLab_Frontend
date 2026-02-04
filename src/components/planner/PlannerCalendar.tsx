"use client";

import { useMemo } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ko } from "date-fns/locale";

import PlannerViewToggle from "./PlannerViewToggle";
import PlannerDateGrid from "./PlannerDateGrid";
import { usePlannerStore } from "@/src/store/plannerStore";
import TodoItem from "@/src/components/task/TodoItem";

type Dot = "green" | "pink";

/** ✅ 일요일 시작 월간 그리드(6x7=42칸) 생성 */
function buildMonthGrid(selectedDate: Date) {
  const monthStart = startOfMonth(selectedDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

  // 나중에 page에서 selectedDate를 store로 올리고 싶으면,
  // 여기 props로 selectedDate/onChange를 뚫어도 됩니다.
type Props = Record<string, never>;

export default function PlannerCalendar({}: Props) {
  const view = usePlannerStore((s) => s.view);
  const setView = usePlannerStore((s) => s.setView);
  const selectedDateStr = usePlannerStore((s) => s.selectedDate);
  const selectedDate = useMemo(() => new Date(selectedDateStr), [selectedDateStr]);
  const setSelectedDate = usePlannerStore((s) => s.setSelectedDate);
  const todos = usePlannerStore((s) => s.todos);
  const toggleTodo = usePlannerStore((s) => s.toggleTodo);
  const removeTodo = usePlannerStore((s) => s.removeTodo);
  const updateTodo = usePlannerStore((s) => s.updateTodo);

  /** ✅ 주간 7일 */
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  /** ✅ 월간 42칸 */
  const monthCells = useMemo(
    () => buildMonthGrid(selectedDate),
    [selectedDate],
  );

  /** ✅ 헤더 텍스트 */
  const headerText = useMemo(() => {
    if (view === "month")
      return format(selectedDate, "yyyy년 M월", { locale: ko });
    return format(selectedDate, "M월 d일(EEE)", { locale: ko });
  }, [selectedDate, view]);

  /** ✅ 날짜별 점(상태) - 투두 기반 */
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

  const selectedTodos = useMemo(() => {
    return todos
      .filter((todo) => todo.dueDate === selectedDateStr)
      .slice()
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
  }, [todos, selectedDateStr]);

  /** ✅ 이전/다음 이동 */
  const goPrev = () => {
    if (view === "week") setSelectedDate(subWeeks(selectedDate, 1));
    if (view === "month") setSelectedDate(subMonths(selectedDate, 1));
  };

  const goNext = () => {
    if (view === "week") setSelectedDate(addWeeks(selectedDate, 1));
    if (view === "month") setSelectedDate(addMonths(selectedDate, 1));
  };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-3 pb-16">
      {/* 주간/월간 토글 */}
      <div className="flex items-center justify-between pt-1 text-sm text-neutral-700">
        <button
          aria-label="뒤로"
          className="rounded-full px-2 py-1 text-neutral-600"
        >
          ←
        </button>

        <PlannerViewToggle view={view} onChange={setView} />

        <button
          aria-label="앞으로"
          className="rounded-full px-2 py-1 text-neutral-600"
        >
          →
        </button>
      </div>

      {/* 날짜 셀렉터 */}
      <section
        className="rounded-3xl p-5 shadow-sm ring-1 ring-neutral-100"
        style={{
          background:
            "linear-gradient(180deg, rgba(245, 245, 245, 0) 46.7%, #F5F5F5 100%)",
        }}
      >
        <div className="flex items-center justify-between text-sm font-semibold text-neutral-900">
          <span>{headerText}</span>
          <div className="flex items-center gap-3 text-neutral-500">
            <button
              type="button"
              aria-label="이전"
              className="px-2"
              onClick={goPrev}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="다음"
              className="px-2"
              onClick={goNext}
            >
              →
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-neutral-400">
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <PlannerDateGrid
          view={view}
          selectedDate={selectedDate}
          onSelectDate={(d) => setSelectedDate(d)}
          weekDays={weekDays}
          monthCells={monthCells}
          dotsByDate={dotsByDate}
        />
      </section>

      {view === "month" && (
        <section
          className="space-y-3 rounded-[26px] border border-neutral-100 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
          style={{
            background:
              "linear-gradient(180deg, rgba(245, 245, 245, 0) 46.7%, #F5F5F5 100%)",
          }}
        >
          <header className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-neutral-800">
                {format(selectedDate, "M월 d일")} 할 일
              </p>
              <p className="text-xs text-neutral-500">
                {selectedTodos.length}개
              </p>
            </div>
          </header>

          {selectedTodos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/80 px-4 py-6 text-center text-sm text-neutral-500">
              선택한 날짜에 등록된 할 일이 없어요.
            </div>
          ) : (
            <div className="grid gap-3">
              {selectedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onRemove={removeTodo}
                  onUpdate={updateTodo}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
