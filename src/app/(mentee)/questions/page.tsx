'use client';

import QuestionAlertCard from '@/src/components/planner/question/QuestionAlertCard';
import QuestionList from '@/src/components/planner/question/QuestionList';
import { useQuestionsQuery } from '@/src/hooks/questionQueries';

export default function MenteeQuestionsPage() {
  const { data: questions = [] } = useQuestionsQuery();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <QuestionAlertCard />
      <QuestionList items={questions} basePath="/questions" />
    </div>
  );
}
