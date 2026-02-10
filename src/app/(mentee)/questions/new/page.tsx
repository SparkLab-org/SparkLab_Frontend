import QuestionForm from '@/src/components/planner/question/QuestionForm';

export default function MenteeQuestionNewPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <QuestionForm basePath="/questions" />
    </div>
  );
}
