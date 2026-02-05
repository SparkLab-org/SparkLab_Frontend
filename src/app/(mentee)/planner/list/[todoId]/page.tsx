import ListDetailView from '@/src/components/planner/list/listdetail/ListDetailView';

export default function TaskDetailPage({ params }: { params: Promise<{ todoId: string }> }) {
  return <ListDetailView params={params} />;
}
