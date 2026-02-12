'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { addDays, format, subDays } from 'date-fns';
import { User } from 'lucide-react';
import mentorTodoIcon from '@/src/assets/icons/mentorTodo.svg';

import { useMentorStore } from '@/src/store/mentorStore';
import { useTodosRangeQuery } from '@/src/hooks/todoQueries';
import { useFeedbacksQuery, useTodoFeedbackStatusQuery } from '@/src/hooks/feedbackQueries';
import { isOverdueTask } from '@/src/lib/utils/todoStatus';
import { getProgressFillStyle } from '@/src/lib/utils/progressStyle';
import type { Todo } from '@/src/lib/types/planner';
import type { Feedback } from '@/src/lib/types/feedback';
import { hasFeedbackForTodo, resolveNumericId } from '@/src/components/mentor/feedback/mentorFeedbackUtils';
import { useMentorMenteesQuery } from '@/src/hooks/menteeQueries';

const DEFAULT_MENTEE_ID = 'm1';

type Props = {
  menteeId?: string;
  showBackLink?: boolean;
};

function getStatusLabel(todo: Todo) {
  if (isOverdueTask(todo)) {
    return todo.status === 'DONE' ? '지각' : '미제출';
  }
  if (todo.status === 'DONE') return '완료';
  return '진행중';
}

function getStatusBadgeClass(label: string) {
  switch (label) {
    case '완료':
      return 'bg-emerald-100 text-emerald-700';
    case '지각':
      return 'bg-amber-100 text-amber-700';
    case '미제출':
      return 'bg-rose-100 text-rose-600';
    default:
      return 'bg-sky-100 text-sky-700';
  }
}

function toIsoDate(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatKoreanDateTime(date?: string, time?: string) {
  if (!date) return '';
  const parts = date.split('-');
  if (parts.length < 3) return date;
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!month || !day) return date;
  if (!time) return `${month}월${day}일`;
  const [hhRaw, mmRaw] = time.split(':');
  const hour24 = Number(hhRaw);
  const minute = Number(mmRaw);
  if (!Number.isFinite(hour24) || !Number.isFinite(minute)) {
    return `${month}월${day}일`;
  }
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minuteLabel = String(minute).padStart(2, '0');
  return `${month}월${day}일 ${period} ${hour12}:${minuteLabel}`;
}

function formatKoreanDate(date?: string) {
  if (!date) return '';
  const parts = date.split('-');
  if (parts.length < 3) return date;
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!month || !day) return date;
  return `${month}월${day}일`;
}

