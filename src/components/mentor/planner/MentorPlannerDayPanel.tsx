'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';

import type { Todo, TodoSubject } from '@/src/lib/types/planner';

type Props = {
  isOpen: boolean;
  dateLabel: string;
  menteeName?: string;
  menteeId?: string;
  dayTodos: Todo[];
  onClose: () => void;
  onCreateAssignment: (input: {
    title: string;
    subject: TodoSubject;
    dueTime: string;
    goal?: string;
    guideFileName?: string;
    guideFile?: File | null;
  }) => void;
  isCreating?: boolean;
  errorMessage?: string;
};

function getStatusLabel(status: Todo['status']) {
  return status === 'DONE' ? '완료' : '진행중';
}

function getStatusBadgeClass(status: Todo['status']) {
  return status === 'DONE'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-sky-100 text-sky-700';
}

function formatPeriodTime(value?: string) {
  if (!value) return '';
  const [hhRaw, mmRaw] = value.split(':');
  const hour24 = Number(hhRaw);
  const minute = Number(mmRaw ?? '0');
  if (!Number.isFinite(hour24) || !Number.isFinite(minute)) return value;
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${period} ${hour12}:${String(minute).padStart(2, '0')}`;
}

export default function MentorPlannerDayPanel({
  isOpen,
  dateLabel,
  menteeName,
  menteeId,
  dayTodos,
  onClose,
  onCreateAssignment,
  isCreating = false,
  errorMessage,
}: Props) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<TodoSubject>('국어');
  const [dueTime, setDueTime] = useState('23:59');
  const [goal, setGoal] = useState('');
  const [guideFileName, setGuideFileName] = useState('');
  const [guideFile, setGuideFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const assignmentTodos = useMemo(
    () => dayTodos.filter((todo) => todo.type === '과제'),
    [dayTodos]
  );
  const studyTodos = useMemo(
    () => dayTodos.filter((todo) => todo.type !== '과제'),
    [dayTodos]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError('과제 제목을 입력해 주세요.');
      return;
    }
    onCreateAssignment({
      title: trimmed,
      subject,
      dueTime,
      goal: goal.trim() ? goal.trim() : undefined,
      guideFileName: guideFileName.trim() ? guideFileName.trim() : undefined,
      guideFile: guideFile ?? undefined,
    });
    setTitle('');
    setGoal('');
    setGuideFileName('');
    setGuideFile(null);
    if (fileRef.current) fileRef.current.value = '';
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <button
        type="button"
        aria-label="패널 닫기"
        onClick={onClose}
        className={[
          'absolute inset-0 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />
      <aside
        className={[
          'absolute right-0 top-0 h-full w-full bg-white shadow-2xl transition-transform duration-300 pointer-events-auto lg:w-[580px]',
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <div>
            <p className="text-2xl font-semibold text-neutral-900">{dateLabel}</p>
            <p className="text-xs text-neutral-500">{menteeName ?? '멘티 선택'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-900"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-[calc(100%-48px)] overflow-y-auto p-4 space-y-5">
          <section className="space-y-3">
            <button
              type="button"
              onClick={() => setIsAssignmentFormOpen((prev) => !prev)}
              className={[
                'w-full rounded-xl px-4 py-2 text-sm font-semibold transition',
                isAssignmentFormOpen
                  ? 'bg-neutral-200 text-neutral-700'
                  : 'bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] text-white',
              ].join(' ')}
              aria-expanded={isAssignmentFormOpen}
            >
              {isAssignmentFormOpen ? '취소' : '과제 추가'}
            </button>
            {isAssignmentFormOpen && (
              <form onSubmit={handleSubmit} className="rounded-2xl bg-[#F6F8FA] p-4 space-y-3">
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-neutral-600">과제 제목</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="과제 내용을 입력하세요"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-neutral-600">과목</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as TodoSubject)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                  >
                    <option value="국어">국어</option>
                    <option value="영어">영어</option>
                    <option value="수학">수학</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-neutral-600">마감 시간</label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-neutral-600">오늘의 목표</label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  onInput={(event) => {
                    const target = event.currentTarget;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                  rows={5}
                  placeholder="예: 문제집 30p 완주"
                  className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold text-neutral-600">파일 첨부</label>
                <div className="flex items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
                  <span className="text-xs text-neutral-500">
                    {guideFileName ? guideFileName : '첨부 파일을 선택하세요.'}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-full bg-[#004DFF] px-3 py-1 text-[10px] font-semibold text-white"
                  >
                    첨부하기
                  </button>
                </div>
                {guideFileName && (
                  <button
                    type="button"
                    onClick={() => {
                      setGuideFileName('');
                      setGuideFile(null);
                      if (fileRef.current) fileRef.current.value = '';
                    }}
                    className="self-start text-[10px] font-semibold text-neutral-500 hover:text-neutral-700"
                  >
                    첨부 취소
                  </button>
                )}
              </div>
              {error && <p className="text-xs text-rose-500">{error}</p>}
              {errorMessage && (
                <p className="text-xs text-rose-500">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded-xl bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                과제 추가
              </button>
              </form>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setGuideFile(file);
                  setGuideFileName(file.name);
                } else {
                  setGuideFile(null);
                }
                event.target.value = '';
              }}
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-2xl bg-[#F6F8FA] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">과제 현황</h3>
            </div>
              <div className="space-y-2">
                {assignmentTodos.length === 0 && (
                  <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
                    등록된 과제가 없습니다.
                  </div>
                )}
                {assignmentTodos.map((todo) => {
                  const content = (
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-1.5 text-xs">
                      <div className="flex items-center">
                        <p className="text-sm font-semibold text-neutral-900">{todo.title}</p>
                      </div>
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          getStatusBadgeClass(todo.status),
                        ].join(' ')}
                      >
                        {getStatusLabel(todo.status)}
                      </span>
                    </div>
                  );
                  return menteeId ? (
                    <Link
                      key={todo.id}
                      href={`/mentor/mentee/${menteeId}/todo/${todo.id}`}
                      className="block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={todo.id}>{content}</div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-[#F6F8FA] p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">학습 현황</h3>
            </div>
              <div className="space-y-2">
                {studyTodos.length === 0 && (
                  <div className="rounded-2xl bg-white px-4 py-6 text-center text-sm text-neutral-500">
                    등록된 학습이 없습니다.
                  </div>
                )}
                {studyTodos.map((todo) => {
                  const content = (
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-1.5 text-xs">
                      <div className="flex items-center">
                        <p className="text-sm font-semibold text-neutral-900">{todo.title}</p>
                      </div>
                      <span
                        className={[
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          getStatusBadgeClass(todo.status),
                        ].join(' ')}
                      >
                        {getStatusLabel(todo.status)}
                      </span>
                    </div>
                  );
                  return menteeId ? (
                    <Link
                      key={todo.id}
                      href={`/mentor/mentee/${menteeId}/todo/${todo.id}`}
                      className="block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={todo.id}>{content}</div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
