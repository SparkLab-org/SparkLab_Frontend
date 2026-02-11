'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  return format(new Date(value), 'M월d일');
}

export default function MenteeQuestionPanel({ menteeId }: Props) {
  const { data: questions = [] } = useQuestionsQuery();
  const mentees = useMentorStore((s) => s.mentees);
  const replyMutation = useCreateQuestionReplyMutation();

  const mentee = useMemo(
    () => mentees.find((item) => item.id === menteeId) ?? null,
    [mentees, menteeId]
  );
  const menteeNameMap = useMemo(
    () => new Map(mentees.map((item) => [String(item.id), item.name])),
    [mentees]
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

  const [manualQuestionId, setManualQuestionId] = useState<string | null>(null);

  const resolvedQuestionId = useMemo(() => {
    if (manualQuestionId && menteeQuestions.some((q) => q.id === manualQuestionId)) {
      return manualQuestionId;
    }
    return menteeQuestions[0]?.id ?? null;
  }, [manualQuestionId, menteeQuestions]);

  const selectedQuestion = useMemo(
    () => menteeQuestions.find((q) => q.id === resolvedQuestionId) ?? null,
    [menteeQuestions, resolvedQuestionId]
  );

  const pendingCount = useMemo(
    () => menteeQuestions.filter((q) => !q.answer || q.answer.trim().length === 0).length,
    [menteeQuestions]
  );

  const getMenteeLabel = (q: Question) => {
    if (q.menteeId === undefined || q.menteeId === null) return '멘티';
    const resolved = menteeNameMap.get(String(q.menteeId));
    return resolved ?? `계정 ${q.menteeId}`;
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl bg-[#F6F8FA] p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold text-neutral-900">멘티 질문</h2>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
                <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden />
                {pendingCount}건
              </span>
            )}
          </div>
        </div>
        <span />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="space-y-2 overflow-y-auto rounded-2xl bg-white p-3 shadow-sm">
          {menteeQuestions.map((q) => {
            const needsReply = !q.answer || q.answer.trim().length === 0;
            return (
            <button
              key={q.id}
              type="button"
              onClick={() => setManualQuestionId(q.id)}
              className={[
                'w-full rounded-2xl px-3 py-3 text-left text-xs transition',
                q.id === resolvedQuestionId
                  ? 'bg-[#D5EBFF]/60 text-neutral-900'
                  : 'bg-white text-neutral-600 hover:bg-[#F6F8FA]',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold text-neutral-900">
                  {q.title || '질문'}
                </span>
                {needsReply && (
                  <span className="h-2 w-2 rounded-full bg-rose-500" aria-label="답변 필요" />
                )}
              </div>
              <p className="mt-1 truncate text-[11px] text-neutral-500">
                {getMenteeLabel(q)} · {formatDate(q.createdAt)}
              </p>
            </button>
          )})}
          {menteeQuestions.length === 0 && (
            <div className="rounded-2xl bg-neutral-100 px-4 py-6 text-center text-xs text-neutral-400">
              등록된 질문이 없습니다.
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          {!selectedQuestion && (
            <div className="rounded-2xl bg-neutral-100 px-4 py-6 text-center text-xs text-neutral-400">
              질문을 선택해 주세요.
            </div>
          )}

          {selectedQuestion && (
            <>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span className="rounded-full bg-[#D5EBFF] px-2 py-0.5 text-[10px] font-semibold text-[#3D9DF3]">
                    {selectedQuestion.subject}
                  </span>
                  <span className="text-neutral-400">
                    {getMenteeLabel(selectedQuestion)} · {formatDate(selectedQuestion.createdAt)}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {selectedQuestion.title}
                </h3>
                <div className="space-y-3 rounded-2xl bg-[#F6F8FA] p-4">
                  <div className="flex">
                    <div className="max-w-[85%] rounded-2xl bg-white px-4 py-3 text-sm text-neutral-800 shadow-sm">
                      <p className="mb-1 text-[11px] font-semibold text-neutral-500">
                        {getMenteeLabel(selectedQuestion)}
                      </p>
                      <p className="leading-6 text-neutral-800">
                        {selectedQuestion.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl bg-[#D5EBFF] px-4 py-3 text-sm text-neutral-900">
                      <p className="mb-1 text-[11px] font-semibold text-neutral-600">멘토</p>
                      {selectedQuestion.answer ? (
                        <p className="leading-6 text-neutral-800">
                          {selectedQuestion.answer}
                        </p>
                      ) : (
                        <p className="text-xs text-neutral-500">
                          아직 답변이 등록되지 않았습니다.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <ReplyEditor
                key={selectedQuestion.id}
                questionId={selectedQuestion.id}
                replyMutation={replyMutation}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplyEditor({
  questionId,
  replyMutation,
}: {
  questionId: string;
  replyMutation: ReturnType<typeof useCreateQuestionReplyMutation>;
}) {
  const [replyText, setReplyText] = useState('');
  const replyRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = replyRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const next = el.scrollHeight;
    el.style.height = `${next}px`;
  }, [replyText]);

  const handleSubmit = async () => {
    const content = replyText.trim();
    if (!content) return;
    await replyMutation.mutateAsync({ questionId, content });
    setReplyText('');
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-neutral-600">답변 작성</label>
      <textarea
        ref={replyRef}
        value={replyText}
        onChange={(event) => setReplyText(event.target.value)}
        rows={4}
        className="w-full resize-none overflow-hidden rounded-2xl border border-neutral-200 px-3 py-2 text-sm outline-none transition-[height] duration-200 ease-out focus:border-neutral-400"
        placeholder="멘티 질문에 대한 답변을 입력해 주세요."
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={replyMutation.isPending || replyText.trim().length === 0}
          className="rounded-full bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {replyMutation.isPending ? '등록 중...' : '답변 등록'}
        </button>
      </div>
    </div>
  );
}
