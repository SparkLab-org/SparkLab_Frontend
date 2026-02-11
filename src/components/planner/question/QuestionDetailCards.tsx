import type { Question } from '@/src/lib/types/question';

type Props = {
  question: Question;
};

export default function QuestionDetailCards({ question }: Props) {
  const answerText =
    typeof question.answer === 'string' && question.answer.trim().length > 0
      ? question.answer
      : '아직 답변이 등록되지 않았어요.';

  return (
    <div className="space-y-6">
      <section className="space-y-3 rounded-3xl bg-neutral-100 p-5 ">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
            {question.subject}
          </span>
          <span>{question.status}</span>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">{question.title}</h2>
        <p className="text-sm leading-6 text-neutral-700">{question.content}</p>
        {question.attachmentUrl && (
          <a
            href={question.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            첨부 자료 보기
          </a>
        )}
      </section>

      <section className="space-y-3 rounded-3xl bg-neutral-100 p-5 ">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900">답변</p>
          <span className="text-[10px] text-neutral-400">멘토</span>
        </div>
        <p className="text-sm leading-6 text-neutral-800">{answerText}</p>
      </section>
    </div>
  );
}
