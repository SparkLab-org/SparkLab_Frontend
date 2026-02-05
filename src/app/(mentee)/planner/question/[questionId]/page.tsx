import QuestionDetailCards from '@/src/components/question/QuestionDetailCards';
import { getQuestionDetail } from '@/src/components/question/data';

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;
  const question = getQuestionDetail(questionId);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <QuestionDetailCards question={question} />
    </div>
  );
}
