'use client';

type Comment = {
  id: string;
  role: 'mentee' | 'mentor';
  content: string;
  createdAt: number;
};

type Props = {
  comments: Comment[];
  currentRole?: 'mentee' | 'mentor';
  editingId?: string | null;
  editingValue?: string;
  onEditingChange?: (value: string) => void;
  onEditStart?: (comment: Comment) => void;
  onEditCancel?: () => void;
  onEditSave?: (id: string) => void;
  onDelete?: (id: string) => void;
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

export default function FeedbackCommentThread({
  comments,
  currentRole,
  editingId,
  editingValue,
  onEditingChange,
  onEditStart,
  onEditCancel,
  onEditSave,
  onDelete,
}: Props) {
  if (comments.length === 0) {
    return (
      <div className="rounded-2xl bg-[#F5F5F5] p-4 text-sm text-neutral-500">
        아직 질문이 없습니다. 질문을 남겨보세요.
      </div>
    );
  }

  const orderedComments = [...comments].sort(
    (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)
  );

  return (
    <div className="space-y-3">
      {orderedComments.map((comment) => {
        const isMentor = comment.role === 'mentor';
        const isOwner = currentRole && currentRole === comment.role;
        const isEditing = editingId === comment.id;
        return (
          <div
            key={comment.id}
            className={`flex ${isMentor ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={[
                'max-w-[82%] space-y-1',
                isMentor ? 'items-end text-right' : 'items-start text-left',
              ].join(' ')}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
                <span className="font-semibold text-neutral-500">
                  {isMentor ? '멘토 답변' : '멘티 질문'}
                </span>
                {isOwner && (onEditStart || onDelete) && !isEditing && (
                  <span className="flex items-center gap-1">
                    {onEditStart && (
                      <button
                        type="button"
                        onClick={() => onEditStart(comment)}
                        className="text-neutral-500 hover:text-neutral-900"
                      >
                        수정
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(comment.id)}
                        className="text-rose-500 hover:text-rose-600"
                      >
                        삭제
                      </button>
                    )}
                  </span>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editingValue ?? ''}
                    onChange={(event) => onEditingChange?.(event.target.value)}
                    className="h-20 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 outline-none"
                  />
                  <div className="flex justify-end gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={onEditCancel}
                      className="rounded-lg border border-neutral-200 px-2 py-1 text-neutral-500"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditSave?.(comment.id)}
                      className="rounded-lg bg-neutral-900 px-2 py-1 text-white"
                    >
                      저장
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={[
                    'rounded-2xl px-4 py-3 text-sm',
                    isMentor
                      ? 'bg-[#E8F3FF] text-neutral-900'
                      : 'bg-[#F5F5F5] text-neutral-900',
                  ].join(' ')}
                >
                  <p className="whitespace-pre-line">{comment.content}</p>
                  <div className="mt-1 flex justify-end text-[10px] text-neutral-400">
                    {formatTimestamp(comment.createdAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
