import React from 'react';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';

export const TestPage: React.FC = () => {
  useSetPageTitle('Тестовая страница');

  return (
    <div className='p-6'>
      <h2 className='text-2xl font-bold mb-4'>Тестовая страница</h2>
      <p>Это тестовая страница для проверки отображения заголовка в хедере.</p>
    </div>
  );
};
