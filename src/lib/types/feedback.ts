export type Feedback = {
  id: string;
  mentorId?: number;
  menteeId?: number;
  todoItemId?: number;
  targetDate?: string;
  isImportant?: boolean;
  summary?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FeedbackDraftRequest = {
  subject?: 'KOREAN' | 'ENGLISH' | 'MATH' | 'ALL';
  weaknessType?: string;
  sections?: Array<
    'GREETING' | 'COACHING' | 'STUDY_TIP' | 'SUBJECT_TIP' | 'WEAKNESS_ADVICE' | 'PRAISE'
  >;
};

export type FeedbackDraftResponse = {
  draftText?: string;
  sections?: Array<
    'GREETING' | 'COACHING' | 'STUDY_TIP' | 'SUBJECT_TIP' | 'WEAKNESS_ADVICE' | 'PRAISE'
  >;
};
