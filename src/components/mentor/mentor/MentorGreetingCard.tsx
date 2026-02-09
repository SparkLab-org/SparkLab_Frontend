'use client';

type Props = {
  mentorName: string;
  dateLabel: string;
};

export default function MentorGreetingCard({ mentorName, dateLabel }: Props) {
  return (
    <header className="flex h-full flex-col justify-between gap-6 rounded-3xl bg-[#F5F5F5] p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Mentor Dashboard
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-neutral-900">
          환영합니다, {mentorName} 멘토님!
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          오늘도 멘티들의 학습을 응원해 주세요.
        </p>
      </div>
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <span className="rounded-full bg-neutral-100 px-3 py-1">{dateLabel}</span>
        <span className="rounded-full bg-neutral-100 px-3 py-1">이번 주 진행률 체크</span>
      </div>
    </header>
  );
}
