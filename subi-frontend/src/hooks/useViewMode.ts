import { useState, useEffect } from 'react';
import { getStoredViewMode, setStoredViewMode } from '@/utils/auth';

export type ViewMode = 'table' | 'card';

export const useViewMode = () => {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    return getStoredViewMode() || 'card';
  });
  const [isMobile, setIsMobile] = useState(false);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    setStoredViewMode(mode);
  };

  // Mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (isMobileView && viewMode === 'table') {
        setViewModeState('card');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);

  return {
    viewMode,
    setViewMode,
    isMobile,
  };
};
