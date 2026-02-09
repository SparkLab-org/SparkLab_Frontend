'use client';

import { useMemo } from 'react';
import { addMonths, format, isSameMonth, startOfMonth, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

import { useMentorStore } from '@/src/store/mentorStore';
import { useMentorUiStore } from '@/src/store/mentorUiStore';
import { useTodosQuery } from '@/src/hooks/todoQueries';
import MentorPlannerCalendarSection from '@/src/components/mentor/planner/MentorPlannerCalendarSection';
import MentorPlannerMenteeSection from '@/src/components/mentor/planner/MentorPlannerMenteeSection';
import {
  buildMenteeCardsFromTodos,
  buildMonthGrid,
  buildScheduleMap,
  buildScheduleMapFromTodos,
} from '@/src/components/mentor/planner/mentorPlannerUtils';

export default function MentorPlannerView() {
  const mentees = useMentorStore((s) => s.mentees);
  const plannerSelectedDate = useMentorUiStore((s) => s.plannerSelectedDate);
  const plannerActiveMonth = useMentorUiStore((s) => s.plannerActiveMonth);
  const selectedMenteeId = useMentorUiStore((s) => s.plannerSelectedMenteeId);
  const setPlannerSelectedDate = useMentorUiStore((s) => s.setPlannerSelectedDate);
  const setPlannerActiveMonth = useMentorUiStore((s) => s.setPlannerActiveMonth);
  const setSelectedMenteeId = useMentorUiStore((s) => s.setPlannerSelectedMenteeId);
  const { data: todos = [] } = useTodosQuery();
  const selectedDate = useMemo(() => new Date(plannerSelectedDate), [plannerSelectedDate]);
  const activeMonth = useMemo(
    () => startOfMonth(new Date(plannerActiveMonth)),
    [plannerActiveMonth]
  );

  const menteeList = useMemo(() => mentees, [mentees]);
  const selectedDateKey = useMemo(
    () => format(selectedDate, 'yyyy-MM-dd'),
    [selectedDate]
  );
  const menteeCards = useMemo(
    () => buildMenteeCardsFromTodos(todos, menteeList, selectedDateKey),
    [todos, menteeList, selectedDateKey]
  );

  const activeMenteeId = useMemo(() => {
    if (menteeCards.length === 0) return '';
    const exists = menteeCards.some((mentee) => mentee.id === selectedMenteeId);
    return exists ? selectedMenteeId : menteeCards[0].id;
  }, [menteeCards, selectedMenteeId]);

  const monthCells = useMemo(() => buildMonthGrid(activeMonth), [activeMonth]);

  const scheduleByDate = useMemo(() => {
    const filteredTodos = activeMenteeId
      ? todos.filter((todo) => String(todo.assigneeId ?? '') === String(activeMenteeId))
      : todos;
    const todosForSchedule = filteredTodos.length > 0 ? filteredTodos : todos;
    if (todosForSchedule.length > 0) {
      return buildScheduleMapFromTodos(todosForSchedule);
    }
    const base = activeMenteeId
      ? menteeList.filter((mentee) => mentee.id === activeMenteeId)
      : menteeList;
    return buildScheduleMap(base, activeMonth);
  }, [activeMonth, menteeList, activeMenteeId, todos]);

  const headerLabel = useMemo(
    () => format(selectedDate, 'M월 d일(EEE)', { locale: ko }),
    [selectedDate]
  );

  const monthLabel = useMemo(
    () => format(activeMonth, 'yyyy년 M월', { locale: ko }),
    [activeMonth]
  );

  const goPrevMonth = () => {
    const next = startOfMonth(subMonths(activeMonth, 1));
    setPlannerActiveMonth(next);
    setPlannerSelectedDate(next);
  };

  const goNextMonth = () => {
    const next = startOfMonth(addMonths(activeMonth, 1));
    setPlannerActiveMonth(next);
    setPlannerSelectedDate(next);
  };

  const handleSelectDate = (date: Date) => {
    setPlannerSelectedDate(date);
    if (!isSameMonth(date, activeMonth)) {
      setPlannerActiveMonth(date);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 lg:text-3xl">플래너</h1>
          <p className="text-xs text-neutral-500">멘티별 학습 진행을 확인하세요.</p>
        </div>
      </section>

      <MentorPlannerMenteeSection
        menteeCards={menteeCards}
        activeMenteeId={activeMenteeId}
        onSelectMentee={setSelectedMenteeId}
      />

      <MentorPlannerCalendarSection
        headerLabel={headerLabel}
        monthLabel={monthLabel}
        monthCells={monthCells}
        selectedDate={selectedDate}
        activeMonth={activeMonth}
        scheduleByDate={scheduleByDate}
        onPrevMonth={goPrevMonth}
        onNextMonth={goNextMonth}
        onSelectDate={handleSelectDate}
      />
    </div>
  );
}
