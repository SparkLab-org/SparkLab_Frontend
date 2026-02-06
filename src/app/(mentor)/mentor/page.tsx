'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import { useMentorStore } from '@/src/store/mentorStore';
import { useTodosQuery } from '@/src/hooks/todoQueries';
import { useQuestionsQuery } from '@/src/hooks/questionQueries';
import MentorGreetingCard from '@/src/components/mentor/mentor/MentorGreetingCard';
import MentorQuestionPanel from '@/src/components/mentor/mentor/MentorQuestionPanel';
import MentorMenteeListPanel from '@/src/components/mentor/mentor/MentorMenteeListPanel';
import MentorStatCard from '@/src/components/mentor/mentor/MentorStatCard';

const DEFAULT_MENTEE_ID = 'm1';
export default function MentorPage() {
  const mentees = useMentorStore((s) => s.mentees);
  const selectedId = useMentorStore((s) => s.selectedId);
  const setSelectedId = useMentorStore((s) => s.setSelectedId);
  const selectedMentee = useMemo(
    () => mentees.find((m) => m.id === selectedId) ?? mentees[0],
    [mentees, selectedId]
  );

  const { data: todos = [] } = useTodosQuery();
  const { data: questions = [] } = useQuestionsQuery();

  const mentorName = 'OOO';
  const menteeId = selectedMentee?.id ?? DEFAULT_MENTEE_ID;

  const menteeTodos = useMemo(
    () =>
      todos.filter((todo) => (todo.assigneeId ?? DEFAULT_MENTEE_ID) === menteeId),
    [todos, menteeId]
  );

  const totalCount = menteeTodos.length;

  const feedbackTodos = useMemo(
    () => menteeTodos.filter((todo) => typeof todo.feedback === 'string' && todo.feedback.trim()),
    [menteeTodos]
  );

  const pendingQuestions = useMemo(
    () => questions.filter((q) => q.status === '답변중').length,
    [questions]
  );

  const recentQuestions = useMemo(() => questions.slice(0, 3), [questions]);

  const remainingFeedback = Math.max(totalCount - feedbackTodos.length, 0);

  return (
    <div className="space-y-8">
      <div className="grid items-stretch gap-6 xl:grid-cols-[1.2fr,2fr]">
        <MentorGreetingCard
          mentorName={mentorName}
          dateLabel={format(new Date(), 'yyyy년 M월 d일 (EEE)', { locale: ko })}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
          <MentorStatCard
            label="답변 대기"
            value={`${pendingQuestions}건`}
            description="빠른 답변이 필요해요"
          />
          <MentorStatCard
            label="피드백 작성"
            value={`${feedbackTodos.length}건`}
            description={`미작성 ${remainingFeedback}건`}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px,1fr]">
        <MentorQuestionPanel pendingCount={pendingQuestions} recentQuestions={recentQuestions} />
        <MentorMenteeListPanel
          mentees={mentees}
          selectedId={menteeId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  );
}
