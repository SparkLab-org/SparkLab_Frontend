'use client';

import { useMemo, useState } from 'react';

import { addDays, format, subDays } from 'date-fns';

import { useMentorStore } from '@/src/store/mentorStore';
import { useMentorUiStore } from '@/src/store/mentorUiStore';
import { useTodosRangeQuery } from '@/src/hooks/todoQueries';
import {
  useCreateFeedbackMutation,
  useFeedbacksQuery,
  useTodoFeedbackStatusQuery,
  useTodoFeedbackStatusRangeQuery,
  useUpdateFeedbackMutation,
} from '@/src/hooks/feedbackQueries';
import { useAuthMeQuery } from '@/src/hooks/authQueries';
import type { Feedback } from '@/src/lib/types/feedback';
import type { Todo } from '@/src/lib/types/planner';
import MentorFeedbackChannelList from '@/src/components/mentor/feedback/MentorFeedbackChannelList';
import MentorFeedbackDetailPanel from '@/src/components/mentor/feedback/MentorFeedbackDetailPanel';
import MentorFeedbackMenteeGrid from '@/src/components/mentor/feedback/MentorFeedbackMenteeGrid';
import MentorFeedbackTodoPanel from '@/src/components/mentor/feedback/MentorFeedbackTodoPanel';
import MentorFeedbackWriteModal from '@/src/components/mentor/feedback/MentorFeedbackWriteModal';
import type {
  FeedbackTypeFilter,
  MenteeCard,
} from '@/src/components/mentor/feedback/mentorFeedbackTypes';
import {
  FALLBACK_CREATED_AT,
  getTopSubject,
  hasFeedbackForTodo,
  resolveNumericId,
  resolveTodoItemId,
  toTodoSubject,
} from '@/src/components/mentor/feedback/mentorFeedbackUtils';

