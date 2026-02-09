'use client';

import { useMemo, useState } from 'react';
import { addMonths, format, isSameMonth, startOfMonth, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

import { useMentorStore } from '@/src/store/mentorStore';
import { useMentorUiStore } from '@/src/store/mentorUiStore';
import { useCreateTodoMutation, useTodosRangeQuery } from '@/src/hooks/todoQueries';
import MentorPlannerCalendarSection from '@/src/components/mentor/planner/MentorPlannerCalendarSection';
import MentorPlannerDayPanel from '@/src/components/mentor/planner/MentorPlannerDayPanel';
import MentorPlannerMenteeSection from '@/src/components/mentor/planner/MentorPlannerMenteeSection';
import {
  buildMenteeCardsFromTodos,
  buildMonthGrid,
  buildScheduleMap,
  buildScheduleMapFromTodos,
} from '@/src/components/mentor/planner/mentorPlannerUtils';
import type { Todo, TodoSubject } from '@/src/lib/types/planner';

const FALLBACK_DUE_TIME = '23:59';

function toTodoSubject(value?: string): TodoSubject {
  if (value === '국어' || value === '영어' || value === '수학') return value;
  return '국어';
}

export default function MentorPlannerView() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const mentees = useMentorStore((s) => s.mentees);
  const plannerSelectedDate = useMentorUiStore((s) => s.plannerSelectedDate);
  const plannerActiveMonth = useMentorUiStore((s) => s.plannerActiveMonth);
  const selectedMenteeId = useMentorUiStore((s) => s.plannerSelectedMenteeId);
  const setPlannerSelectedDate = useMentorUiStore((s) => s.setPlannerSelectedDate);
  const setPlannerActiveMonth = useMentorUiStore((s) => s.setPlannerActiveMonth);
  const setSelectedMenteeId = useMentorUiStore((s) => s.setPlannerSelectedMenteeId);
  const selectedDate = useMemo(() => new Date(plannerSelectedDate), [plannerSelectedDate]);
  const selectedDateKey = useMemo(
    () => format(selectedDate, 'yyyy-MM-dd'),
    [selectedDate]
  );
  const activeMonth = useMemo(
    () => startOfMonth(new Date(plannerActiveMonth)),
    [plannerActiveMonth]
  );
  const monthCells = useMemo(() => buildMonthGrid(activeMonth), [activeMonth]);
  const monthDates = useMemo(
    () => monthCells.map((date) => format(date, 'yyyy-MM-dd')),
    [monthCells]
  );
  const { data: todos = [] } = useTodosRangeQuery(monthDates);
  const { mutate: createTodo, isPending: isCreating } = useCreateTodoMutation();

  const menteeList = useMemo(() => mentees, [mentees]);
  const menteeCards = useMemo(
    () => buildMenteeCardsFromTodos(todos, menteeList, selectedDateKey),
    [todos, menteeList, selectedDateKey]
  );

  const activeMenteeId = useMemo(() => {
    if (menteeCards.length === 0) return '';
    const exists = menteeCards.some((mentee) => mentee.id === selectedMenteeId);
    return exists ? selectedMenteeId : menteeCards[0].id;
  }, [menteeCards, selectedMenteeId]);

  const selectedMentee = useMemo(
    () => menteeList.find((mentee) => mentee.id === activeMenteeId),
    [menteeList, activeMenteeId]
  );

  const dayTodos = useMemo(() => {
    const hasAssignee = todos.some((todo) => String(todo.assigneeId ?? '').length > 0);
    const filtered = todos.filter((todo) => {
      if (!todo.dueDate) return false;
      if (todo.dueDate !== selectedDateKey) return false;
      if (!activeMenteeId) return true;
      if (!hasAssignee) return true;
      return String(todo.assigneeId ?? '') === String(activeMenteeId);
    });
    if (filtered.length > 0) {
      return [...filtered].sort((a, b) => a.dueTime.localeCompare(b.dueTime));
    }
    if (!selectedMentee) return [];
    const createdAt = new Date(`${selectedDateKey}T00:00:00`).getTime();
    return selectedMentee.today.map<Todo>((item, index) => ({
      id: `fallback-${selectedMentee.id}-${selectedDateKey}-${index}`,
      title: item.todo,
      isFixed: false,
      status: item.status,
      subject: toTodoSubject(item.subject),
      type: '학습',
      feedback: null,
      goal: null,
      assigneeId: selectedMentee.id,
      assigneeName: selectedMentee.name,
      guideFileName: null,
      guideFileUrl: null,
      studySeconds: 0,
      createdAt,
      dueDate: selectedDateKey,
      dueTime: FALLBACK_DUE_TIME,
    }));
  }, [todos, selectedDateKey, activeMenteeId, selectedMentee]);

  const submittedAssignments = useMemo(
    () =>
      dayTodos.filter((todo) => todo.type === '과제' && todo.status === 'DONE'),
    [dayTodos]
  );

  const scheduleByDate = useMemo(() => {
    const hasAssignee = todos.some((todo) => String(todo.assigneeId ?? '').length > 0);
    const filteredTodos =
      activeMenteeId && hasAssignee
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
    setIsPanelOpen(true);
  };

  const handleCreateAssignment = (input: {
    title: string;
    subject: TodoSubject;
    dueTime: string;
    goal?: string;
    guideFileName?: string;
  }) => {
    if (!activeMenteeId) return;
    createTodo({
      title: input.title,
      subject: input.subject,
      dueDate: selectedDateKey,
      dueTime: input.dueTime,
      type: '과제',
      isFixed: true,
      goal: input.goal,
      guideFileName: input.guideFileName,
      assigneeId: activeMenteeId,
      assigneeName: selectedMentee?.name,
    });
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

      <MentorPlannerDayPanel
        isOpen={isPanelOpen}
        dateLabel={headerLabel}
        menteeName={selectedMentee?.name}
        dayTodos={dayTodos}
        submittedAssignments={submittedAssignments}
        onClose={() => setIsPanelOpen(false)}
        onCreateAssignment={handleCreateAssignment}
        isCreating={isCreating}
      />
    </div>
  );
}
