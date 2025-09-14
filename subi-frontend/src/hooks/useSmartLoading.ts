import { useEffect, useState } from 'react';

interface UseSmartLoadingOptions {
  /**
   * Minimum delay before showing loading state (in milliseconds)
   * Prevents flash for quick operations
   */
  minDelay?: number;

  /**
   * Minimum duration to show loading state (in milliseconds)
   * Prevents jarring immediate transitions
   */
  minDuration?: number;
}

/**
 * Smart loading hook that prevents loading flashes and provides smooth transitions
 */
export function useSmartLoading(
  isLoading: boolean,
  options: UseSmartLoadingOptions = {}
) {
  const { minDelay = 200, minDuration = 500 } = options;

  const [showLoading, setShowLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    let delayTimeout: NodeJS.Timeout;
    let durationTimeout: NodeJS.Timeout;

    if (isLoading) {
      // Start timer to track loading duration
      const startTime = Date.now();
      setLoadingStartTime(startTime);

      // Show loading after minimum delay
      delayTimeout = setTimeout(() => {
        if (isLoading) {
          setShowLoading(true);
        }
      }, minDelay);

    } else if (loadingStartTime && showLoading) {
      // Calculate how long loading was shown
      const elapsed = Date.now() - loadingStartTime;

      if (elapsed < minDuration) {
        // Keep showing loading for minimum duration
        durationTimeout = setTimeout(() => {
          setShowLoading(false);
          setLoadingStartTime(null);
        }, minDuration - elapsed);
      } else {
        // Can hide immediately
        setShowLoading(false);
        setLoadingStartTime(null);
      }
    }

    return () => {
      clearTimeout(delayTimeout);
      clearTimeout(durationTimeout);
    };
  }, [isLoading, minDelay, minDuration, loadingStartTime, showLoading]);

  return showLoading;
}

/**
 * Hook for progressive loading states with smooth transitions
 */
export function useProgressiveLoading<T>(
  data: T | undefined,
  isLoading: boolean,
  options: UseSmartLoadingOptions & {
    /**
     * Enable fade-in transition for content
     */
    enableFadeIn?: boolean;
  } = {}
) {
  const { enableFadeIn = true } = options;
  const showLoading = useSmartLoading(isLoading, options);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading && data) {
      if (enableFadeIn) {
        // Small delay for smooth transition
        const timeout = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timeout);
      } else {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [isLoading, data, enableFadeIn]);

  return {
    showLoading,
    isVisible,
    hasData: Boolean(data),
    shouldShowContent: !showLoading && data && isVisible,
  };
}

/**
 * Hook for managing staggered loading animations
 */
export function useStaggeredLoading(
  items: unknown[] | undefined,
  isLoading: boolean,
  staggerDelay = 100
) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isLoading && items?.length) {
      setVisibleCount(0);

      // Stagger the appearance of items
      const timeouts: NodeJS.Timeout[] = [];

      for (let i = 0; i < items.length; i++) {
        const timeout = setTimeout(() => {
          setVisibleCount(prev => prev + 1);
        }, i * staggerDelay);

        timeouts.push(timeout);
      }

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [isLoading, items?.length, staggerDelay]);

  return visibleCount;
}