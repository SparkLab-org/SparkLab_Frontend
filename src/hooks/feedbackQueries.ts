import { useQuery } from '@tanstack/react-query';
import { listFeedbacks } from '@/src/services/feedback.api';

export const feedbackQueryKeys = {
  all: ['feedbacks'] as const,
};

export function useFeedbacksQuery(params?: {
  menteeId?: number;
  mentorId?: number;
  todoItemId?: number;
}) {
  return useQuery({
    queryKey: feedbackQueryKeys.all,
    queryFn: () => listFeedbacks(params),
  });
}
