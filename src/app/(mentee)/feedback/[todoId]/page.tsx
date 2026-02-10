import FeedbackDetailView from '@/src/components/feedback/detail/FeedbackDetailView';

export default async function FeedbackDetailPage({
  params,
}: {
  params: Promise<{ todoId: string }>;
}) {
  const { todoId } = await params;
  return <FeedbackDetailView todoId={todoId} />;
}
