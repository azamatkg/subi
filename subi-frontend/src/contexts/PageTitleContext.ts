import { createContext } from 'react';

interface PageTitleContextType {
  title: string;
  setTitle: (title: string) => void;
}

export const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);
