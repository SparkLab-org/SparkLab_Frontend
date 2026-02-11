'use client';

import { useMemo, useState } from 'react';
import { useAuthMeQuery } from '@/src/hooks/authQueries';
import {
  mapAssignmentToTodo,
  useMenteeAssignmentsQuery,
} from '@/src/hooks/assignmentQueries';
import { usePlannerStore } from '@/src/store/plannerStore';
import type { TodoSubject } from '@/src/lib/types/planner';
import AssignmentItem from './AssignmentItem';

type SubjectFilter = '전체' | TodoSubject;

type Props = {
  hideFilters?: boolean;
  hideTitle?: boolean;
};

export default function AssignmentList({ hideFilters = false, hideTitle = false }: Props) {
  const selectedDate = usePlannerStore((s) => s.selectedDate);
  const { data: me } = useAuthMeQuery();
  const menteeId = typeof me?.menteeId === 'number' ? me.menteeId : undefined;
  const { data: assignmentGroups = [] } = useMenteeAssignmentsQuery({ menteeId });
  const [activeSubject, setActiveSubject] = useState<SubjectFilter>('전체');

  const subjects: SubjectFilter[] = ['전체', '국어', '수학', '영어'];

  const assignments = useMemo(() => {
    return assignmentGroups.flatMap((group) =>
      (group.assignments ?? []).map((assignment) =>
        mapAssignmentToTodo(assignment, {
          accountId: group.accountId,
          menteeId: group.menteeId,
        })
      )
    );
  }, [assignmentGroups]);

  const filteredByDate = useMemo(() => {
    if (!selectedDate) return assignments;
    return assignments.filter((todo) => todo.dueDate === selectedDate);
  }, [assignments, selectedDate]);

  const filtered = useMemo(() => {
    if (activeSubject === '전체') return filteredByDate;
    return filteredByDate.filter((todo) => todo.subject === activeSubject);
  }, [filteredByDate, activeSubject]);

  return (
    <section className="space-y-5">
      {!hideTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-neutral-900">과제</h2>
        </div>
      )}

      {!hideFilters && (
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-neutral-100 p-1">
            <div className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
              {subjects.map((item) => {
                const active = activeSubject === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveSubject(item)}
                    className={[
                      'rounded-full px-4 py-1.5 transition',
                      active ? 'bg-[#004DFF] text-white' : 'hover:text-neutral-800',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-[#F5F5F5] px-4 py-6 text-center text-sm text-neutral-500">
          오늘 할당된 과제가 없어요.
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((todo) => (
            <AssignmentItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </section>
  );
}
