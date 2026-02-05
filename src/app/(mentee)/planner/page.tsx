import GreetingCard from "@/src/components/task/greetingCard";
import WeeklyCalendar from "@/src/components/planner/WeeklyCalendar";
import TodayTodoSummary from "@/src/components/task/TodayTodoSummary";

export default function PlannerPage() {
  return (
    <div className="mx-auto max-w-md space-y-6 px-3 pb-16">
      <GreetingCard />
      <WeeklyCalendar />
      <TodayTodoSummary />
    </div>
  );
}
