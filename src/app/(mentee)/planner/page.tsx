export default function PlannerPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
        <p className="text-xs text-neutral-500">멘토 코멘트</p>
        <p className="mt-1 text-base font-semibold">오늘은 수학 집중! 질문 남겨주세요.</p>
      </section>

      <section className="rounded-xl border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] space-y-3">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-500">오늘의 할 일</p>
            <h2 className="text-lg font-semibold">2월 1일 (일)</h2>
          </div>
          <button className="rounded-full border px-3 py-1 text-xs font-medium">날짜</button>
        </header>

        <div className="space-y-2">
          {[
            { title: '멘토 · 수학 문제집 30p', locked: true, time: '40분' },
            { title: '멘토 · 영어 단어 2회독', locked: true, time: '30분' },
            { title: '내가 추가 · 과학 요약', locked: false, time: '20분' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-[11px] text-neutral-500">공부시간 {item.time}</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {item.locked ? (
                  <span className="rounded-full bg-neutral-100 px-2 py-1 text-neutral-500">고정</span>
                ) : (
                  <button className="rounded-full bg-neutral-900 px-3 py-1 text-white">추가</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="w-full rounded-lg border border-dashed px-3 py-2 text-sm font-medium">
          + 할 일 추가
        </button>
      </section>
    </div>
  );
}
