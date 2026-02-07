import TodoList from '@/src/components/planner/todo/TodoList';

export default function TodoListPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-3 pb-16">
      <TodoList filterMode="all" title="오늘의 할일" />
    </div>
  );
}
