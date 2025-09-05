import React, { useState, ReactNode, useCallback } from 'react';
import { PageTitleContext } from './PageTitleContext';

export const PageTitleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [title, setTitle] = useState('');

  const setTitleStable = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  return (
    <PageTitleContext.Provider value={{ title, setTitle: setTitleStable }}>
      {children}
    </PageTitleContext.Provider>
  );
};