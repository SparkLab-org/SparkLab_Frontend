'use client';

type Props = {
  feedback?: string | null;
};

export default function MentorFeedbackCard({ feedback }: Props) {
  const message =
    feedback && feedback.trim().length > 0
      ? feedback
      : '아직 피드백이 등록되지 않았습니다.';

  return (
    <section className="rounded-2xl bg-white p-4">
      <p className="text-lg font-semibold text-neutral-900">멘토 피드백</p>
      <p className="mt-3 text-sm text-neutral-700">{message}</p>
    </section>
  );
}
