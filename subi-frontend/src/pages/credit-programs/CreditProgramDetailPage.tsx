import React from 'react';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';

export const CreditProgramDetailPage: React.FC = () => {
  useSetPageTitle('Детали программы');
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">CreditProgramDetailPage</h1>
      <p>Функциональность в разработке</p>
    </div>
  );
};
