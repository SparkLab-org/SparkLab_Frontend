'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { addDays, format, subDays } from 'date-fns';

import { useMentorStore } from '@/src/store/mentorStore';
import { useTodosRangeQuery } from '@/src/hooks/todoQueries';
import { useTodoFeedbackStatusQuery } from '@/src/hooks/feedbackQueries';
import { isOverdueTask } from '@/src/lib/utils/todoStatus';
import { getProgressFillStyle } from '@/src/lib/utils/progressStyle';
import type { Todo } from '@/src/lib/types/planner';
import { resolveNumericId } from '@/src/components/mentor/feedback/mentorFeedbackUtils';

const DEFAULT_MENTEE_ID = 'm1';

type Props = {
  menteeId?: string;
  showBackLink?: boolean;
};

function getStatusLabel(todo: Todo) {
  const isLocked = isOverdueTask(todo);
  if (isLocked) {
    return todo.status === 'DONE' ? '지각' : '미제출';
  }
  return todo.status === 'DONE' ? '완료' : '진행중';
}

function toIsoDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function MenteeDetailView({ menteeId: menteeIdProp, showBackLink = true }: Props) {
  const params = useParams<{ menteeId?: string | string[] }>();
  const menteeIdParam = params?.menteeId;
  const menteeIdFromRoute = Array.isArray(menteeIdParam)
    ? menteeIdParam[0]
    : menteeIdParam ?? DEFAULT_MENTEE_ID;
  const menteeId = menteeIdProp ?? menteeIdFromRoute;

  const mentees = useMentorStore((s) => s.mentees);
  const setSelectedId = useMentorStore((s) => s.setSelectedId);
  const selectedMentee = useMemo(
    () => mentees.find((m) => m.id === menteeId) ?? mentees[0],
    [menteeId, mentees]
  );
  const resolvedMenteeId = selectedMentee?.id ?? DEFAULT_MENTEE_ID;

  useEffect(() => {
    if (resolvedMenteeId) setSelectedId(resolvedMenteeId);
  }, [resolvedMenteeId, setSelectedId]);

  const rangeDates = useMemo(() => {
    const today = new Date();
    const start = subDays(today, 6);
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), 'yyyy-MM-dd')
    );
  }, []);

  const { data: todos = [] } = useTodosRangeQuery(rangeDates);

  const menteeTodos = useMemo(() => {
    return todos.filter((todo) => {
      const byId = String(todo.assigneeId ?? '') === String(resolvedMenteeId);
      const byName = selectedMentee?.name
        ? String(todo.assigneeName ?? '') === selectedMentee.name
        : false;
      return byId || byName;
    });
  }, [todos, resolvedMenteeId, selectedMentee?.name]);

  const todayKey = useMemo(() => toIsoDate(new Date()), []);
  const menteeNumericId = useMemo(
    () => resolveNumericId(resolvedMenteeId),
    [resolvedMenteeId]
  );
  const { data: todoStatusList = [] } = useTodoFeedbackStatusQuery({
    menteeId: menteeNumericId,
    planDate: todayKey,
  });

  const todoStatusTodos = useMemo<Todo[]>(() => {
    if (todoStatusList.length === 0) return [];
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
        assigneeId: resolvedMenteeId ?? null,
        assigneeName: menteeName ?? null,
        guideFileName: null,
        guideFileUrl: null,
        studySeconds: 0,
        createdAt: Date.now(),
        dueDate: item.targetDate ?? todayKey,
        dueTime: '23:59',
      };
    });
  }, [todoStatusList, selectedMentee?.name, resolvedMenteeId, todayKey]);

  const fallbackTodos = useMemo(() => {
    if (!selectedMentee) return [];
    return selectedMentee.today.map((item, index) => ({
      id: `${resolvedMenteeId}-today-${index}`,
      title: item.todo,
      isFixed: false,
      status: item.status,
      subject: item.subject,
      type: '학습',
      feedback: null,
      goal: null,
      assigneeId: resolvedMenteeId,
      assigneeName: selectedMentee.name,
      guideFileName: null,
      guideFileUrl: null,
      studySeconds: 0,
      createdAt: Date.now(),
      dueDate: todayKey,
      dueTime: '23:59',
    })) as Todo[];
  }, [selectedMentee, resolvedMenteeId, todayKey]);

  const displayTodos =
    menteeTodos.length > 0
      ? menteeTodos
      : todoStatusTodos.length > 0
      ? todoStatusTodos
      : fallbackTodos;

  const assignmentTodos = useMemo(
    () => displayTodos.filter((todo) => todo.type === '과제'),
    [displayTodos]
  );
  const studyTodos = useMemo(
    () => displayTodos.filter((todo) => todo.type === '학습'),
    [displayTodos]
  );
  const doneTodos = useMemo(
    () => displayTodos.filter((todo) => todo.status === 'DONE'),
    [displayTodos]
  );
  const doneAssignments = useMemo(
    () => assignmentTodos.filter((todo) => todo.status === 'DONE'),
    [assignmentTodos]
  );
  const totalCount = displayTodos.length;
  const progressPercent = totalCount > 0 ? Math.round((doneTodos.length / totalCount) * 100) : 0;

  const groupTodosByDate = (items: Todo[]) => {
    const map = new Map<string, Todo[]>();
    items.forEach((todo) => {
      const key = todo.dueDate || '날짜 미정';
      const bucket = map.get(key) ?? [];
      bucket.push(todo);
      map.set(key, bucket);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, list]) => ({
        date,
        todos: list.slice().sort((a, b) => a.dueTime.localeCompare(b.dueTime)),
      }));
  };

  const groupedAssignments = useMemo(
    () => groupTodosByDate(assignmentTodos),
    [assignmentTodos]
  );
  const groupedStudies = useMemo(() => groupTodosByDate(studyTodos), [studyTodos]);

  if (!selectedMentee) {
    return (
      <div className="rounded-3xl bg-white p-6">
        <p className="text-sm text-neutral-500">멘티 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6">
        {showBackLink && (
          <Link href="/mentor/mentee" className="text-xs text-neutral-500 hover:text-neutral-900">
            ← 멘티 목록으로 돌아가기
          </Link>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 lg:text-2xl">
              {selectedMentee.name} 멘티
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              {selectedMentee.grade} · {selectedMentee.track}
            </p>
          </div>
          <div className="rounded-2xl bg-white px-4 py-2 text-xs text-neutral-600">
            총 과제 {assignmentTodos.length}건
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">성취도</h2>
          <span className="text-xs text-neutral-500">
            완료 {doneTodos.length} / {totalCount}
          </span>
        </div>
        <div className="rounded-3xl bg-white p-6">
          <div className="rounded-2xl bg-white p-4">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>진행률</span>
              <span className="font-semibold text-neutral-900">{progressPercent}%</span>
            </div>
            <div className="mt-3 h-2.5 w-full rounded-full bg-[#D5EBFF]">
              <div
                className="h-full rounded-full"
                style={getProgressFillStyle(progressPercent)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">과제 현황</h2>
          <span className="text-xs text-neutral-500">날짜별 보기</span>
        </div>
        <div className="rounded-3xl bg-white p-6">
          <div className="space-y-4">
            {groupedAssignments.length === 0 && (
              <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
                등록된 과제가 없습니다.
              </div>
            )}
            {groupedAssignments.map((group) => (
              <div key={group.date} className="rounded-2xl bg-white p-4">
                <p className="text-sm font-semibold text-neutral-700">{group.date}</p>
                <div className="mt-3 space-y-2">
                  {group.todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-100 px-4 py-3 text-xs"
                    >
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{todo.title}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {todo.subject} · {todo.dueTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-neutral-600">
                          {getStatusLabel(todo)}
                        </span>
                        <Link
                          href={`/mentor/mentee/${resolvedMenteeId}/todo/${todo.id}`}
                          className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                        >
                          상세보기 →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">학습 현황</h2>
          <span className="text-xs text-neutral-500">날짜별 보기</span>
        </div>
        <div className="rounded-3xl bg-white p-6">
          <div className="space-y-4">
            {groupedStudies.length === 0 && (
              <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
                등록된 학습이 없습니다.
              </div>
            )}
            {groupedStudies.map((group) => (
              <div key={group.date} className="rounded-2xl bg-white p-4">
                <p className="text-sm font-semibold text-neutral-700">{group.date}</p>
                <div className="mt-3 space-y-2">
                  {group.todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-100 px-4 py-3 text-xs"
                    >
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{todo.title}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {todo.subject} · {todo.dueTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-neutral-600">
                          {getStatusLabel(todo)}
                        </span>
                        <Link
                          href={`/mentor/mentee/${resolvedMenteeId}/todo/${todo.id}`}
                          className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                        >
                          상세보기 →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">제출된 과제</h2>
          <span className="text-xs text-neutral-500">총 {doneAssignments.length}건</span>
        </div>
        <div className="rounded-3xl bg-white p-6">
          <div className="space-y-2">
            {doneAssignments.length === 0 && (
              <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
                제출된 과제가 없습니다.
              </div>
            )}
            {doneAssignments.map((todo) => (
              <div
                key={todo.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-xs"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">{todo.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {todo.subject} · {todo.dueDate} · {todo.dueTime}
                  </p>
                </div>
                <Link
                  href={`/mentor/mentee/${resolvedMenteeId}/todo/${todo.id}`}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900"
                >
                  할일 상세 →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
