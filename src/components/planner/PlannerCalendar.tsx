"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ko } from "date-fns/locale";

import PlannerViewToggle from "./PlannerViewToggle";
import PlannerDateGrid from "./PlannerDateGrid";

type View = "week" | "month";
type Dot = "green" | "pink";

function isoDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

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
  const [view, setView] = useState<View>("week");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  /** ✅ 날짜별 점(상태) - 임시 */
  const dotsByDate: Record<string, Dot[]> = useMemo(() => {
    const todayKey = isoDate(new Date());
    const selectedKey = isoDate(selectedDate);

    return {
      [todayKey]: ["green", "pink"],
      [selectedKey]: ["green", "pink", "green"],
    };
  }, [selectedDate]);

  /** ✅ 이전/다음 이동 */
  const goPrev = () => {
    if (view === "week") setSelectedDate((d) => subWeeks(d, 1));
    if (view === "month") setSelectedDate((d) => subMonths(d, 1));
  };

  const goNext = () => {
    if (view === "week") setSelectedDate((d) => addWeeks(d, 1));
    if (view === "month") setSelectedDate((d) => addMonths(d, 1));
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
          onSelectDate={setSelectedDate}
          weekDays={weekDays}
          monthCells={monthCells}
          dotsByDate={dotsByDate}
        />
      </section>

      {/* 아래 섹션들은 page에서 붙이거나, 나중에 별도 컴포넌트로 분리 */}
      {/* ... */}
    </div>
  );
}
