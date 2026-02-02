'use client';

import { useMemo } from 'react';

// 현재 날짜 계산 로직
function formatKoreanDate(d: Date) {
  const month = d.getMonth() + 1;
  const date = d.getDate();

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'] as const;
  const day = dayNames[d.getDay()];

  return `${month}월 ${date}일(${day})`;
}

export default function GreetingCard() {
  // 클라이언트에서만 현재 날짜 계산 (SSR/하이드레이션 이슈 방지)
  const todayText = useMemo(() => formatKoreanDate(new Date()), []);

  return (
    <section
      className="rounded-3xl p-5 shadow-sm ring-1 ring-neutral-100"
      style={{
        background:
          'linear-gradient(180deg, rgba(245, 245, 245, 0) 46.7%, #F5F5F5 100%)',
      }}
    >
      <div className="flex items-start justify-between">
        <p className="text-2xl font-semibold text-neutral-900">{todayText}</p>
      </div>

      <div className="mt-5 space-y-5">
        {/* iPhone에서 버튼과 문구가 겹치지 않게: 기본은 세로, sm부터 가로 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold leading-snug text-neutral-900 whitespace-pre-line">
            학습 중 어려웠던{'\n'}부분을 질문해보세요
          </p>

          {/* 버튼은 줄바꿈 금지 + 최소 폭 + shrink 방지 */}
          <button
            type="button"
            className="shrink-0 self-start rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white sm:self-auto"
          >
            질문하기
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-neutral-600">
          <button
            type="button"
            className="rounded-2xl bg-neutral-100 px-4 py-3 shadow-sm ring-1 ring-neutral-200"
          >
            계획표
          </button>
          <button
            type="button"
            className="rounded-2xl bg-neutral-100 px-4 py-3 shadow-sm ring-1 ring-neutral-200"
          >
            성취도
          </button>
        </div>
      </div>
    </section>
  );
}