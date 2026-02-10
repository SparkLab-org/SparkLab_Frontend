import { Bell } from 'lucide-react';

export default function NotificationEmpty() {
  return (
    <div className="rounded-3xl bg-[#F5F5F5] p-6 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-600">
        <Bell className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-semibold text-neutral-700">새로운 알림이 없어요</p>
    </div>
  );
}
