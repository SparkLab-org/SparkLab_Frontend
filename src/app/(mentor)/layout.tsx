import MentorSidebar from '@/src/components/mentor/layout/MentorSidebar';

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:px-6">
        <MentorSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
