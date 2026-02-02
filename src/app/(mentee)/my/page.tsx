export default function MyPage() {
  return (
    <div className="space-y-4">
      <section className="flex items-center gap-3 rounded-xl border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
        <div className="h-14 w-14 rounded-full bg-neutral-200" />
        <div>
          <p className="text-sm text-neutral-500">고등학교 2학년</p>
          <p className="text-lg font-semibold">김솔</p>
          <p className="text-xs text-neutral-500">수학 집중 과정 · 진행 40%</p>
        </div>
      </section>

      <section className="rounded-xl border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">이번 주 요약</p>
          <span className="text-xs text-neutral-500">완료 8/12</span>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-neutral-100 px-3 py-1">수학 5h</span>
          <span className="rounded-full bg-neutral-100 px-3 py-1">영어 3h</span>
          <span className="rounded-full bg-neutral-100 px-3 py-1">과학 2h</span>
        </div>
      </section>

      <button className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white">
        성장 받아보기
      </button>
    </div>
  );
}
