import TodoList from "@/src/components/planner/TodoList";

export default function PlannerPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <section className="rounded-2xl bg-neutral-200 p-5 text-neutral-900">
        <p className="text-xs text-neutral-600">멘토 코멘트</p>
        <p className="mt-1 text-base font-semibold">오늘은 수학 집중! 질문 남겨주세요.</p>
      </section>

      <div className="lg:col-span-2">
        <TodoList />
      </div>
    </div>
  );
}
