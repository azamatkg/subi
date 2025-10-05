import React, { useEffect, useState } from 'react';
import type { LayoutMode, LayoutProviderProps } from '@/lib/layout';
import {
  getStoredLayout,
  setStoredLayout,
  applyLayout,
} from '@/lib/layout';
import { LayoutProviderContext } from '@/contexts/LayoutContext';

export function LayoutProvider({
  children,
  defaultLayout = 'boxed',
  storageKey = 'asubk-layout',
  ...props
}: LayoutProviderProps) {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(defaultLayout);
  const [mounted, setMounted] = useState(false);

  const setLayoutMode = (newMode: LayoutMode) => {
    setLayoutModeState(newMode);
    setStoredLayout(storageKey, newMode);

    // Apply layout immediately
    applyLayout(newMode);
  };

  useEffect(() => {
    // Initialize layout from storage
    const storedLayout = getStoredLayout(storageKey);

    setLayoutModeState(storedLayout);

    // Apply initial layout
    applyLayout(storedLayout);

    setMounted(true);
  }, [storageKey]);

  // Apply layout when it changes
  useEffect(() => {
    if (mounted) {
      applyLayout(layoutMode);
    }
  }, [layoutMode, mounted]);

  const value = {
    layoutMode,
    setLayoutMode,
  };

  // Prevent flash during SSR/hydration
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <LayoutProviderContext.Provider {...props} value={value}>
      {children}
    </LayoutProviderContext.Provider>
  );
}
