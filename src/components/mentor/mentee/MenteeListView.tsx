'use client';

import { useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, User } from 'lucide-react';

import { useMentorStore } from '@/src/store/mentorStore';
import { useMentorUiStore, type MentorSubjectFilter } from '@/src/store/mentorUiStore';
import type { ActiveLevel, Mentee } from '@/src/components/mentor/types';
import { getProgressFillStyle } from '@/src/lib/utils/progressStyle';
import { useUpdateMenteeActiveLevelMutation } from '@/src/hooks/menteeQueries';
import { useTodosRangeQuery } from '@/src/hooks/todoQueries';
import { addDays, format, subDays } from 'date-fns';

const SUBJECT_FILTERS: MentorSubjectFilter[] = ['전체', '국어', '수학', '영어'];

type Props = {
  onSelect?: (id: string) => void;
};

function getLevelLabel(level?: ActiveLevel) {
  switch (level) {
    case 'NORMAL':
      return '정상';
    case 'WARNING':
      return '주의';
    case 'DANGER':
      return '위험';
    default:
      return '정상';
  }
}

function getGoalRate(mentee: Mentee) {
  if (typeof mentee.goalRate === 'number') return mentee.goalRate;
  if (typeof mentee.progress === 'number') return mentee.progress;
  return 0;
}

