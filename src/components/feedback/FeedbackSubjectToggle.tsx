"use client";

import type { TodoSubject } from "@/src/lib/types/planner";

export type SubjectFilter = "전체" | TodoSubject;

type Props = {
  activeSubject: SubjectFilter;
  onChange: (subject: SubjectFilter) => void;
};

export default function FeedbackSubjectToggle({ activeSubject, onChange }: Props) {
  const subjects: SubjectFilter[] = ["전체", "국어", "영어", "수학"];

  return (
    <div className="flex items-center justify-center">
      <div className="rounded-full bg-neutral-100 p-1">
        <div className="flex items-center gap-1 text-xs font-semibold text-neutral-500">
          {subjects.map((item) => {
            const active = activeSubject === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onChange(item)}
                className={[
                  "rounded-full px-4 py-1.5 transition",
                  active
                    ? "bg-[linear-gradient(131deg,#1500FF_6.72%,#3D9DF3_100%)] text-white shadow-[0_8px_16px_rgba(21,0,255,0.2)]"
                    : "hover:text-neutral-800",
                ].join(" ")}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
