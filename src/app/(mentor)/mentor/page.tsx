'use client';

import { useMemo } from 'react';
import { MenteeList } from '@/src/components/mentor/MenteeList';
import { MenteeDetail } from '@/src/components/mentor/MenteeDetail';
import { useMentorStore } from '@/src/store/mentorStore';

export default function MentorPage() {
  const mentees = useMentorStore((s) => s.mentees);
  const selectedId = useMentorStore((s) => s.selectedId);
  const setSelectedId = useMentorStore((s) => s.setSelectedId);
  const updateFeedback = useMentorStore((s) => s.updateFeedback);

  const selected = useMemo(
    () => mentees.find((m) => m.id === selectedId) ?? mentees[0],
    [mentees, selectedId]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <MenteeList mentees={mentees} selectedId={selected?.id ?? ''} onSelect={setSelectedId} />
      {selected && (
        <MenteeDetail mentee={selected} onSaveFeedback={(id, text) => updateFeedback(id, text)} />
      )}
    </div>
  );
}
