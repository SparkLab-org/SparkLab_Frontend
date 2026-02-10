type Props = {
  message?: string;
  time?: string;
};

export default function QuestionAlertCard({
  message,
  time = '13:16',
}: Props) {
  if (!message) return null;
  return (
    <section className="space-y-4 rounded-3xl bg-neutral-100 p-5 ">
      <div className="flex items-end justify-between gap-3">
        <div className="max-w-[75%] rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-800">
          {message}
        </div>
        <span className="text-[10px] text-neutral-400">{time}</span>
      </div>
    </section>
  );
}
