'use client';

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
                'relative h-12 w-12 rounded-full',
                isActive ? 'bg-[#004DFF]' : 'bg-neutral-300',
              ].join(' ')}
            >
              {mentee.feedbackRequests > 0 && (
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-rose-400" />
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
