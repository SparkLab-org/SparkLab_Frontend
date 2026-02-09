'use client';

type Props = {
  label: string;
  value: string;
  description?: string;
};

export default function MentorStatCard({ label, value, description }: Props) {
  return (
    <section className="rounded-3xl bg-[#F5F5F5] p-5">
      <p className="text-sm font-semibold text-neutral-500 lg:text-lg">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-neutral-900">{value}</p>
      {description && <p className="mt-2 text-xs text-neutral-400">{description}</p>}
    </section>
  );
}
