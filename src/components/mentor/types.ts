export interface Mentee {
  id: string;
  name: string;
  grade: string;
  track: string;
  progress: number; // 0-100
  today: {
    todo: string;
    status: 'TODO' | 'DONE';
    subject: string;
    duration: string;
  }[];
  feedback?: string;
}
