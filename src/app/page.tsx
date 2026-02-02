import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <section className="space-y-3 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-300">Seolstudy</p>
          <h1 className="text-2xl font-semibold leading-snug">고등학생을 위한 학습 코칭 MVP</h1>
          <p className="text-sm text-neutral-300">
            멘토는 계획을 고정하고, 멘티는 일일 플래너로 학습을 기록합니다.
            필요한 화면으로 바로 이동하세요.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] font-medium text-neutral-200">
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">모바일 멘티</span>
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">PC 멘토</span>
            <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">플래너·피드백·과제</span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/planner"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">멘티 플로우</p>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                모바일
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold">플래너 → 피드백 → 마이</h2>
            <p className="mt-2 text-sm text-neutral-300">할 일·공부시간 기록, 피드백 확인, 프로필 관리.</p>
            <div className="mt-4 flex gap-2 text-[12px] text-neutral-200">
              <span className="rounded-full bg-white/10 px-2 py-1">/planner</span>
              <span className="rounded-full bg-white/10 px-2 py-1">/feedback</span>
              <span className="rounded-full bg-white/10 px-2 py-1">/my</span>
            </div>
          </Link>

          <Link
            href="/mentees"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">멘토 대시보드</p>
              <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-[11px] font-semibold text-cyan-100">
                PC 우선
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold">멘티 목록 & 피드백 작성</h2>
            <p className="mt-2 text-sm text-neutral-300">최대 11명 멘티 관리, 하루 피드백 작성 진입.</p>
            <div className="mt-4 flex gap-2 text-[12px] text-neutral-200">
              <span className="rounded-full bg-white/10 px-2 py-1">/mentees</span>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
