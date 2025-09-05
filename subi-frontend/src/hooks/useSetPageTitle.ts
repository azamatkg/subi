import { useContext, useEffect } from 'react';
import { PageTitleContext } from '@/contexts/PageTitleContext.ts';

export const usePageTitle = () => {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error('usePageTitle must be used within a PageTitleProvider');
  }
  return context;
};

export const useSetPageTitle = (title: string) => {
  const { setTitle } = usePageTitle();
  
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
};