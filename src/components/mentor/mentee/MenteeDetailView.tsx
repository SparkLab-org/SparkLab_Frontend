'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useMentorStore } from '@/src/store/mentorStore';
import { useTodosQuery } from '@/src/hooks/todoQueries';
import { isOverdueTask } from '@/src/lib/utils/todoStatus';
import type { Todo } from '@/src/lib/types/planner';

const DEFAULT_MENTEE_ID = 'm1';

function getStatusLabel(todo: Todo) {
  const isLocked = isOverdueTask(todo);
  if (isLocked) {
    return todo.status === 'DONE' ? '지각' : '미제출';
  }
  return todo.status === 'DONE' ? '완료' : '진행중';
}

export default function MenteeDetailView() {
  const params = useParams<{ menteeId?: string | string[] }>();
  const menteeIdParam = params?.menteeId;
  const menteeId = Array.isArray(menteeIdParam)
    ? menteeIdParam[0]
    : menteeIdParam ?? DEFAULT_MENTEE_ID;

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

  const { data: todos = [] } = useTodosQuery();

  const menteeTodos = useMemo(
    () =>
      todos.filter(
        (todo) => (todo.assigneeId ?? DEFAULT_MENTEE_ID) === resolvedMenteeId
      ),
    [todos, resolvedMenteeId]
  );
  const doneTodos = useMemo(
    () => menteeTodos.filter((todo) => todo.status === 'DONE'),
    [menteeTodos]
  );
  const totalCount = menteeTodos.length;
  const progressPercent = totalCount > 0 ? Math.round((doneTodos.length / totalCount) * 100) : 0;

  const groupedTodos = useMemo(() => {
    const map = new Map<string, Todo[]>();
    menteeTodos.forEach((todo) => {
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
  }, [menteeTodos]);

  if (!selectedMentee) {
    return (
      <div className="rounded-3xl bg-[#F5F5F5] p-6">
        <p className="text-sm text-neutral-500">멘티 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#F5F5F5] p-6">
        <Link href="/mentor/mentee" className="text-xs text-neutral-500 hover:text-neutral-900">
          ← 멘티 목록으로 돌아가기
        </Link>
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
            총 과제 {totalCount}건
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-[#F5F5F5] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">성취도</h2>
          <span className="text-xs text-neutral-500">
            완료 {doneTodos.length} / {totalCount}
          </span>
        </div>
        <div className="mt-4 rounded-2xl bg-white p-4">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>진행률</span>
            <span className="font-semibold text-neutral-900">{progressPercent}%</span>
          </div>
          <div className="mt-3 h-2.5 w-full rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-neutral-900"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-[#F5F5F5] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">과제 현황</h2>
          <span className="text-xs text-neutral-500">날짜별 보기</span>
        </div>
        <div className="mt-4 space-y-4">
          {groupedTodos.length === 0 && (
            <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
              등록된 과제가 없습니다.
            </div>
          )}
          {groupedTodos.map((group) => (
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
      </section>

      <section className="rounded-3xl bg-[#F5F5F5] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">제출된 과제</h2>
          <span className="text-xs text-neutral-500">총 {doneTodos.length}건</span>
        </div>
        <div className="mt-4 space-y-2">
          {doneTodos.length === 0 && (
            <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
              제출된 과제가 없습니다.
            </div>
          )}
          {doneTodos.map((todo) => (
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
      </section>
    </div>
  );
}
