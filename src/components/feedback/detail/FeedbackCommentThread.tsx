'use client';

type Comment = {
  id: string;
  role: 'mentee' | 'mentor';
  content: string;
  createdAt: number;
};

type Props = {
  comments: Comment[];
};

const timestampFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function formatTimestamp(value: number) {
  if (!Number.isFinite(value)) return '';
  const parts = timestampFormatter.formatToParts(new Date(value));
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${lookup.year}.${lookup.month}.${lookup.day} ${lookup.hour}:${lookup.minute}`;
}

export default function FeedbackCommentThread({ comments }: Props) {
  if (comments.length === 0) {
    return (
      <div className="rounded-2xl bg-[#F5F5F5] p-4 text-sm text-neutral-500">
        아직 질문이 없습니다. 질문을 남겨보세요.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const isMentor = comment.role === 'mentor';
        return (
          <div
            key={comment.id}
            className={[
              'rounded-2xl px-4 py-3',
              isMentor ? 'bg-[#F5F5F5]' : 'bg-[#F5F5F5]',
            ].join(' ')}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-neutral-500">
                {isMentor ? '멘토 답변' : '멘티 질문'}
              </p>
              <p className="text-[11px] text-neutral-400">{formatTimestamp(comment.createdAt)}</p>
            </div>
            <p className="mt-2 text-sm text-neutral-800">{comment.content}</p>
          </div>
        );
      })}
    </div>
  );
}
