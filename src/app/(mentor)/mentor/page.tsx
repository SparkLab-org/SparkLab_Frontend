'use client';

import { useMemo, useState } from 'react';
import { MenteeList } from '@/src/components/mentor/MenteeList';
import { MenteeDetail } from '@/src/components/mentor/MenteeDetail';
import type { Mentee } from '@/src/components/mentor/types';

const sampleMentees: Mentee[] = [
  {
    id: 'm1',
    name: '김솔',
    grade: '고2',
    track: '수학 집중 과정',
    progress: 72,
    today: [
      { todo: '수학 문제집 30p', status: 'DONE', subject: '수학', duration: '1:10:36' },
      { todo: '영어 단어 2회독', status: 'TODO', subject: '영어', duration: '0:40:00' },
    ],
    feedback: '수학 풀이 과정이 좋아졌어요. 영어는 발음까지 연습하기!',
  },
  {
    id: 'm2',
    name: '이하늘',
    grade: '고1',
    track: '영어 리딩 강화',
    progress: 58,
    today: [
      { todo: '영어 지문 3개 해석', status: 'DONE', subject: '영어', duration: '0:55:00' },
      { todo: '단어 테스트', status: 'DONE', subject: '영어', duration: '0:20:00' },
    ],
  },
  {
    id: 'm3',
    name: '박민재',
    grade: '고3',
    track: '과학탐구 심화',
    progress: 44,
    today: [
      { todo: '화학 요약 2p', status: 'TODO', subject: '화학', duration: '0:25:00' },
      { todo: '물리 계산 연습', status: 'TODO', subject: '물리', duration: '0:30:00' },
    ],
  },
];

export default function MentorPage() {
  const [mentees, setMentees] = useState<Mentee[]>(sampleMentees);
  const [selectedId, setSelectedId] = useState<string>(sampleMentees[0]?.id ?? '');

  const selected = useMemo(
    () => mentees.find((m) => m.id === selectedId) ?? mentees[0],
    [mentees, selectedId]
  );

  const handleSaveFeedback = (id: string, text: string) => {
    setMentees((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback: text } : m))
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <MenteeList mentees={mentees} selectedId={selected?.id ?? ''} onSelect={setSelectedId} />
      {selected && <MenteeDetail mentee={selected} onSaveFeedback={handleSaveFeedback} />}
    </div>
  );
}
