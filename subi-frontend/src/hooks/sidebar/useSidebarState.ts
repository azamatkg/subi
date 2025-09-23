import { useEffect, useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setSidebarOpen } from '@/store/slices/uiSlice';

export const useSidebarState = () => {
  const sidebarOpen = useAppSelector(state => state.ui.sidebarOpen);
  const dispatch = useAppDispatch();
  const [isMobile, setIsMobile] = useState(false);
  const previousMobileRef = useRef(false);

  // Initial mobile setup - runs only once
  useEffect(() => {
    const isMobileView = window.innerWidth < 1024;
    setIsMobile(isMobileView);
    previousMobileRef.current = isMobileView;

    // Auto-close on initial load if mobile
    if (isMobileView) {
      dispatch(setSidebarOpen(false));
    }
  }, [dispatch]); // Only depends on dispatch - runs once

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => {
      const wasMobile = previousMobileRef.current;
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);
      previousMobileRef.current = isMobileView;

      // Auto-close sidebar only when transitioning from desktop to mobile
      if (!wasMobile && isMobileView && sidebarOpen) {
        dispatch(setSidebarOpen(false));
      }
    };

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [dispatch, sidebarOpen]); // This can depend on sidebarOpen since it only runs on resize

  const toggleSidebar = () => {
    dispatch(setSidebarOpen(!sidebarOpen));
  };

  const closeSidebar = () => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  return {
    sidebarOpen,
    isMobile,
    toggleSidebar,
    closeSidebar,
  };
};
