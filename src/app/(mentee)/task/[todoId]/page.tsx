type Props = { params: { todoId: string } };

export default function TaskDetailPage({ params }: Props) {
  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <p className="text-xs text-neutral-500">할 일</p>
        <h1 className="text-xl font-semibold">수학 문제집 30p</h1>
        <p className="text-[11px] text-neutral-500">ID: {params.todoId}</p>
      </header>

      <section className="rounded-xl border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">학습지</p>
          <button className="rounded-full border px-3 py-1 text-xs font-medium">열기</button>
        </div>
        <div className="h-32 rounded-lg bg-neutral-100" />
      </section>

      <section className="rounded-xl border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">사진 업로드</p>
          <span className="text-[11px] text-neutral-500">카메라 / 앨범</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="aspect-[4/5] rounded-lg bg-neutral-100" />
          ))}
          <button className="aspect-[4/5] rounded-lg border border-dashed text-sm font-medium">
            +
          </button>
        </div>
      </section>

      <section className="rounded-xl border p-4 shadow-[0_6px_20px_rgba(0,0,0,0.04)] space-y-2">
        <p className="text-sm font-semibold">멘토 피드백</p>
        <p className="text-sm leading-6 text-neutral-800">
          풀이 순서를 더 명확히 적어봐요. 사진 잘 올라갔습니다!
        </p>
      </section>
    </div>
  );
}
