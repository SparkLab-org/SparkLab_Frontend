import QuestionDetailView from '@/src/components/planner/question/QuestionDetailView';

export default async function MentorQuestionDetailPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <QuestionDetailView questionId={questionId} />
    </div>
  );
}
