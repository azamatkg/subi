import React from 'react';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';

export const NotFoundPage: React.FC = () => {
  useSetPageTitle('Страница не найдена');
  return (
    <div>
      <h1>404 - Page Not Found</h1>
    </div>
  );
};
