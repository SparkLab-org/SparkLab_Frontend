export type ActiveLevel = 'NORMAL' | 'WARNING' | 'DANGER';

export interface Mentee {
  id: string;
  name: string;
  grade: string;
  track: string;
  progress: number; // 0-100
  subjects?: string[];
  weaknessType?: string;
  goalRate?: number;
  activeLevel?: ActiveLevel;
  today: {
    todo: string;
    status: 'TODO' | 'DONE';
    subject: string;
    duration: string;
  }[];
  feedback?: string;
}
