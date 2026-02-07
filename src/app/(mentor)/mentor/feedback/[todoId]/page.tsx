import FeedbackDetailView from '@/src/components/feedback/detail/FeedbackDetailView';

export default function MentorFeedbackDetailPage({ params }: { params: { todoId: string } }) {
  return <FeedbackDetailView todoId={params.todoId} role="mentor" />;
}
