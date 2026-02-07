'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';

import { useTodosQuery } from '@/src/hooks/todoQueries';
import { useAuthStore } from '@/src/store/authStore';
import MyAccountActions from './MyAccountActions';
import MyAchievementCard, { type MyAchievementTab } from './MyAchievementCard';
import MyHeader from './MyHeader';
import MyHelpButton from './MyHelpButton';
import MyProfileCard from './MyProfileCard';
import MySettingsList from './MySettingsList';

export default function MyPageView() {
  const logout = useAuthStore((s) => s.logout);
  const { data: todos = [] } = useTodosQuery();
  const [activeTab, setActiveTab] = useState<MyAchievementTab>('routine');
  const [accountId, setAccountId] = useState('OOO');
  const [activeLevel, setActiveLevel] = useState<'NORMAL' | 'WARNING' | 'DANGER'>('NORMAL');

  const { monthPercent, monthDoneCount, monthTotalCount } = useMemo(() => {
    const monthKey = format(new Date(), 'yyyy-MM');
    const monthTodos = todos.filter((todo) => todo.dueDate?.startsWith(monthKey));
    const doneCount = monthTodos.filter((todo) => todo.status === 'DONE').length;
    const totalCount = monthTodos.length;
    const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    return { monthPercent: percent, monthDoneCount: doneCount, monthTotalCount: totalCount };
  }, [todos]);

  const totalStudySeconds = useMemo(
    () =>
      todos.reduce(
        (sum, todo) => sum + (typeof todo.studySeconds === 'number' ? todo.studySeconds : 0),
        0
      ),
    [todos]
  );

  const handleWithdraw = () => {
    window.alert('준비중이에요.');
  };

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

  return (
    <div className="mx-auto max-w-md space-y-5 pb-16">
      <MyHeader />
      <MyProfileCard
        name={accountId}
        roleLabel="멘티"
        totalStudySeconds={totalStudySeconds}
        activeLevel={activeLevel}
      />
      <MyAchievementCard
        monthPercent={monthPercent}
        monthDoneCount={monthDoneCount}
        monthTotalCount={monthTotalCount}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />
      <MySettingsList />
      <MyAccountActions onLogout={logout} onWithdraw={handleWithdraw} />
      <MyHelpButton onClick={handleHelp} />
    </div>
  );
}
