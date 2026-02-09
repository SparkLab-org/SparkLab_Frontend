import Link from 'next/link';
import { Bell } from 'lucide-react';

export default function NotificationEmpty() {
  return (
    <div className="rounded-3xl bg-[#F5F5F5] p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-600">
        <Bell className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-neutral-700">새로운 알림이 없어요</p>
      <p className="mt-2 text-xs text-neutral-400">
        오늘 할 일을 추가하면 알림이 여기에 표시돼요.
      </p>
      <Link
        href="/planner"
        className="mt-4 inline-flex items-center justify-center rounded-full bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-4 py-2 text-xs font-semibold text-white"
      >
        플래너로 이동
      </Link>
    </div>
  );
}
