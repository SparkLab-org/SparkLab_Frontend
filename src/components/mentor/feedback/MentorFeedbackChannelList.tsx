'use client';

import { User } from 'lucide-react';
import type { MenteeCard } from '@/src/components/mentor/feedback/mentorFeedbackTypes';

type Props = {
  menteeCards: MenteeCard[];
  activeMenteeId: string;
  onSelectMentee: (id: string) => void;
};

export default function MentorFeedbackChannelList({
  menteeCards,
  activeMenteeId,
  onSelectMentee,
}: Props) {
  return (
    <aside className="flex flex-col items-center gap-3">
      {menteeCards.map((mentee) => {
        const isActive = mentee.id === activeMenteeId;
        return (
          <button
            key={mentee.id}
            type="button"
            onClick={() => onSelectMentee(mentee.id)}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={[
                'relative flex h-12 w-12 items-center justify-center rounded-full',
                isActive ? 'bg-[#004DFF]' : 'bg-neutral-300',
              ].join(' ')}
            >
              <User
                className={[
                  'h-6 w-6',
                  isActive ? 'text-white' : 'text-neutral-500',
                ].join(' ')}
                fill="currentColor"
                stroke="none"
                aria-hidden
              />
              {mentee.feedbackRequests > 0 && (
                <span className="absolute right-0 top-0 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {mentee.feedbackRequests}
                </span>
              )}
            </div>
            <span
              className={[
                'text-[10px] font-semibold',
                isActive ? 'text-neutral-900' : 'text-neutral-400',
              ].join(' ')}
            >
              {mentee.name}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
