'use client';

import { useMemo, useState } from 'react';
import { addMonths, endOfMonth, format, isSameMonth, startOfMonth, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';

import { useMentorStore } from '@/src/store/mentorStore';
import { useMentorUiStore } from '@/src/store/mentorUiStore';
import { useCreateTodoMutation, useTodosRangeQuery } from '@/src/hooks/todoQueries';
import { useTodoFeedbackStatusQuery } from '@/src/hooks/feedbackQueries';
import MentorPlannerCalendarSection from '@/src/components/mentor/planner/MentorPlannerCalendarSection';
import MentorPlannerDayPanel from '@/src/components/mentor/planner/MentorPlannerDayPanel';
import MentorPlannerMenteeSection from '@/src/components/mentor/planner/MentorPlannerMenteeSection';
import {
  buildMenteeCardsFromTodos,
  buildMonthGrid,
  buildScheduleMap,
  buildScheduleMapFromTodos,
} from '@/src/components/mentor/planner/mentorPlannerUtils';
import { resolveNumericId } from '@/src/components/mentor/feedback/mentorFeedbackUtils';
import type { Todo, TodoSubject } from '@/src/lib/types/planner';

const FALLBACK_DUE_TIME = '23:59';

function toTodoSubject(value?: string): TodoSubject {
  if (value === '국어' || value === '영어' || value === '수학') return value;
  return '국어';
}

export default function MentorPlannerView() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelError, setPanelError] = useState('');
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
  const menteeNumericIdForRange = useMemo(() => {
    const fallbackId = mentees[0]?.id ?? '';
    const candidate = selectedMenteeId || fallbackId;
    const numeric = resolveNumericId(candidate);
    if (numeric) return numeric;
    const matched = mentees.find(
      (mentee) => mentee.id === candidate || mentee.name === candidate
    );
    return resolveNumericId(matched?.id ?? null);
  }, [selectedMenteeId, mentees]);
  const monthRange = useMemo(() => {
    const monthStart = startOfMonth(activeMonth);
    const monthEnd = endOfMonth(activeMonth);
    return {
      start: format(monthStart, 'yyyy-MM-dd'),
      end: format(monthEnd, 'yyyy-MM-dd'),
    };
  }, [activeMonth]);
  const { data: todos = [], isFetching: isCalendarFetching } = useTodosRangeQuery(monthDates, {
    rangeStart: monthRange.start,
    rangeEnd: monthRange.end,
    menteeId: menteeNumericIdForRange ?? undefined,
    scope: 'mentor-planner',
  });
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
  const selectedMenteeName = selectedMentee?.name ?? '';
  const activeMenteeNumericId = useMemo(
    () => resolveNumericId(selectedMentee?.id ?? activeMenteeId),
    [selectedMentee?.id, activeMenteeId]
  );
  const { data: todoStatusList = [] } = useTodoFeedbackStatusQuery({
    menteeId: activeMenteeNumericId,
    planDate: selectedDateKey,
  });
  const todoStatusTodos = useMemo<Todo[]>(() => {
    if (todoStatusList.length === 0) return [];
    const menteeId = selectedMentee?.id ?? activeMenteeId;
    const menteeName = selectedMentee?.name ?? '';
    return todoStatusList.map((item) => {
      const normalizedType = (item.type ?? '').toUpperCase();
      const isAssignment =
        normalizedType.includes('ASSIGN') ||
        normalizedType.includes('HOMEWORK') ||
        normalizedType.includes('TASK');
      const subjectLabel =
        item.subject === 'ENGLISH'
          ? '영어'
          : item.subject === 'MATH'
          ? '수학'
          : item.subject === 'ALL'
          ? '국어'
          : '국어';
      return {
        id: String(item.todoItemId),
        title: item.title ?? '할 일',
        isFixed: isAssignment,
        status: item.hasFeedback ? 'DONE' : 'TODO',
        subject: subjectLabel,
        type: isAssignment ? '과제' : '학습',
        feedback: item.hasFeedback ? '등록됨' : null,
        goal: null,
        assigneeId: menteeId ?? null,
        assigneeName: menteeName ?? null,
        guideFileName: null,
        guideFileUrl: null,
        studySeconds: 0,
        createdAt: new Date(`${selectedDateKey}T00:00:00`).getTime(),
        dueDate: item.targetDate ?? selectedDateKey,
        dueTime: FALLBACK_DUE_TIME,
      };
    });
  }, [todoStatusList, selectedDateKey, selectedMentee, activeMenteeId]);

  const dayTodos = useMemo(() => {
    const filtered = todos.filter((todo) => {
      if (!todo.dueDate) return false;
      if (todo.dueDate !== selectedDateKey) return false;
      if (!activeMenteeId) return true;
      const id = String(todo.assigneeId ?? '');
      const name = String(todo.assigneeName ?? '');
      const numericKey = activeMenteeNumericId ? String(activeMenteeNumericId) : '';
      const hasAssignee = Boolean(id || name);
      if (!hasAssignee) return true;
      const byId = id === String(activeMenteeId);
      const byName =
        selectedMenteeName.length > 0 ? name === selectedMenteeName : false;
      const byNumeric = numericKey.length > 0 && (id === numericKey || name === numericKey);
      return byId || byName || byNumeric;
    });
    if (filtered.length > 0) {
      return [...filtered].sort((a, b) => a.dueTime.localeCompare(b.dueTime));
    }
    if (todoStatusTodos.length > 0) {
      return [...todoStatusTodos].sort((a, b) => a.dueTime.localeCompare(b.dueTime));
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
  }, [
    todos,
    selectedDateKey,
    activeMenteeId,
    activeMenteeNumericId,
    selectedMentee,
    selectedMenteeName,
    todoStatusTodos,
  ]);

  const scheduleByDate = useMemo(() => {
    if (isCalendarFetching) {
      return {};
    }
    const menteeIdKey = activeMenteeId ? String(activeMenteeId) : '';
    const menteeNameKey = selectedMenteeName ? String(selectedMenteeName) : '';
    const menteeNumericKey = activeMenteeNumericId ? String(activeMenteeNumericId) : '';
    const shouldFilterByMentee = Boolean(menteeIdKey || menteeNameKey);
    const filteredTodos = shouldFilterByMentee
      ? todos.filter((todo) => {
          const id = String(todo.assigneeId ?? '');
          const name = String(todo.assigneeName ?? '');
          if (!id && !name) return true;
          if (menteeIdKey && id === menteeIdKey) return true;
          if (menteeNameKey && name === menteeNameKey) return true;
          if (menteeNameKey && id === menteeNameKey) return true;
          if (menteeIdKey && name === menteeIdKey) return true;
          if (menteeNumericKey && id === menteeNumericKey) return true;
          if (menteeNumericKey && name === menteeNumericKey) return true;
          return false;
        })
      : todos;

    if (filteredTodos.length > 0) {
      return buildScheduleMapFromTodos(filteredTodos);
    }
    if (todoStatusTodos.length > 0) {
      return buildScheduleMapFromTodos(todoStatusTodos);
    }
    const base = activeMenteeId
      ? menteeList.filter((mentee) => mentee.id === activeMenteeId)
      : menteeList;
    return buildScheduleMap(base, activeMonth);
  }, [
    activeMonth,
    menteeList,
    activeMenteeId,
    activeMenteeNumericId,
    selectedMenteeName,
    todos,
    todoStatusTodos,
    isCalendarFetching,
  ]);

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
    guideFile?: File | null;
  }) => {
    if (!activeMenteeId) return;
    setPanelError('');
    createTodo(
      {
        title: input.title,
        subject: input.subject,
        dueDate: selectedDateKey,
        dueTime: input.dueTime,
        type: '과제',
        isFixed: true,
        goal: input.goal,
        guideFileName: input.guideFileName,
        guideFile: input.guideFile ?? undefined,
        assigneeId: activeMenteeId,
        assigneeName: selectedMentee?.name,
      },
      {
        onError: () => {
          setPanelError('과제 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        },
      }
    );
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
        isLoading={isCalendarFetching}
        onPrevMonth={goPrevMonth}
        onNextMonth={goNextMonth}
        onSelectDate={handleSelectDate}
      />

      <MentorPlannerDayPanel
        isOpen={isPanelOpen}
        dateLabel={headerLabel}
        menteeName={selectedMentee?.name}
        menteeId={selectedMentee?.id ?? activeMenteeId}
        dayTodos={dayTodos}
        onClose={() => setIsPanelOpen(false)}
        onCreateAssignment={handleCreateAssignment}
        isCreating={isCreating}
        errorMessage={panelError}
      />
    </div>
  );
}
