import Link from 'next/link';

export default function MenteeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white">
      <header className="border-b px-4 py-3">
        <p className="text-sm text-neutral-500">오늘도 한 걸음씩</p>
        <h1 className="text-lg font-semibold">솔스터디 멘티</h1>
      </header>

      <main className="flex-1 px-4 py-4">{children}</main>

      <nav className="sticky bottom-0 border-t bg-white px-4 py-2">
        <div className="grid grid-cols-3 text-center text-sm font-medium">
          <Link href="/planner" className="py-2">플래너</Link>
          <Link href="/feedback" className="py-2">피드백</Link>
          <Link href="/my" className="py-2">마이</Link>
        </div>
      </nav>
    </div>
  );
}
