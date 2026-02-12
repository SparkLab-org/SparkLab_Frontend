'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { Download } from 'lucide-react';

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0B';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

type Props = {
  guideFileName?: string | null;
  guideFileUrl?: string | null;
  mode?: 'full' | 'guide-only';
};

export default function AssignmentAttachmentCard({
  guideFileName,
  guideFileUrl,
  mode = 'full',
}: Props) {
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

  if (mode === 'guide-only') {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] ring-1 ring-neutral-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-500">멘토 학습지</p>
            <p className="mt-1 text-[11px] text-neutral-500 break-keep">
              {hasGuide ? guideFileName : '등록된 학습지가 없어요.'}
            </p>
          </div>
          {hasGuide && (
            <a
              href={guideFileUrl ?? undefined}
              download
              className="shrink-0 rounded-full border border-neutral-200 bg-white p-2 text-neutral-700 shadow-sm transition hover:-translate-y-0.5"
              aria-label="학습지 다운로드"
            >
              <Download className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl bg-[#F5F5F5] p-4">
      <div>
        <p className="text-lg font-semibold text-neutral-900">과제 첨부</p>
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
              className="shrink-0 rounded-lg bg-[#004DFF] px-3 py-2 text-xs font-semibold text-white"
            >
              첨부하기
            </button>
          </div>

          {files.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-neutral-500">
              {files.map((file) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="flex justify-between gap-2"
                >
                  <span className="truncate text-neutral-700">{file.name}</span>
                  <span className="shrink-0">{formatFileSize(file.size)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <p className="text-lg font-semibold text-neutral-900">멘토 학습지</p>
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
