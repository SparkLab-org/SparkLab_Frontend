"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { QuestionSubject } from '@/src/lib/types/question';
import { useCreateQuestionMutation } from '@/src/hooks/questionQueries';

const SUBJECTS: QuestionSubject[] = ['국어', '수학', '영어'];

export default function QuestionForm() {
  const router = useRouter();
  const createQuestionMutation = useCreateQuestionMutation();
  const [subject, setSubject] = useState<QuestionSubject>('수학');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) return;
    createQuestionMutation.mutate(
      { title: trimmedTitle, subject, content: trimmedContent },
      {
        onSuccess: () => {
          router.push('/planner/question');
        },
      }
    );
  };

  return (
    <section className="space-y-4 rounded-3xl bg-neutral-100 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900">질문 작성</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-600">과목</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSubject(item)}
                className={[
                  'rounded-full px-3 py-1 text-xs font-semibold',
                  subject === item
                    ? 'bg-black text-white'
                    : 'bg-white text-neutral-600',
                ].join(' ')}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-600">질문 제목</label>
          <input
            placeholder="질문 제목을 입력해 주세요"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-600">질문 내용</label>
          <textarea
            placeholder="어떤 부분이 어려웠는지 적어주세요"
            rows={5}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full resize-none rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-600">자료 첨부</label>
          <input
            type="file"
            multiple
            className="w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-600"
          />
        </div>

        <button
          type="submit"
          disabled={createQuestionMutation.isPending || !title.trim() || !content.trim()}
          className={[
            'w-full rounded-2xl px-4 py-3 text-sm font-semibold',
            createQuestionMutation.isPending || !title.trim() || !content.trim()
              ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
              : 'bg-black text-white',
          ].join(' ')}
        >
          {createQuestionMutation.isPending ? '등록 중...' : '질문 등록'}
        </button>
      </form>
    </section>
  );
}
