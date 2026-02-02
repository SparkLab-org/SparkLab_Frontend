export default function TaskPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-neutral-200 px-4 py-4 text-neutral-900">
        <p className="text-xs text-neutral-600">과제 요약</p>
        <h2 className="mt-1 text-lg font-semibold">오늘 할 과제들을 확인하세요.</h2>
        <p className="mt-2 text-sm text-neutral-700">
          플래너에서 추가한 투두를 눌러 세부 과제로 이동할 수 있어요.
        </p>
      </section>

      <section className="space-y-3 rounded-2xl bg-neutral-100 px-4 py-4 text-sm text-neutral-800">
        <p className="text-xs font-semibold text-neutral-600">빠른 링크</p>
        <ul className="space-y-2">
          <li className="rounded-xl bg-white px-3 py-2 text-neutral-900 shadow-sm">
            최근 추가된 과제는 플래너에서 선택해 상세로 이동하세요.
          </li>
          <li className="rounded-xl bg-white px-3 py-2 text-neutral-900 shadow-sm">
            과제 업로드는 각 과제 상세 화면에서 가능합니다.
          </li>
        </ul>
      </section>
    </div>
  );
}
