import { createContext } from 'react';
import type { ThemeProviderState } from '@/lib/theme';

const initialState: ThemeProviderState = {
  theme: 'system',
  systemTheme: 'light',
  resolvedTheme: 'light',
  setTheme: () => null,
};

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);
