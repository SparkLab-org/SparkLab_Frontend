import FeedbackDetailView from '@/src/components/feedback/detail/FeedbackDetailView';

export default function FeedbackDetailPage({ params }: { params: { todoId: string } }) {
  return <FeedbackDetailView todoId={params.todoId} />;
}
