import { createContext } from 'react';
import type { LayoutProviderState } from '@/lib/layout';

const initialState: LayoutProviderState = {
  layoutMode: 'boxed',
  setLayoutMode: () => null,
};

export const LayoutProviderContext =
  createContext<LayoutProviderState>(initialState);
