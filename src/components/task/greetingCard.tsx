'use client';

import Link from 'next/link';
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
    <section>
      <div className="flex items-start justify-between">
        <p className="text-2xl font-semibold text-neutral-900">{todayText}</p>
      </div>

      <div className="mt-5 space-y-5">
        {/* iPhone에서 버튼과 문구가 겹치지 않게: 기본은 세로, sm부터 가로 */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xl font-semibold leading-snug text-neutral-900 whitespace-pre-line">
            학습 중 어려웠던{'\n'}부분을 질문해보세요
          </p>

          {/* 버튼은 줄바꿈 금지 + 최소 폭 + shrink 방지 */}
          <Link
            href="planner/question"
            className="shrink-0 self-start rounded-2xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white sm:self-auto"
          >
            질문하기
          </Link>
        </div>
      </div>
    </section>
  );
}
