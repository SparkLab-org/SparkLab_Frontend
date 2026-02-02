export default function FeedbackPage() {
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-500">어제 피드백</p>
          <h2 className="text-lg font-semibold">1월 31일 (토)</h2>
        </div>
        <button className="rounded-full border px-3 py-1 text-xs font-medium">날짜</button>
      </header>

      <section className="rounded-xl border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">멘토 피드백</p>
          <span className="text-[11px] text-neutral-500">멘토 김OO</span>
        </div>
        <p className="text-sm leading-6 text-neutral-800">
          오늘 수학 풀이 과정이 깔끔했어요. 영어 단어는 발음까지 확인해보면 더 좋아요.
        </p>
      </section>

      <section className="rounded-xl border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">주간 계획</p>
          <button className="text-xs font-medium underline">월간 펼치기</button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
            <div key={d} className="rounded-lg border px-2 py-2">
              <p className="font-semibold">{d}</p>
              <p className="mt-1 text-[11px] text-neutral-500">완료 2/3</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
