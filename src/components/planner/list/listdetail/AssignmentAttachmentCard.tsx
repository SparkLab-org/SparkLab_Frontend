'use client';

import { useRef, useState, type ChangeEvent } from 'react';

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0B';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

type Props = {
  guideFileName?: string | null;
  guideFileUrl?: string | null;
};

export default function AssignmentAttachmentCard({ guideFileName, guideFileUrl }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const hasGuide = Boolean(guideFileUrl);

  const handlePickFiles = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length > 0) {
      setFiles(picked);
    }
    event.target.value = '';
  };

  return (
    <section className="space-y-4 rounded-2xl bg-[#F5F5F5] p-4">
      <div>
        <p className="text-xs font-semibold text-neutral-500">과제 첨부</p>
        <div className="mt-3 rounded-xl bg-white px-3 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-neutral-500">
              {files.length > 0
                ? `첨부된 파일 ${files.length}개`
                : '과제 완료 인증을 첨부해 주세요.'}
            </p>
            <button
              type="button"
              onClick={handlePickFiles}
              className="shrink-0 rounded-lg bg-neutral-900 px-3 py-2 text-xs font-semibold text-white"
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
      </div>

      <div>
        <p className="text-xs font-semibold text-neutral-500">멘토 학습지도</p>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-4">
          <p className="text-sm text-neutral-500">
            {hasGuide ? guideFileName : '등록된 학습지가 없어요.'}
          </p>
          {hasGuide ? (
            <a
              href={guideFileUrl ?? undefined}
              download
              className="shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700"
            >
              다운로드
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="shrink-0 cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-xs font-semibold text-neutral-400"
            >
              다운로드
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </section>
  );
}
