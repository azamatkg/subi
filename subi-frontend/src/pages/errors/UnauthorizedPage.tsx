import React from 'react';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';

export const UnauthorizedPage: React.FC = () => {
  useSetPageTitle('Нет доступа');
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">UnauthorizedPage</h1>
      <p>Функциональность в разработке</p>
    </div>
  );
};
