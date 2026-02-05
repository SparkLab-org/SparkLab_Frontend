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
import TodoItem from "@/src/components/planner/TodoItem";
import type { TodoSubject } from "@/src/lib/types/planner";
import {
  useDeleteTodoMutation,
  useTodosQuery,
  useUpdateTodoMutation,
} from "@/src/hooks/todoQueries";

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
  const { data: todos = [] } = useTodosQuery();
  const updateTodoMutation = useUpdateTodoMutation();
  const deleteTodoMutation = useDeleteTodoMutation();

  const toggleTodo = (id: string) => {
    const current = todos.find((todo) => todo.id === id);
    if (!current) return;
    const nextStatus = current.status === "DONE" ? "TODO" : "DONE";
    updateTodoMutation.mutate({ id, patch: { status: nextStatus } });
  };

  const removeTodo = (id: string) => {
    const current = todos.find((todo) => todo.id === id);
    if (!current) return;
    if (current.isFixed) return;
    deleteTodoMutation.mutate(id);
  };

  const updateTodo = (id: string, title: string, subject: TodoSubject) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    updateTodoMutation.mutate({ id, patch: { title: trimmed, subject } });
  };

  /** ✅ 주간 7일 */
  const weekStart = useMemo(
    () => startOfWeek(selectedDate, { weekStartsOn: 0 }),
    [selectedDate]
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  /** ✅ 월간 42칸 */
  const monthCells = useMemo(
    () => buildMonthGrid(selectedDate),
    [selectedDate],
  );

  /** ✅ 헤더 텍스트 */
  const headerText = useMemo(() => {
    return format(selectedDate, "M월 d일(EEE)", { locale: ko });
  }, [selectedDate]);

  /** ✅ 날짜별 성취도(완료율) - 투두 기반 */
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

  const selectedTodos = useMemo(() => {
    return todos
      .filter((todo) => todo.dueDate === selectedDateStr)
      .slice()
      .sort((a, b) => a.dueTime.localeCompare(b.dueTime));
  }, [todos, selectedDateStr]);

  const itemsByDate = useMemo(() => {
    return todos.reduce<Record<string, { title: string; status: string }[]>>(
      (acc, todo) => {
        if (!todo.dueDate) return acc;
        const items = acc[todo.dueDate] ?? [];
        items.push({ title: todo.title, status: todo.status });
        acc[todo.dueDate] = items;
        return acc;
      },
      {}
    );
  }, [todos]);

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
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-3 pb-16">
      <section className="rounded-3xl">
        <div className="flex justify-center">
          <PlannerViewToggle view={view} onChange={setView} />
        </div>

        <div className="mt-4 rounded-2xl p-4">
          <div className="flex items-center justify-between text-l font-semibold text-neutral-900">
            <div className="flex items-center gap-2 text-neutral-500">
              <button
                type="button"
                aria-label="이전"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
                onClick={goPrev}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-neutral-700"
                onClick={goNext}
              >
                ›
              </button>
            </div>
            <span className="text-right">{headerText}</span>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-sm text-neutral-400">
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
            progressByDate={progressByDate}
            itemsByDate={itemsByDate}
          />
        </div>
      </section>

      <section className="space-y-3 rounded-3xl">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xl mt-5 font-semibold text-neutral-800">
              {format(selectedDate, "M월 d일")} 학습목록
            </p>
            <p className="text-xs text-neutral-500">{selectedTodos.length}개</p>
          </div>
        </header>

        {selectedTodos.length === 0 ? (
          <div className="rounded-2xl  bg-white/80 px-4 py-6 text-center text-sm text-neutral-500">
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
                variant="compact"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
