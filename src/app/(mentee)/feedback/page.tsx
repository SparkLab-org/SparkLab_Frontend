export default function FeedbackPage() {
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-neutral-500">어제 피드백</p>
          <h2 className="text-xl font-semibold">1월 31일 (토)</h2>
        </div>
        <button className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:border-neutral-500">
          날짜
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">멘토 피드백</p>
            <span className="text-[11px] text-neutral-500">멘토 김OO</span>
          </div>
          <p className="text-sm leading-6 text-neutral-800">
            오늘 수학 풀이 과정이 깔끔했어요. 영어 단어는 발음까지 확인해보면 더 좋아요.
          </p>
        </section>

        <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">주간 계획</p>
            <button className="text-xs font-semibold text-neutral-600 underline">월간 펼치기</button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs sm:grid-cols-4">
            {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
              <div key={d} className="rounded-xl border border-neutral-200 bg-neutral-50 px-2 py-2">
                <p className="font-semibold">{d}</p>
                <p className="mt-1 text-[11px] text-neutral-500">완료 2/3</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
