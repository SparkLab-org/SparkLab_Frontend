'use client';

import { ChevronRight } from 'lucide-react';

import type { MenteeCard } from '@/src/components/mentor/feedback/mentorFeedbackTypes';

type Props = {
  menteeCards: MenteeCard[];
  onSelectMentee: (id: string) => void;
};

export default function MentorFeedbackMenteeGrid({ menteeCards, onSelectMentee }: Props) {
  return (
    <div className="flex gap-6 overflow-x-auto pb-2">
      {menteeCards.map((mentee) => (
        <button
          key={mentee.id}
          type="button"
          onClick={() => onSelectMentee(mentee.id)}
          className="min-w-[260px] rounded-3xl bg-[#F5F5F5] p-4 text-left transition hover:bg-[#EFEFEF]"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-neutral-300" />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-neutral-900">{mentee.name}</p>
                  {mentee.feedbackRequests > 0 && (
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                  )}
                </div>
                <p className="text-xs text-neutral-400">
                  피드백 요청 | {mentee.feedbackRequests}개
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-neutral-400" />
          </div>

          <div className="mt-4 space-y-2 rounded-2xl bg-white px-4 py-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900">학습</span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">
                  {mentee.studySubject}
                </span>
              </div>
              <span className="text-neutral-400">{mentee.studyCount}개</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900">과제</span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">
                  {mentee.assignmentSubject}
                </span>
              </div>
              <span className="text-neutral-400">{mentee.assignmentCount}개</span>
            </div>
          </div>
        </button>
      ))}
      {menteeCards.length === 0 && (
        <div className="min-w-[260px] rounded-3xl bg-[#F5F5F5] px-4 py-6 text-sm text-neutral-500">
          등록된 멘티가 없습니다.
        </div>
      )}
    </div>
  );
}
