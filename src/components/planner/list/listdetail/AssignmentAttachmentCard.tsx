'use client';

export default function AssignmentAttachmentCard() {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4">
      <p className="text-xs font-semibold text-neutral-500">과제 첨부</p>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-3 py-4">
        <p className="text-sm text-neutral-500">과제 완료 인증을 첨부해 주세요.</p>
        <button
          type="button"
          className="rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white"
        >
          첨부하기
        </button>
      </div>
    </section>
  );
}
