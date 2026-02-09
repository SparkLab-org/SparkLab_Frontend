'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useMentorStore } from '@/src/store/mentorStore';
import { useTodosQuery, useUpdateTodoMutation } from '@/src/hooks/todoQueries';
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

function formatSeconds(value?: number) {
  const total = Math.max(0, value ?? 0);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = Math.floor(total % 60);
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function MenteeTodoDetailView() {
  const params = useParams<{ menteeId?: string | string[]; todoId?: string | string[] }>();
  const menteeIdParam = params?.menteeId;
  const todoIdParam = params?.todoId;
  const menteeId = Array.isArray(menteeIdParam)
    ? menteeIdParam[0]
    : menteeIdParam ?? DEFAULT_MENTEE_ID;
  const todoId = Array.isArray(todoIdParam) ? todoIdParam[0] : todoIdParam ?? '';

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
  const updateTodoMutation = useUpdateTodoMutation();
  const todo = useMemo(() => todos.find((item) => item.id === todoId), [todos, todoId]);

  const [draft, setDraft] = useState('');
  useEffect(() => {
    setDraft(todo?.feedback ?? '');
  }, [todo?.feedback, todo?.id]);

  if (!todo) {
    return (
      <div className="rounded-3xl bg-[#F5F5F5] p-6">
        <Link
          href={`/mentor/mentee/${resolvedMenteeId}`}
          className="text-xs text-neutral-500 hover:text-neutral-900"
        >
          ← 멘티 상세로 돌아가기
        </Link>
        <p className="mt-4 text-sm text-neutral-500">과제를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const statusLabel = getStatusLabel(todo);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-[#F5F5F5] p-6">
        <Link
          href={`/mentor/mentee/${resolvedMenteeId}`}
          className="text-xs text-neutral-500 hover:text-neutral-900"
        >
          ← 멘티 상세로 돌아가기
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 lg:text-2xl">{todo.title}</h1>
            <p className="mt-1 text-xs text-neutral-500">
              {todo.subject} · {todo.type} · {todo.dueDate} {todo.dueTime}
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs text-neutral-600">
            {statusLabel}
          </span>
        </div>
      </section>

      <section className="rounded-3xl bg-[#F5F5F5] p-6">
        <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">과제 정보</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold text-neutral-500">목표</p>
            <p className="mt-2 text-sm text-neutral-900">
              {todo.goal && todo.goal.trim() ? todo.goal : '등록된 목표가 없습니다.'}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-4">
            <p className="text-xs font-semibold text-neutral-500">누적 학습 시간</p>
            <p className="mt-2 text-sm text-neutral-900">{formatSeconds(todo.studySeconds)}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 md:col-span-2">
            <p className="text-xs font-semibold text-neutral-500">학습지</p>
            {todo.guideFileUrl ? (
              <a
                href={todo.guideFileUrl}
                download
                className="mt-2 inline-flex text-sm font-semibold text-neutral-700 hover:text-neutral-900"
              >
                {todo.guideFileName ?? '학습지 다운로드'} →
              </a>
            ) : (
              <p className="mt-2 text-sm text-neutral-500">등록된 학습지가 없습니다.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-[#F5F5F5] p-6">
        <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">멘티 제출물</h2>
        <div className="mt-4 rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
          제출 파일이 아직 없습니다.
        </div>
      </section>

      <section className="rounded-3xl bg-[#F5F5F5] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 lg:text-lg">멘토 피드백</h2>
          <span className="text-xs text-neutral-500">멘티에게 전달될 내용</span>
        </div>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="과제에 대한 피드백을 작성하세요."
          rows={5}
          className="mt-4 w-full resize-none rounded-2xl bg-white px-4 py-3 text-sm text-neutral-900"
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => updateTodoMutation.mutate({ id: todo.id, patch: { feedback: draft } })}
            disabled={updateTodoMutation.isPending}
            className={[
              'rounded-xl px-4 py-2 text-xs font-semibold',
              updateTodoMutation.isPending
                ? 'cursor-not-allowed bg-neutral-300 text-neutral-500'
                : 'bg-neutral-900 text-white',
            ].join(' ')}
          >
            {updateTodoMutation.isPending ? '저장 중...' : '피드백 저장'}
          </button>
        </div>
      </section>
    </div>
  );
}
