import FeedbackDetailView from '@/src/components/feedback/detail/FeedbackDetailView';

export default function MentorFeedbackDetailPage({ params }: { params: { todoId: string } }) {
  return (
    <div className="min-h-[calc(100vh-120px)] w-full">
      <FeedbackDetailView todoId={params.todoId} role="mentor" />
    </div>
  );
}
