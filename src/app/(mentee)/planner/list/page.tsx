import Link from 'next/link';
import TodoList from '@/src/components/task/TodoList';

export default function TodoListPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-3 pb-16">
      <header className="flex items-center justify-between">
        <Link
          href="/planner"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-sm text-neutral-600"
          aria-label="뒤로"
        >
          &lt;
        </Link>
      </header>
      <TodoList />
    </div>
  );
}
