'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';

import { useMentorStore } from '@/src/store/mentorStore';
import { useCreateQuestionReplyMutation, useQuestionsQuery } from '@/src/hooks/questionQueries';
import type { Question } from '@/src/lib/types/question';
import { resolveNumericId } from '@/src/components/mentor/feedback/mentorFeedbackUtils';

type Props = {
  menteeId?: string | null;
};

function formatDate(value?: number) {
  if (!value) return '';
  return format(new Date(value), 'yyyy-MM-dd');
}

export default function MenteeQuestionPanel({ menteeId }: Props) {
  const { data: questions = [] } = useQuestionsQuery();
  const mentees = useMentorStore((s) => s.mentees);
  const replyMutation = useCreateQuestionReplyMutation();

  const mentee = useMemo(
    () => mentees.find((item) => item.id === menteeId) ?? null,
    [mentees, menteeId]
  );
  const resolvedMenteeId = useMemo(() => resolveNumericId(menteeId), [menteeId]);

  const hasMenteeMapping = useMemo(
    () => questions.some((q) => q.menteeId !== undefined && q.menteeId !== null),
    [questions]
  );

  const menteeQuestions = useMemo<Question[]>(() => {
    if (!menteeId) return questions;
    if (!hasMenteeMapping) return questions;
    return questions.filter((q) => {
      if (q.menteeId === undefined || q.menteeId === null) return false;
      if (resolvedMenteeId !== undefined) {
        return String(q.menteeId) === String(resolvedMenteeId);
      }
      return String(q.menteeId) === String(menteeId);
    });
  }, [questions, menteeId, hasMenteeMapping, resolvedMenteeId]);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (menteeQuestions.length === 0) {
      setSelectedQuestionId(null);
      return;
    }
    setSelectedQuestionId((prev) => {
      if (prev && menteeQuestions.some((q) => q.id === prev)) return prev;
      return menteeQuestions[0].id;
    });
  }, [menteeQuestions]);

  const selectedQuestion = useMemo(
    () => menteeQuestions.find((q) => q.id === selectedQuestionId) ?? null,
    [menteeQuestions, selectedQuestionId]
  );

  useEffect(() => {
    setReplyText('');
  }, [selectedQuestionId]);

  const handleSubmit = async () => {
    if (!selectedQuestion) return;
    const content = replyText.trim();
    if (!content) return;
    await replyMutation.mutateAsync({ questionId: selectedQuestion.id, content });
    setReplyText('');
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">멘티 질문</h2>
          <p className="text-xs text-neutral-500">
            {mentee?.name ? `${mentee.name}님의 질문` : '질문 목록'}
          </p>
        </div>
        <span className="text-xs text-neutral-400">
          {menteeQuestions.length}건
        </span>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-2 overflow-y-auto rounded-2xl bg-white p-3">
          {menteeQuestions.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setSelectedQuestionId(q.id)}
              className={[
                'w-full rounded-2xl px-3 py-3 text-left text-xs transition',
                q.id === selectedQuestionId
                  ? 'bg-[#F6F8FA] text-neutral-900'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold text-neutral-900">
                  {q.title || '질문'}
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-500">
                  {q.status}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-neutral-400">
                {formatDate(q.createdAt)}
              </p>
            </button>
          ))}
          {menteeQuestions.length === 0 && (
            <div className="rounded-2xl bg-neutral-100 px-4 py-6 text-center text-xs text-neutral-400">
              등록된 질문이 없습니다.
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl bg-white p-4">
          {!selectedQuestion && (
            <div className="rounded-2xl bg-neutral-100 px-4 py-6 text-center text-xs text-neutral-400">
              질문을 선택해 주세요.
            </div>
          )}

          {selectedQuestion && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="rounded-full bg-black px-2 py-0.5 text-[10px] font-semibold text-white">
                    {selectedQuestion.subject}
                  </span>
                  <span>{selectedQuestion.status}</span>
                </div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {selectedQuestion.title}
                </h3>
                <p className="text-sm leading-6 text-neutral-700">
                  {selectedQuestion.content}
                </p>
              </div>

              <div className="space-y-2 rounded-2xl bg-[#F6F8FA] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-neutral-900">멘토 답변</p>
                  <span className="text-[10px] text-neutral-400">멘토</span>
                </div>
                {selectedQuestion.answer ? (
                  <p className="text-sm leading-6 text-neutral-800">
                    {selectedQuestion.answer}
                  </p>
                ) : (
                  <p className="text-xs text-neutral-400">
                    아직 답변이 등록되지 않았습니다.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-600">
                  답변 작성
                </label>
                <textarea
                  value={replyText}
                  onChange={(event) => setReplyText(event.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
                  placeholder="멘티 질문에 대한 답변을 입력해 주세요."
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={replyMutation.isPending || replyText.trim().length === 0}
                    className="rounded-full bg-[#004DFF] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {replyMutation.isPending ? '등록 중...' : '답변 등록'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
