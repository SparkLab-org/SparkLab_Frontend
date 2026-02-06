'use client';

import { useMemo } from 'react';
import { useQuestionsQuery } from '@/src/hooks/questionQueries';
import QuestionDetailCards from './QuestionDetailCards';

type Props = {
  questionId: string;
};

export default function QuestionDetailView({ questionId }: Props) {
  const { data: questions = [] } = useQuestionsQuery();
  const question = useMemo(
    () => questions.find((item) => item.id === questionId),
    [questions, questionId]
  );

  if (!question) {
    return (
      <div className="rounded-2xl bg-neutral-100 px-4 py-6 text-center text-sm text-neutral-500">
        질문을 찾을 수 없어요.
      </div>
    );
  }

  return <QuestionDetailCards question={question} />;
}
