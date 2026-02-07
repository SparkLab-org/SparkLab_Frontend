'use client';

type Props = {
  onClose: () => void;
};

export default function MenteeLevelInfoModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
        aria-label="모달 닫기"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-neutral-900">멘티 레벨 기준</p>
            <p className="mt-1 text-sm text-neutral-500">
              레벨은 기본적으로 정상으로 시작하며 멘토가 조정할 수 있어요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-sm text-neutral-500 hover:text-neutral-900"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-neutral-700">
          <div className="rounded-2xl bg-emerald-50 px-4 py-3">
            <p className="font-semibold text-emerald-700">정상 (Normal)</p>
            <p className="mt-1 text-xs text-emerald-700/80">
              첫 멘티 매칭 시 기본 레벨이며, 과제 미제출 문제가 없을 때 유지됩니다.
            </p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3">
            <p className="font-semibold text-amber-700">주의 (Warning)</p>
            <p className="mt-1 text-xs text-amber-700/80">
              과제 2회 연속 미제출 시 정상에서 자동 전환됩니다.
            </p>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-3">
            <p className="font-semibold text-rose-700">위험 (Danger)</p>
            <p className="mt-1 text-xs text-rose-700/80">
              과제 3회 연속 미제출 시 자동 전환됩니다.
            </p>
          </div>
          <div className="rounded-2xl bg-neutral-50 px-4 py-3 text-xs text-neutral-500">
            멘토는 학습시간 부족, 약점 개선 지연 등의 사유로 레벨을 수동 조정할 수 있습니다.
            기본 레벨은 정상이며 레벨이 비어있는 경우는 없습니다.
          </div>
        </div>
      </div>
    </div>
  );
}
