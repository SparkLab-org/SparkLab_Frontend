'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';

import { useTodosQuery } from '@/src/hooks/todoQueries';
import { useMenteeMyPageQuery } from '@/src/hooks/mypageQueries';
import { useAuthStore } from '@/src/store/authStore';
import MyAccountActions from './MyAccountActions';
import MyAchievementCard from './MyAchievementCard';
import MyHeader from './MyHeader';
import MyHelpButton from './MyHelpButton';
import MyProfileCard from './MyProfileCard';
import MenteeLevelInfoModal from './MenteeLevelInfoModal';

export default function MyPageView() {
  const logout = useAuthStore((s) => s.logout);
  const { data: todos = [] } = useTodosQuery();
  const { data: myPage } = useMenteeMyPageQuery();
  const [accountId, setAccountId] = useState('OOO');
  const [activeLevel, setActiveLevel] = useState<'NORMAL' | 'WARNING' | 'DANGER'>('NORMAL');
  const [isLevelInfoOpen, setIsLevelInfoOpen] = useState(false);

  const { monthPercent, monthDoneCount, monthTotalCount } = useMemo(() => {
    if (typeof myPage?.totalTodoCount === 'number') {
      const totalCount = myPage.totalTodoCount;
      const doneCount =
        typeof myPage.completedTodoCount === 'number' ? myPage.completedTodoCount : 0;
      const apiPercent =
        typeof myPage.achievementRate === 'number'
          ? myPage.achievementRate <= 1
            ? Math.round(myPage.achievementRate * 100)
            : Math.round(myPage.achievementRate)
          : totalCount > 0
          ? Math.round((doneCount / totalCount) * 100)
          : 0;
      return { monthPercent: apiPercent, monthDoneCount: doneCount, monthTotalCount: totalCount };
    }
    const monthKey = format(new Date(), 'yyyy-MM');
    const monthTodos = todos.filter((todo) => todo.dueDate?.startsWith(monthKey));
    const doneCount = monthTodos.filter((todo) => todo.status === 'DONE').length;
    const totalCount = monthTodos.length;
    const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    return { monthPercent: percent, monthDoneCount: doneCount, monthTotalCount: totalCount };
  }, [todos, myPage?.totalTodoCount, myPage?.completedTodoCount, myPage?.achievementRate]);

  const totalStudySeconds = useMemo(
    () =>
      todos.reduce(
        (sum, todo) => sum + (typeof todo.studySeconds === 'number' ? todo.studySeconds : 0),
        0
      ),
    [todos]
  );

  const handleHelp = () => {
    window.alert('준비중이에요.');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('accountId');
    if (stored && stored.trim().length > 0) {
      setAccountId(stored);
    }
    const storedLevel = window.localStorage.getItem('menteeActiveLevel');
    if (storedLevel === 'WARNING' || storedLevel === 'DANGER' || storedLevel === 'NORMAL') {
      setActiveLevel(storedLevel);
    }
  }, []);

  const displayAccountId = myPage?.accountId ?? accountId;
  const displayActiveLevel = myPage?.activeLevel ?? activeLevel;

  return (
    <div className="mx-auto max-w-md space-y-5 pb-16">
      <MyHeader />
      <MyProfileCard
        name={displayAccountId}
        roleLabel="멘티"
        totalStudySeconds={totalStudySeconds}
        activeLevel={displayActiveLevel}
        onOpenLevelInfo={() => setIsLevelInfoOpen(true)}
      />
      <MyAchievementCard
        monthPercent={monthPercent}
        monthDoneCount={monthDoneCount}
        monthTotalCount={monthTotalCount}
      />
      <MyAccountActions onLogout={logout} />
      <MyHelpButton onClick={handleHelp} />
      {isLevelInfoOpen && <MenteeLevelInfoModal onClose={() => setIsLevelInfoOpen(false)} />}
    </div>
  );
}
