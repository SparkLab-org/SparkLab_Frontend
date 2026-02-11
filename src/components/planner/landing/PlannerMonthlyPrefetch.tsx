"use client";

import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, endOfMonth, format, startOfMonth, startOfWeek } from 'date-fns';

import { usePlannerStore } from '@/src/store/plannerStore';
import { todoQueryKeys } from '@/src/hooks/todoQueries';
import { listTodosByRange } from '@/src/services/todo.api';

function buildMonthCells(monthStart: Date) {
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export default function PlannerMonthlyPrefetch() {
  const selectedDateStr = usePlannerStore((s) => s.selectedDate);
  const selectedDate = useMemo(() => new Date(selectedDateStr), [selectedDateStr]);
  const monthKey = useMemo(() => format(selectedDate, 'yyyy-MM'), [selectedDate]);
  const accountId =
    typeof window !== 'undefined' ? window.localStorage.getItem('accountId') : null;
  const queryClient = useQueryClient();

  const monthStart = useMemo(() => startOfMonth(new Date(`${monthKey}-01`)), [monthKey]);
  const monthEnd = useMemo(() => endOfMonth(monthStart), [monthStart]);
  const monthRange = useMemo(
    () => ({
      start: format(monthStart, 'yyyy-MM-dd'),
      end: format(monthEnd, 'yyyy-MM-dd'),
    }),
    [monthStart, monthEnd]
  );
  const monthCells = useMemo(() => buildMonthCells(monthStart), [monthStart]);
  const monthDates = useMemo(
    () => monthCells.map((day) => format(day, 'yyyy-MM-dd')),
    [monthCells]
  );
  const normalizedDates = useMemo(() => {
    return Array.from(new Set(monthDates)).sort();
  }, [monthDates]);

  useEffect(() => {
    const rangeKey = `${monthRange.start}:${monthRange.end}`;
    const queryKey = todoQueryKeys.range(
      accountId,
      normalizedDates,
      rangeKey,
      null,
      'planner-prefetch'
    );
    queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const result = await listTodosByRange({
          startDate: monthRange.start,
          endDate: monthRange.end,
        });
        return result.todos;
      },
    });
  }, [queryClient, accountId, monthRange.start, monthRange.end, normalizedDates]);

  return null;
}
