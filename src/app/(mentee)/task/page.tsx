import TodoList from "@/src/components/task/TodoList";
import GreetingCard from "@/src/components/task/greetingCard";
import WeeklyCalendar from "@/src/components/planner/WeeklyCalendar";

export default function TaskPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 px-3 pb-16">
      <GreetingCard />
      <WeeklyCalendar />
      <TodoList />
    </div>
  );
}
