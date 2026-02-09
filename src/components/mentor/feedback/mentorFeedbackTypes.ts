export type FeedbackTypeFilter = '전체' | '학습' | '과제';

export type MenteeCard = {
  id: string;
  name: string;
  grade?: string;
  feedbackRequests: number;
  studyCount: number;
  studySubject: string;
  assignmentCount: number;
  assignmentSubject: string;
};
