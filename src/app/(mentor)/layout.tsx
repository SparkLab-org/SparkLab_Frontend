export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto w-full max-w-6xl px-6 py-6">
        {children}
      </div>
    </div>
  );
}