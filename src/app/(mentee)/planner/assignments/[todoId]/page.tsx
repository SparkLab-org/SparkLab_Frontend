import { use } from 'react';
import AssignmentDetailView from '@/src/components/planner/assignments/AssignmentDetailView';

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ todoId: string }>;
}) {
  const { todoId } = use(params);
  return <AssignmentDetailView todoId={todoId} />;
}
