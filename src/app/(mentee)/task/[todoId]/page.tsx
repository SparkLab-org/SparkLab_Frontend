export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ todoId: string }>;
}) {
  const { todoId } = await params;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">과제 상세</h2>
      <p className="text-sm text-neutral-600">todoId: {todoId}</p>

      <section className="rounded-xl border p-4">
        <p className="text-xs text-neutral-500">학습지</p>
        <p className="mt-1 text-sm">여기에 학습지 이미지/PDF 링크가 들어갑니다.</p>
      </section>

      <section className="rounded-xl border p-4">
        <p className="text-xs text-neutral-500">사진 업로드</p>
        <input type="file" accept="image/*" className="mt-2 block text-sm" />
      </section>

      <section className="rounded-xl border p-4">
        <p className="text-xs text-neutral-500">멘토 피드백</p>
        <p className="mt-1 text-sm text-neutral-700">아직 피드백이 없습니다.</p>
      </section>
    </div>
  );
}