import TodoList from "@/src/components/planner/TodoList";

export default function PlannerPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
        <p className="text-xs text-neutral-500">멘토 코멘트</p>
        <p className="mt-1 text-base font-semibold">오늘은 수학 집중! 질문 남겨주세요.</p>
      </section>

      <TodoList />
    </div>
  );
}