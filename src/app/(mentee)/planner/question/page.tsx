import Link from 'next/link';

const questions = [
  {
    id: 'q1',
    title: '벡터 내적이 왜 각도랑 관련이 있나요?',
    excerpt:
      '내적 공식이 cos이 들어가는지 이해가 잘 안돼요. 벡터를 곱할 때 의미가 뭔지, 각도와의 연결이 궁금해요.',
    status: '답변중',
  },
  {
    id: 'q2',
    title: '벡터 내적이 왜 각도랑 관련이 있나요?',
    excerpt:
      '내적 공식이 cos이 들어가는지 이해가 잘 안돼요. 벡터를 곱할 때 의미가 뭔지, 각도와의 연결이 궁금해요.',
    status: '완료',
  },
  {
    id: 'q3',
    title: '벡터 내적이 왜 각도랑 관련이 있나요?',
    excerpt:
      '내적 공식이 cos이 들어가는지 이해가 잘 안돼요. 벡터를 곱할 때 의미가 뭔지, 각도와의 연결이 궁금해요.',
    status: '완료',
  },
];

export default function QuestionPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="flex items-center justify-between text-xs font-semibold text-neutral-500">
        <span>플래너 · 질문</span>
      </header>

      <section className="space-y-4 rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <Link
            href="/planner"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600"
            aria-label="뒤로"
          >
            &lt;
          </Link>
          <span>질문</span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="max-w-[75%] rounded-2xl bg-neutral-100 px-4 py-3 text-sm text-neutral-800">
            ㅇㅇㅇ 질문에 답변이 왔어요
          </div>
          <span className="text-[10px] text-neutral-400">13:16</span>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-800">질문 목록</p>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 text-[11px] font-semibold text-white"
          >
            최신순
            <span className="text-[10px]">⌄</span>
          </button>
        </div>

        <div className="grid gap-3">
          {questions.map((q) => (
            <article
              key={q.id}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-neutral-900">{q.title}</p>
                <span
                  className={[
                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    q.status === '답변중'
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-500',
                  ].join(' ')}
                >
                  {q.status}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-neutral-500">
                {q.excerpt}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