export default function MenteeListView({ onSelect }: Props) {
  const mentees = useMentorStore((s) => s.mentees);
  const setSelectedId = useMentorStore((s) => s.setSelectedId);
  const selectedId = useMentorStore((s) => s.selectedId);
  const updateMenteeLevel = useMentorStore((s) => s.updateMenteeLevel);
  const subjectFilter = useMentorUiStore((s) => s.subjectFilter);
  const setSubjectFilter = useMentorUiStore((s) => s.setSubjectFilter);
  const updateLevelMutation = useUpdateMenteeActiveLevelMutation();
  const rangeDates = useMemo(() => {
    const today = new Date();
    const start = subDays(today, 34);
    return Array.from({ length: 35 }, (_, i) =>
      format(addDays(start, i), 'yyyy-MM-dd')
    );
  }, []);
  const { data: todos = [] } = useTodosRangeQuery(rangeDates);

  const todosByMentee = useMemo(() => {
    const map = new Map<string, typeof todos>();
    todos.forEach((todo) => {
      const idKey = todo.assigneeId ? String(todo.assigneeId) : '';
      const nameKey = todo.assigneeName ? String(todo.assigneeName) : '';
      if (idKey) {
        const list = map.get(idKey) ?? [];
        list.push(todo);
        map.set(idKey, list);
      }
      if (nameKey) {
        const list = map.get(nameKey) ?? [];
        list.push(todo);
        map.set(nameKey, list);
      }
    });
    return map;
  }, [todos]);

  const filteredMentees = useMemo(() => {
    const enriched = mentees.map((mentee) => {
      const todoList = todosByMentee.get(mentee.id) ?? todosByMentee.get(mentee.name) ?? [];
      const subjectsFromTodos = Array.from(new Set(todoList.map((todo) => todo.subject)));
      const subjects =
        subjectsFromTodos.length > 0
          ? subjectsFromTodos
          : mentee.subjects ?? mentee.today.map((item) => item.subject);
      const total = todoList.length;
      const done = todoList.filter((todo) => todo.status === 'DONE').length;
      const goalRate = total > 0 ? Math.round((done / total) * 100) : getGoalRate(mentee);
      return {
        ...mentee,
        subjects,
        goalRate,
      };
    });
    if (subjectFilter === '전체') return enriched;
    return enriched.filter((mentee) => {
      const subjects = mentee.subjects ?? mentee.today.map((item) => item.subject);
      return subjects.includes(subjectFilter);
    });
  }, [mentees, subjectFilter, todosByMentee]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 lg:text-3xl">담당 멘티</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#004DFF] text-white"
            aria-label="추가"
            onClick={(event) => event.stopPropagation()}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-[#004DFF] px-4 py-2 text-xs font-semibold text-white"
            onClick={(event) => event.stopPropagation()}
          >
            최신순
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SUBJECT_FILTERS.map((subject) => {
          const active = subjectFilter === subject;
          return (
            <button
              key={subject}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setSubjectFilter(subject);
              }}
              className={[
                'rounded-full px-4 py-2 text-xs font-semibold',
                active ? 'bg-[#004DFF] text-white' : 'bg-[#F5F5F5] text-neutral-500',
              ].join(' ')}
            >
              {subject}
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl bg-[#F5F5F5] p-4 overflow-x-auto">
        <div className="min-w-[880px]">
          <div className="grid grid-cols-12 items-center gap-2 rounded-2xl bg-white px-4 py-3 text-xs font-semibold text-neutral-500 whitespace-nowrap">
            <span className="col-span-3">이름</span>
            <span className="col-span-1">학년</span>
            <span className="col-span-3">과목</span>
            <span className="col-span-3">목표 달성률</span>
            <span className="col-span-1">학습 진행</span>
            <span className="col-span-1" />
          </div>

          <div className="divide-y divide-[#D9D9D9]">
            {filteredMentees.map((mentee) => {
              const goalRate = Math.max(0, Math.min(100, getGoalRate(mentee)));
              const subjects = Array.from(
                new Set(mentee.subjects ?? mentee.today.map((item) => item.subject))
              );
              return (
                <button
                  key={mentee.id}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedId(mentee.id);
                    onSelect?.(mentee.id);
                  }}
                  className={[
                    'grid w-full grid-cols-12 items-center gap-2 rounded-2xl px-4 py-4 text-left text-sm text-neutral-700 transition whitespace-nowrap',
                    mentee.id === selectedId
                      ? 'bg-white/80'
                      : 'bg-[#F5F5F5] hover:bg-white/60',
                  ].join(' ')}
                >
                  <div className="col-span-3 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-300/70">
                      <User className="h-5 w-5 text-neutral-500" aria-hidden />
                    </span>
                    <span className="font-semibold text-neutral-900">{mentee.name}</span>
                  </div>
                  <span className="col-span-1 text-sm text-neutral-600">{mentee.grade}</span>
                  <div className="col-span-3 flex flex-nowrap gap-1">
                    {subjects.map((subject) => (
                      <span
                        key={`${mentee.id}-${subject}`}
                        className="rounded-full bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600 whitespace-nowrap"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="h-2 w-full max-w-[180px] rounded-full bg-[#D5EBFF]">
                      <div
                        className="h-full rounded-full"
                        style={getProgressFillStyle(goalRate)}
                      />
                    </div>
                  </div>
                  <div className="col-span-1" onClick={(event) => event.stopPropagation()}>
                    <select
                      value={mentee.activeLevel ?? 'NORMAL'}
                      onChange={(event) => {
                        const next = event.target.value as ActiveLevel;
                        updateMenteeLevel(mentee.id, next);
                        const menteeId = Number(mentee.id);
                        if (Number.isFinite(menteeId)) {
                          updateLevelMutation.mutate({ menteeId, activeLevel: next });
                        }
                      }}
                      className="w-full appearance-none rounded-full bg-neutral-100 px-2 py-1 text-[10px] text-neutral-600"
                    >
                      <option value="NORMAL">{getLevelLabel('NORMAL')}</option>
                      <option value="WARNING">{getLevelLabel('WARNING')}</option>
                      <option value="DANGER">{getLevelLabel('DANGER')}</option>
                    </select>
                  </div>
                  <ChevronRight className="col-span-1 h-4 w-4 text-neutral-300" />
                </button>
              );
            })}
            {filteredMentees.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-neutral-400">
                조건에 맞는 멘티가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
