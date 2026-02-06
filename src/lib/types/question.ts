export type QuestionStatus = '답변중' | '완료';
export type QuestionSubject = '국어' | '영어' | '수학';

export type Question = {
  id: string;
  title: string;
  subject: QuestionSubject;
  status: QuestionStatus;
  content: string;
  answer?: string | null;
  createdAt: number;
  updatedAt?: number;
};
