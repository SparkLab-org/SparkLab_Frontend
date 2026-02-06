'use client';

import QuestionList from '@/src/components/planner/question/QuestionList';
import { useQuestionsQuery } from '@/src/hooks/questionQueries';

export default function MentorQuestionPage() {
  const { data: questions = [] } = useQuestionsQuery();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-xl font-semibold text-neutral-900">멘티 질문</h1>
      <QuestionList
        items={questions}
        basePath="/mentor/question"
        showCreate={false}
        headerLabel="질문 목록"
      />
    </div>
  );
}