function MenteeDetailSkeleton({ showBackLink }: { showBackLink: boolean }) {
  return (
    <div className="space-y-5 animate-pulse">
      <section className="rounded-3xl">
        {showBackLink && <div className="h-3 w-32 rounded-full bg-neutral-200" />}
        <div className="mt-4 flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded-full bg-neutral-200" />
            <div className="h-3 w-40 rounded-full bg-neutral-200" />
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-neutral-200/70" />

      <section className="space-y-2">
        <div className="h-4 w-24 rounded-full bg-neutral-200" />
        <div className="rounded-3xl bg-[#F6F8FA] p-6">
          <div className="rounded-2xl bg-white p-4">
            <div className="h-3 w-24 rounded-full bg-neutral-200" />
            <div className="mt-3 h-2.5 w-full rounded-full bg-neutral-200" />
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <div className="h-4 w-32 rounded-full bg-neutral-200" />
        <div className="rounded-3xl bg-[#F6F8FA] p-6">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`feedback-skel-${index}`} className="h-12 rounded-2xl bg-white" />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={`status-skel-${index}`} className="space-y-3 rounded-3xl bg-[#F6F8FA] p-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded-full bg-neutral-200" />
              <div className="h-3 w-10 rounded-full bg-neutral-200" />
            </div>
            <div className="grid gap-2">
              {Array.from({ length: 3 }).map((__, itemIndex) => (
                <div key={`status-item-${itemIndex}`} className="h-12 rounded-xl bg-white" />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default function MenteeDetailView({ menteeId: menteeIdProp, showBackLink = true }: Props) {
  const params = useParams<{ menteeId?: string | string[] }>();
  const menteeIdParam = params?.menteeId;
  const menteeIdFromRoute = Array.isArray(menteeIdParam)
    ? menteeIdParam[0]
    : menteeIdParam ?? DEFAULT_MENTEE_ID;
  const menteeId = menteeIdProp ?? menteeIdFromRoute;

  const { isLoading: isMenteesLoading } = useMentorMenteesQuery();
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

  const { data: todos = [], isFetching: isTodosFetching } = useTodosRangeQuery(rangeDates);
  const { data: feedbacks = [], isFetching: isFeedbacksFetching } = useFeedbacksQuery();

  const feedbackByTodoId = useMemo(() => {
    const map = new Map<string, Feedback>();
    feedbacks.forEach((feedback) => {
      if (feedback.todoItemId !== undefined) {
        map.set(String(feedback.todoItemId), feedback);
      }
    });
    return map;
  }, [feedbacks]);

  const menteeTodos = useMemo(() => {
    return todos.filter((todo) => {
      const byId = String(todo.assigneeId ?? '') === String(resolvedMenteeId);
      const byName = selectedMentee?.name
        ? String(todo.assigneeName ?? '') === selectedMentee.name
        : false;
      return byId || byName;
    });
  }, [todos, resolvedMenteeId, selectedMentee]);

  const todayKey = useMemo(() => toIsoDate(new Date()), []);
  const menteeNumericId = useMemo(
    () => resolveNumericId(resolvedMenteeId),
    [resolvedMenteeId]
  );
  const { data: todoStatusList = [], isFetching: isStatusFetching } = useTodoFeedbackStatusQuery({
    menteeId: menteeNumericId,
    planDate: todayKey,
  });
  const showSkeleton =
    isMenteesLoading || isTodosFetching || isFeedbacksFetching || isStatusFetching;

  const todoStatusTodos = useMemo<Todo[]>(() => {
    if (todoStatusList.length === 0) return [];
    const menteeName = selectedMentee?.name ?? '';
    return todoStatusList.map((item) => {
      const createdAt =
        item.targetDate != null
          ? Date.parse(`${item.targetDate}T00:00:00`)
          : Date.parse(`${todayKey}T00:00:00`);
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
        createdAt,
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
      createdAt: Date.parse(`${todayKey}T00:00:00`),
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
    () => displayTodos.filter((todo) => todo.type === '과제' && todo.status !== 'DONE'),
    [displayTodos]
  );
  const studyTodos = useMemo(
    () => displayTodos.filter((todo) => todo.type === '학습' && todo.status !== 'DONE'),
    [displayTodos]
  );
  const doneTodos = useMemo(
    () => displayTodos.filter((todo) => todo.status === 'DONE'),
    [displayTodos]
  );
  const pendingFeedbackTodos = useMemo(
    () =>
      displayTodos.filter(
        (todo) =>
          todo.status === 'DONE' && !hasFeedbackForTodo(todo, feedbackByTodoId)
      ),
    [displayTodos, feedbackByTodoId]
  );
  const totalCount = displayTodos.length;
  const progressPercent = totalCount > 0 ? Math.round((doneTodos.length / totalCount) * 100) : 0;
  const mentorTodoSrc =
    typeof mentorTodoIcon === 'string' ? mentorTodoIcon : mentorTodoIcon?.src;

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

  if (showSkeleton) {
    return <MenteeDetailSkeleton showBackLink={showBackLink} />;
  }

  if (!selectedMentee) {
    return (
      <div className="rounded-3xl bg-white p-6">
        <p className="text-sm text-neutral-500">멘티 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl">
        {showBackLink && (
          <Link href="/mentor/mentee" className="text-xs text-neutral-500 hover:text-neutral-900">
            ← 멘티 목록으로 돌아가기
          </Link>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200">
              <User
                className="h-6 w-6 text-neutral-600"
                fill="currentColor"
                stroke="none"
                aria-hidden
              />
            </span>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900 lg:text-2xl">
                {selectedMentee.name} 멘티
              </h1>
              <p className="mt-1 text-xs text-neutral-500">
                {selectedMentee.grade} · {selectedMentee.track}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px w-full bg-neutral-200/70" />

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 lg:text-2xl">성취도</h2>
          <span className="text-xs text-neutral-500">
            완료 {doneTodos.length} / {totalCount}
          </span>
        </div>
        <div className="rounded-3xl bg-[#F6F8FA] p-6">
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

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-neutral-900 lg:text-2xl">피드백 필요</h2>
            {pendingFeedbackTodos.length > 0 && (
              <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
                <span className="h-2 w-2 font-semibold rounded-full bg-rose-500" aria-hidden />
                {pendingFeedbackTodos.length}건
              </span>
            )}
          </div>
          <span />
        </div>
        <div className="rounded-3xl bg-[#F6F8FA] p-6">
          <div className="space-y-2">
            {pendingFeedbackTodos.length === 0 && (
              <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
                모든 피드백 작성을 완료했습니다.
              </div>
            )}
            {pendingFeedbackTodos.map((todo) => {
              const statusLabel = getStatusLabel(todo);
              return (
                <Link
                  key={todo.id}
                  href={`/mentor/mentee/${resolvedMenteeId}/todo/${todo.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-xs transition hover:ring-1 hover:ring-neutral-200"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      {todo.type === '과제' && mentorTodoSrc ? (
                        <img
                          src={mentorTodoSrc}
                          alt=""
                          aria-hidden
                          className="h-5 w-5 shrink-0"
                        />
                      ) : null}
                      <p className="text-sm font-semibold text-neutral-900">
                        {todo.title}
                      </p>
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                        {todo.subject}
                      </span>
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          getStatusBadgeClass(statusLabel),
                        ].join(' ')}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatKoreanDateTime(todo.dueDate, todo.dueTime)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-3xl bg-[#F6F8FA] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">과제 현황</h2>
            <span className="text-xs text-neutral-500">총 {assignmentTodos.length}건</span>
          </div>
          <div className="grid gap-2">
            {assignmentTodos.length === 0 && (
              <div className="rounded-xl bg-[#FFF] px-3 py-3 text-sm text-neutral-500">
                등록된 과제가 없습니다.
              </div>
            )}
            {assignmentTodos.map((todo) => {
              const statusLabel = getStatusLabel(todo);
              const showDot =
                (statusLabel === '완료' || statusLabel === '지각') &&
                !hasFeedbackForTodo(todo, feedbackByTodoId);
              return (
                <Link
                  key={todo.id}
                  href={`/mentor/mentee/${resolvedMenteeId}/todo/${todo.id}`}
                  className="flex flex-row items-center gap-2 rounded-xl bg-white px-3 py-3.5 text-xs text-neutral-700 transition hover:ring-1 hover:ring-neutral-200"
                >
                  <div className="flex w-full items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-semibold text-neutral-900">{todo.title}</p>
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                          {todo.subject}
                        </span>
                        <span
                          className={[
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                            getStatusBadgeClass(statusLabel),
                          ].join(' ')}
                        >
                          {statusLabel}
                        </span>
                        {showDot && (
                          <span
                            className="h-2 w-2 rounded-full bg-rose-500"
                            aria-label="피드백 미작성"
                          />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatKoreanDateTime(todo.dueDate, todo.dueTime)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 rounded-3xl bg-[#F6F8FA] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">학습 현황</h2>
            <span className="text-xs text-neutral-500">총 {studyTodos.length}건</span>
          </div>
          <div className="grid gap-2">
            {studyTodos.length === 0 && (
              <div className="rounded-xl bg-[#FFF] px-3 py-3 text-sm text-neutral-500">
                등록된 학습이 없습니다.
              </div>
            )}
            {studyTodos.map((todo) => {
              const statusLabel = getStatusLabel(todo);
              return (
                <Link
                  key={todo.id}
                  href={`/mentor/mentee/${resolvedMenteeId}/todo/${todo.id}`}
                  className="flex flex-row items-center gap-2 rounded-xl bg-white px-3 py-3.5 text-xs text-neutral-700 transition hover:ring-1 hover:ring-neutral-200"
                >
                  <div className="flex w-full items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-semibold text-neutral-900">{todo.title}</p>
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                          {todo.subject}
                        </span>
                        <span
                          className={[
                            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                            getStatusBadgeClass(statusLabel),
                          ].join(' ')}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">
                        {formatKoreanDate(todo.dueDate)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
