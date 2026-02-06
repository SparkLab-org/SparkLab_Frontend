export type QuestionStatus = '답변중' | '완료';
export type QuestionSubject = '국어' | '영어' | '수학' | '과학';

export type QuestionListItem = {
  id: string;
  title: string;
  excerpt: string;
  status: QuestionStatus;
};

export type QuestionDetail = {
  id: string;
  title: string;
  subject: QuestionSubject;
  status: QuestionStatus;
  content: string;
  answer: string;
};

export const questionList: QuestionListItem[] = [
  {
    id: 'q1',
    title: '벡터 내적이 왜 각도랑 관련이 있나요?',
    excerpt:
      '내적 공식이 cos이 들어가는지 이해가 잘 안돼요. 벡터를 곱할 때 의미가 뭔지, 각도와의 연결이 궁금해요.',
    status: '답변중',
  },
  {
    id: 'q2',
    title: '벡터 내적이 왜 각도랑 관련이 있나요?',
    excerpt:
      '내적 공식이 cos이 들어가는지 이해가 잘 안돼요. 벡터를 곱할 때 의미가 뭔지, 각도와의 연결이 궁금해요.',
    status: '완료',
  },
  {
    id: 'q3',
    title: '벡터 내적이 왜 각도랑 관련이 있나요?',
    excerpt:
      '내적 공식이 cos이 들어가는지 이해가 잘 안돼요. 벡터를 곱할 때 의미가 뭔지, 각도와의 연결이 궁금해요.',
    status: '완료',
  },
];

const questionDetails: QuestionDetail[] = [
  {
    id: 'q1',
    title: '벡터 내적이 왜 각도랑 관련이 있나요?',
    subject: '수학',
    status: '완료',
    content:
      '내적 공식이 cos이 들어가는지 이해가 잘 안돼요. 벡터를 곱할 때 의미가 뭔지, 각도와의 연결이 궁금해요.',
    answer:
      '내적은 두 벡터가 같은 방향으로 얼마나 “겹치는지”를 나타내요. 각도가 작을수록 겹침이 크고, cos 값이 커지기 때문에 내적 결과도 커집니다.',
  },
  {
    id: 'q2',
    title: '영어 지문 해석이 너무 오래 걸려요.',
    subject: '영어',
    status: '답변중',
    content:
      '문장 구조를 파악하는 데 시간이 많이 걸립니다. 시간을 줄일 수 있는 팁이 있을까요?',
    answer:
      '핵심 동사와 주어를 먼저 표시하고, 수식어는 뒤에 정리해보세요. 매일 2~3문장씩 구조 분석 연습을 꾸준히 하면 속도가 확실히 올라갑니다.',
  },
  {
    id: 'q3',
    title: '과학 요약을 어떻게 정리하면 좋을까요?',
    subject: '과학',
    status: '답변중',
    content:
      '요약을 해도 시험에 필요한 포인트가 잘 안 잡히는 것 같아요. 어떤 기준으로 정리해야 할까요?',
    answer:
      '핵심 개념 → 대표 예시 → 자주 나오는 비교 포인트 순으로 정리해보세요. 용어의 정의를 먼저 확실히 잡는 게 중요합니다.',
  },
];

export function getQuestionDetail(questionId: string): QuestionDetail {
  return questionDetails.find((item) => item.id === questionId) ?? questionDetails[0];
}
