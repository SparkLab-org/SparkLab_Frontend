export type TodoStatus = 'TODO' | 'DONE';
export type TodoSubject = '국어' | '영어' | '수학';
export type TodoType = '과제' | '학습';

export interface Todo {
  id: string;
  title: string;
  isFixed: boolean;      // 멘토 고정(멘티 수정 불가)
  status: TodoStatus;
  subject: TodoSubject;
  type: TodoType;
  feedback?: string | null;
  studyMinutes: number;  // 누적 분
  createdAt: number;
  dueDate: string;       // YYYY-MM-DD
  dueTime: string;       // HH:mm
}
