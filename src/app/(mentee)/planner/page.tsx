import Link from "next/link";
import bellIcon from "@/src/assets/icons/bell.svg";
import GreetingCard from "@/src/components/planner/landing/greetingCard";
import PlannerMonthlyPrefetch from "@/src/components/planner/landing/PlannerMonthlyPrefetch";
import WeeklyCalendar from "@/src/components/planner/landing/WeeklyCalendar";
import TodayTodoSummary from "@/src/components/planner/landing/TodayTodoSummary";
import YesterdayFeedbackSummary from "@/src/components/planner/landing/YesterdayFeedbackSummary";
import DailyPlanCommentCard from "@/src/components/planner/landing/DailyPlanCommentCard";

export default function PlannerPage() {
  return (
    <div className="mx-auto max-w-md space-y-3.5 px-3 pb-16">
      <PlannerMonthlyPrefetch />
      <div className="flex justify-end">
        <Link
          href="/planner/notifications"
          aria-label="알림"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 transition hover:text-neutral-900"
        >
          {typeof bellIcon === "string" ? (
            <img className="h-5 w-5" src={bellIcon} alt="" aria-hidden />
          ) : (
            <img className="h-5 w-5" src={bellIcon?.src} alt="" aria-hidden />
          )}
        </Link>
      </div>
      <GreetingCard />
      <WeeklyCalendar />
      <TodayTodoSummary />
      <YesterdayFeedbackSummary />
    </div>
  );
}
