import TodoList from "@/src/components/task/TodoList";

export default function PlannerPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-3 pb-16">
      {/* 주간/월간 토글 */}
      <div className="flex items-center justify-between pt-1 text-sm text-neutral-700">
        <button aria-label="뒤로" className="rounded-full px-2 py-1 text-neutral-600">
          ←
        </button>
        <div className="inline-flex rounded-full bg-neutral-200 p-1 text-xs font-semibold">
          <button className="rounded-full bg-black px-5 py-2 text-white">주간</button>
          <button className="rounded-full px-5 py-2 text-neutral-600">월간</button>
        </div>
        <button aria-label="앞으로" className="rounded-full px-2 py-1 text-neutral-600">
          →
        </button>
      </div>

      {/* 날짜 셀렉터 */}
      <section
        className="rounded-3xl p-5 shadow-sm ring-1 ring-neutral-100"
        style={{
          background: 'linear-gradient(180deg, rgba(245, 245, 245, 0) 46.7%, #F5F5F5 100%)',
        }}
      >
        <div className="flex items-center justify-between text-sm font-semibold text-neutral-900">
          <span>2월 3일(화)</span>
          <div className="flex items-center gap-3 text-neutral-500">
            <button aria-label="이전 주" className="px-2">
              ←
            </button>
            <button aria-label="다음 주" className="px-2">
              →
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs text-neutral-400">
          {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm font-semibold">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const isSelected = day === 3;
            return (
              <div
                key={day}
                className={[
                  'relative flex h-10 items-center justify-center rounded-full',
                  isSelected ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-800',
                ].join(' ')}
              >
                {day}
                <div className="absolute -bottom-2 flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 학습 목록 */}
      <section className="space-y-3">
        <p className="text-sm font-semibold text-neutral-900">학습 목록</p>
        <div className="space-y-4">
          {[
            { subject: '국어', total: '1:50:36', rest: '0:41:01', active: true },
            { subject: '수학', total: '1:10:12', rest: '0:20:00', active: false },
          ].map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl p-5 shadow-sm ring-1 ring-neutral-100"
              style={{
                background:
                  'linear-gradient(180deg, rgba(245, 245, 245, 0) 46.7%, #F5F5F5 100%)',
              }}
            >
              <div className="flex items-center justify-between text-sm font-semibold text-neutral-900">
                <div className="flex items-center gap-2">
                  <span>{item.subject}</span>
                  <span
                    className={[
                      'h-2 w-2 rounded-full',
                      item.active ? 'bg-emerald-400' : 'bg-fuchsia-400',
                    ].join(' ')}
                    aria-hidden
                  />
                </div>
                <button className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
                  자세히 보기
                </button>
              </div>

              <p className="mt-3 text-3xl font-semibold text-neutral-900">2:31:37</p>

              <div className="mt-2 flex items-center justify-end gap-4 text-[11px] text-neutral-500">
                <div>
                  <p>Total time</p>
                  <p className="text-neutral-900">{item.total}</p>
                </div>
                <div>
                  <p>Rest time</p>
                  <p className="text-neutral-900">{item.rest}</p>
                </div>
              </div>

              <button className="mt-4 block w-full rounded-full bg-black px-4 py-3 text-center text-sm font-semibold text-white">
                피드백
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
