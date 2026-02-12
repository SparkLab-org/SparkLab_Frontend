'use client';

type Props = {
  title: string;
  subtitle?: string;
};

export default function FeedbackDetailHeader({ title, subtitle }: Props) {
  return (
    <header className="space-y-2">
      <div>
        <p className="text-sm font-semibold text-neutral-500">피드백 상세</p>
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
      </div>
      {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
    </header>
  );
}
