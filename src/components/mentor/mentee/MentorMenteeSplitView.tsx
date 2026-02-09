'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Maximize2 } from 'lucide-react';

import { useMentorStore } from '@/src/store/mentorStore';
import MenteeDetailView from '@/src/components/mentor/mentee/MenteeDetailView';
import MenteeListView from '@/src/components/mentor/mentee/MenteeListView';

export default function MentorMenteeSplitView() {
  const router = useRouter();
  const selectedId = useMentorStore((s) => s.selectedId);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) return undefined;
    if (typeof window === 'undefined') return undefined;
    const media = window.matchMedia('(min-width: 1024px)');
    if (media.matches) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleChange = () => {
      if (media.matches) {
        document.body.style.overflow = previous;
        setIsDrawerOpen(false);
      }
    };
    media.addEventListener('change', handleChange);
    return () => {
      media.removeEventListener('change', handleChange);
      document.body.style.overflow = previous;
    };
  }, [isDrawerOpen]);

  return (
    <>
      <div
        className="min-w-0 min-h-[calc(100vh-120px)]"
        onClick={() => {
          if (isDrawerOpen) setIsDrawerOpen(false);
        }}
      >
        <MenteeListView onSelect={() => setIsDrawerOpen(true)} />
      </div>

      <div className="fixed inset-0 z-50 pointer-events-none">
        <div
          className={[
            'absolute inset-0 transition-opacity duration-300',
            isDrawerOpen ? 'opacity-100' : 'opacity-0',
            'pointer-events-auto lg:pointer-events-none',
          ].join(' ')}
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden
        />
        <div
          role="dialog"
          aria-modal="true"
          className={[
            'absolute right-0 top-0 h-full w-full bg-white shadow-2xl transition-transform duration-300 pointer-events-auto lg:w-1/2',
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 text-sm text-neutral-500">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="text-base font-semibold text-neutral-500 hover:text-neutral-900"
                aria-label="패널 닫기"
              >
                &gt;
              </button>
              <button
                type="button"
                className="text-neutral-500 hover:text-neutral-900"
                aria-label="전체 화면으로 보기"
                onClick={() => {
                  if (!selectedId) return;
                  router.push(`/mentor/mentee/${selectedId}`);
                }}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
            <div />
          </div>
          <div className="h-[calc(100%-48px)] overflow-y-auto p-4">
            <MenteeDetailView menteeId={selectedId} showBackLink={false} />
          </div>
        </div>
      </div>
    </>
  );
}
