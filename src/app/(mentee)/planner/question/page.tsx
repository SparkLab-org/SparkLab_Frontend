import QuestionAlertCard from '@/src/components/question/QuestionAlertCard';
import QuestionList from '@/src/components/question/QuestionList';
import { questionList } from '@/src/components/question/data';

export default function QuestionPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <QuestionAlertCard />
      <QuestionList items={questionList} />
    </div>
  );
}
