'use client';

import { useRef, useState, type ChangeEvent } from 'react';

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0B';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

type Props = {
  onSubmit: (comment: string, files: File[]) => void;
  disabled?: boolean;
};

export default function AssignmentSubmissionCard({ onSubmit, disabled = false }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handlePickFiles = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length > 0) {
      setFiles(picked);
      setError('');
    }
    event.target.value = '';
  };

  const handleSubmit = () => {
    if (files.length === 0) {
      setError('제출하려면 파일을 최소 1개 첨부해 주세요.');
      return;
    }
    if (disabled) return;
    onSubmit(comment.trim(), files);
  };

  return (
    <section className="rounded-2xl bg-[#F5F5F5] p-4">
      <p className="text-lg font-semibold text-neutral-900">과제 제출</p>
      <p className="mt-1 text-xs text-neutral-500">사진 또는 PDF를 첨부하고 멘토에게 코멘트를 남겨보세요.</p>

      <div className="mt-3 rounded-xl bg-white px-3 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-neutral-500">
            {files.length > 0
              ? `첨부된 파일 ${files.length}개`
              : '제출할 파일을 첨부해 주세요.'}
          </p>
          <button
            type="button"
            onClick={handlePickFiles}
            disabled={disabled}
            className={[
              'shrink-0 rounded-lg px-3 py-2 text-xs font-semibold',
              disabled
                ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
                : 'bg-neutral-900 text-white',
            ].join(' ')}
          >
            첨부하기
          </button>
        </div>

        {files.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs text-neutral-500">
            {files.map((file) => (
              <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex justify-between gap-2">
                <span className="truncate text-neutral-700">{file.name}</span>
                <span className="shrink-0">{formatFileSize(file.size)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-3 rounded-xl bg-white px-3 py-3">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="멘토에게 전달할 코멘트를 입력하세요."
          className="h-24 w-full resize-none text-sm text-neutral-800 outline-none"
        />
      </div>

      {error && <p className="mt-2 text-xs font-semibold text-rose-500">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className={[
            'rounded-full px-4 py-2 text-xs font-semibold',
            disabled
              ? 'cursor-not-allowed bg-neutral-200 text-neutral-400'
              : 'bg-neutral-900 text-white',
          ].join(' ')}
        >
          제출하기
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </section>
  );
}
