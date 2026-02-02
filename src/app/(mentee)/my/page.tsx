export default function MyPage() {
  return (
    <div className="space-y-5">
      <section className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="h-16 w-16 rounded-full bg-neutral-200" />
        <div>
          <p className="text-sm text-neutral-500">고등학교 2학년</p>
          <p className="text-xl font-semibold">김솔</p>
          <p className="text-xs text-neutral-500">수학 집중 과정 · 진행 40%</p>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">이번 주 요약</p>
          <span className="text-xs text-neutral-500">완료 8/12</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-neutral-100 px-3 py-1">수학 5h</span>
          <span className="rounded-full bg-neutral-100 px-3 py-1">영어 3h</span>
          <span className="rounded-full bg-neutral-100 px-3 py-1">과학 2h</span>
        </div>
      </section>

      <button className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5">
        성장 받아보기
      </button>
    </div>
  );
}
