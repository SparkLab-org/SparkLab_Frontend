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

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const isMentor = comment.role === 'mentor';
        const isOwner = currentRole && currentRole === comment.role;
        const isEditing = editingId === comment.id;
        return (
          <div
            key={comment.id}
            className={[
              'rounded-2xl px-4 py-3',
              isMentor ? 'bg-[#F5F5F5]' : 'bg-[#F5F5F5]',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-neutral-500">
                {isMentor ? '멘토 답변' : '멘티 질문'}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-neutral-400">
                  {formatTimestamp(comment.createdAt)}
                </p>
                {isOwner && (onEditStart || onDelete) && !isEditing && (
                  <div className="flex items-center gap-1 text-[11px]">
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
                  </div>
                )}
              </div>
            </div>
            {isEditing ? (
              <div className="mt-2 space-y-2">
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
              <p className="mt-2 text-sm text-neutral-800">{comment.content}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