export default function MentorFeedbackView() {
  const rangeDates = useMemo(() => {
    const today = new Date();
    const start = subDays(today, 6);
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(start, i), 'yyyy-MM-dd')
    );
  }, []);
  const { data: todos = [] } = useTodosRangeQuery(rangeDates);
  const { data: me } = useAuthMeQuery();
  const { data: feedbacks = [] } = useFeedbacksQuery();
  const mentees = useMentorStore((s) => s.mentees);
  const selectedDateKey = useMentorUiStore((s) => s.plannerSelectedDate);

  const [selectedMenteeId, setSelectedMenteeId] = useState<string | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState('');
  const [activeType, setActiveType] = useState<FeedbackTypeFilter>('전체');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftSummary, setDraftSummary] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftError, setDraftError] = useState('');

  const createFeedbackMutation = useCreateFeedbackMutation();
  const updateFeedbackMutation = useUpdateFeedbackMutation();

  const feedbackByTodoId = useMemo(() => {
    const map = new Map<string, Feedback>();
    feedbacks.forEach((feedback) => {
      if (feedback.todoItemId !== undefined) {
        map.set(String(feedback.todoItemId), feedback);
      }
    });
    return map;
  }, [feedbacks]);

  const menteeCards = useMemo<MenteeCard[]>(() => {
    const map = new Map<string, { todos: Todo[]; name: string }>();
    todos.forEach((todo) => {
      const key = todo.assigneeId ?? todo.assigneeName ?? '';
      if (!key) return;
      const id = String(key);
      const current = map.get(id) ?? { todos: [], name: todo.assigneeName ?? `멘티 ${id}` };
      current.todos.push(todo);
      if (todo.assigneeName) current.name = todo.assigneeName;
      map.set(id, current);
    });

    const buildFromTodos = (
      id: string,
      name: string,
      list: Todo[],
      grade?: string
    ): MenteeCard => {
      const studyTodos = list.filter((todo) => todo.type !== '과제');
      const assignmentTodos = list.filter((todo) => todo.type === '과제');
      const feedbackRequests = list.filter(
        (todo) => todo.status === 'DONE' && !hasFeedbackForTodo(todo, feedbackByTodoId)
      ).length;
      return {
        id,
        name,
        grade,
        feedbackRequests,
        studyCount: studyTodos.length,
        studySubject: getTopSubject(studyTodos),
        assignmentCount: assignmentTodos.length,
        assignmentSubject: getTopSubject(assignmentTodos),
      };
    };

    if (map.size === 0) {
      return mentees.map((mentee) => {
        const fallbackTodos = mentee.today.map<Todo>((item, index) => ({
          id: `${mentee.id}-today-${index}`,
          title: item.todo,
          isFixed: false,
          status: item.status,
          subject: toTodoSubject(item.subject),
          type: '학습',
          feedback: null,
          goal: null,
          assigneeId: mentee.id,
          assigneeName: mentee.name,
          guideFileName: null,
          guideFileUrl: null,
          studySeconds: 0,
          createdAt: FALLBACK_CREATED_AT,
          dueDate: '',
          dueTime: '',
        }));
        return buildFromTodos(mentee.id, mentee.name, fallbackTodos, mentee.grade);
      });
    }

    return Array.from(map.entries()).map(([id, entry]) => {
      const meta = mentees.find((mentee) => mentee.id === id || mentee.name === entry.name);
      return buildFromTodos(id, entry.name, entry.todos, meta?.grade);
    });
  }, [todos, mentees, feedbackByTodoId]);

  const isDetailView = selectedMenteeId !== null;
  const activeMenteeId = selectedMenteeId ?? '';
  const activeMenteeCard = useMemo(
    () => menteeCards.find((mentee) => mentee.id === activeMenteeId) ?? menteeCards[0],
    [menteeCards, activeMenteeId]
  );
  const activeMenteeMeta = useMemo(
    () =>
      mentees.find(
        (mentee) => mentee.id === activeMenteeId || mentee.name === activeMenteeCard?.name
      ),
    [mentees, activeMenteeId, activeMenteeCard]
  );
  const activeMenteeNumericId = resolveNumericId(activeMenteeMeta?.id ?? activeMenteeId);
  const { data: todoStatusList = [] } = useTodoFeedbackStatusQuery({
    menteeId: activeMenteeNumericId,
    planDate: selectedDateKey,
  });
  const { data: todoStatusRange = [] } = useTodoFeedbackStatusRangeQuery({
    menteeId: activeMenteeNumericId,
    dates: rangeDates,
  });

  const menteeTodos = useMemo(() => {
    if (!activeMenteeId) return [];
    const byId = todos.filter(
      (todo) => String(todo.assigneeId ?? '') === String(activeMenteeId)
    );
    if (byId.length > 0) return byId;
    if (activeMenteeCard?.name) {
      return todos.filter((todo) => todo.assigneeName === activeMenteeCard.name);
    }
    return [];
  }, [todos, activeMenteeId, activeMenteeCard]);

  const fallbackTodos = useMemo(() => {
    if (!activeMenteeMeta) return [];
    return activeMenteeMeta.today.map<Todo>((item, index) => ({
      id: `${activeMenteeMeta.id}-feedback-${index}`,
      title: item.todo,
      isFixed: false,
      status: item.status,
      subject: toTodoSubject(item.subject),
      type: '학습',
      feedback: null,
      goal: null,
      assigneeId: activeMenteeMeta.id,
      assigneeName: activeMenteeMeta.name,
      guideFileName: null,
      guideFileUrl: null,
      studySeconds: 0,
      createdAt: FALLBACK_CREATED_AT,
      dueDate: '',
      dueTime: '23:59',
    }));
  }, [activeMenteeMeta]);

  const todoStatusTodos = useMemo<Todo[]>(() => {
    const source =
      todoStatusRange.length > 0 ? todoStatusRange : todoStatusList;
    if (source.length === 0) return [];
    const menteeId = activeMenteeMeta?.id ?? activeMenteeId;
    const menteeName = activeMenteeMeta?.name ?? activeMenteeCard?.name ?? '';
    return source.map((item) => {
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
        status: 'DONE',
        subject: subjectLabel,
        type: isAssignment ? '과제' : '학습',
        feedback: item.hasFeedback ? '등록됨' : null,
        goal: null,
        assigneeId: menteeId ?? null,
        assigneeName: menteeName ?? null,
        guideFileName: null,
        guideFileUrl: null,
        studySeconds: 0,
        createdAt: FALLBACK_CREATED_AT,
        dueDate: item.targetDate ?? '',
        dueTime: '23:59',
      };
    });
  }, [
    todoStatusList,
    todoStatusRange,
    activeMenteeMeta,
    activeMenteeId,
    activeMenteeCard,
  ]);

  const displayTodos = useMemo(() => {
    const merged = new Map<string, Todo>();
    menteeTodos.forEach((todo) => {
      merged.set(String(todo.id), todo);
    });
    todoStatusTodos.forEach((todo) => {
      const existing = merged.get(String(todo.id));
      if (!existing || existing.status !== 'DONE') {
        merged.set(String(todo.id), todo);
      }
    });
    if (merged.size === 0) {
      fallbackTodos.forEach((todo) => merged.set(String(todo.id), todo));
    }
    return Array.from(merged.values());
  }, [menteeTodos, todoStatusTodos, fallbackTodos]);

  const filterByType = (list: Todo[]) => {
    if (activeType === '전체') return list;
    return list.filter((todo) => todo.type === activeType);
  };

  const pendingTodos = filterByType(
    displayTodos.filter(
      (todo) => todo.status === 'DONE' && !hasFeedbackForTodo(todo, feedbackByTodoId)
    )
  );
  const completedTodos = filterByType(
    displayTodos.filter(
      (todo) => todo.status === 'DONE' && hasFeedbackForTodo(todo, feedbackByTodoId)
    )
  );

  const todoCandidates = [...pendingTodos, ...completedTodos];
  const activeTodoId = todoCandidates.some((todo) => todo.id === selectedTodoId)
    ? selectedTodoId
    : todoCandidates[0]?.id ?? '';
  const selectedTodo =
    todoCandidates.find((todo) => todo.id === activeTodoId) ?? null;
  const selectedFeedback = selectedTodo
    ? feedbackByTodoId.get(String(selectedTodo.id))
    : undefined;

  const doneCount = displayTodos.filter((todo) => todo.status === 'DONE').length;
  const progressPercent =
    displayTodos.length > 0 ? Math.round((doneCount / displayTodos.length) * 100) : 0;

  const feedbackText =
    selectedFeedback?.content?.trim() ||
    selectedFeedback?.summary?.trim() ||
    selectedFeedback?.title?.trim() ||
    (selectedTodo?.feedback && selectedTodo.feedback !== '등록됨'
      ? selectedTodo.feedback
      : '') ||
    '';

  const mentorId = resolveNumericId(
    typeof me?.mentorId === 'number' ? me.mentorId : (me?.accountId as string | undefined)
  );
  const menteeId = resolveNumericId(selectedTodo?.assigneeId ?? activeMenteeId);
  const todoItemId = resolveTodoItemId(selectedTodo);

  const canSubmit =
    Boolean(selectedTodo) &&
    Boolean(mentorId) &&
    Boolean(menteeId) &&
    draftSummary.trim().length > 0 &&
    draftContent.trim().length > 0;

  const isSubmitting = createFeedbackMutation.isPending || updateFeedbackMutation.isPending;

  const handleSelectMentee = (id: string) => {
    setSelectedMenteeId(id);
    setSelectedTodoId('');
    setActiveType('전체');
  };

  const handleOpenModal = () => {
    if (!selectedTodo) return;
    setDraftSummary(selectedFeedback?.title ?? selectedFeedback?.summary ?? selectedTodo.title);
    setDraftContent(selectedFeedback?.content ?? '');
    setDraftError('');
    setIsModalOpen(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedTodo) {
      setDraftError('할 일을 선택해 주세요.');
      return;
    }
    if (!mentorId || !menteeId) {
      setDraftError('멘토/멘티 정보가 없어 저장할 수 없습니다.');
      return;
    }
    if (!draftSummary.trim() || !draftContent.trim()) {
      setDraftError('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    try {
      if (selectedFeedback?.id) {
        await updateFeedbackMutation.mutateAsync({
          id: selectedFeedback.id,
          patch: {
            title: draftSummary.trim(),
            summary: draftSummary.trim(),
            content: draftContent.trim(),
            todoItemId,
            targetDate: selectedTodo.dueDate,
          },
        });
      } else {
        await createFeedbackMutation.mutateAsync({
          mentorId,
          menteeId,
          todoItemId,
          targetDate: selectedTodo.dueDate,
          title: draftSummary.trim(),
          summary: draftSummary.trim(),
          content: draftContent.trim(),
        });
      }
      setIsModalOpen(false);
    } catch {
      setDraftError('피드백 저장에 실패했습니다.');
    }
  };

  if (!isDetailView) {
    return (
      <div className="space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-900 lg:text-2xl">멘티</h1>
        </header>

        <MentorFeedbackMenteeGrid
          menteeCards={menteeCards}
          onSelectMentee={handleSelectMentee}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedMenteeId(null)}
            className="text-xs font-semibold text-neutral-400 hover:text-neutral-700"
          >
            ← 멘티 목록
          </button>
          <h1 className="text-xl font-semibold text-neutral-900 lg:text-2xl">피드백</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[72px_260px_minmax(0,1fr)] lg:items-start">
        <MentorFeedbackChannelList
          menteeCards={menteeCards}
          activeMenteeId={activeMenteeId}
          onSelectMentee={handleSelectMentee}
        />

        <MentorFeedbackTodoPanel
          menteeName={activeMenteeCard?.name}
          menteeGrade={activeMenteeCard?.grade ?? activeMenteeMeta?.grade}
          activeType={activeType}
          onChangeType={setActiveType}
          pendingTodos={pendingTodos}
          completedTodos={completedTodos}
          activeTodoId={activeTodoId}
          onSelectTodo={setSelectedTodoId}
        />

        <MentorFeedbackDetailPanel
          todo={selectedTodo}
          progressPercent={progressPercent}
          feedbackText={feedbackText}
          feedbackId={selectedFeedback?.id}
          onOpenModal={handleOpenModal}
        />
      </div>

      <MentorFeedbackWriteModal
        isOpen={isModalOpen}
        dateLabel={selectedTodo?.dueDate ?? ''}
        summary={draftSummary}
        content={draftContent}
        error={draftError}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onChangeSummary={(value) => setDraftSummary(value)}
        onChangeContent={(value) => setDraftContent(value)}
        onSubmit={handleSubmitFeedback}
      />
    </div>
  );
}
