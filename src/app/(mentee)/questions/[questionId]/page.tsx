import QuestionDetailView from '@/src/components/planner/question/QuestionDetailView';

export default async function MenteeQuestionDetailPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <QuestionDetailView questionId={questionId} />
    </div>
  );
}
