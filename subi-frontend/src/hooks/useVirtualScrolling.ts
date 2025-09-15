import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface VirtualScrollingConfig {
  /**
   * Default height for items (used for estimation)
   */
  itemHeight: number;
  /**
   * Number of items to render outside the visible area for smoother scrolling
   */
  overscan?: number;
  /**
   * Threshold for enabling virtual scrolling (number of items)
   */
  threshold?: number;
  /**
   * Container height - if not provided, will be calculated from container element
   */
  containerHeight?: number;
  /**
   * Whether to enable dynamic height calculation
   */
  enableDynamicHeight?: boolean;
  /**
   * Scroll debounce delay in milliseconds
   */
  scrollDebounceMs?: number;
}

export interface VirtualScrollingResult {
  /**
   * Ref to attach to the scrollable container
   */
  containerRef: React.RefCallback<HTMLElement>;
  /**
   * Ref to attach to the total height placeholder
   */
  totalHeightRef: React.RefCallback<HTMLElement>;
  /**
   * Array of visible items with their virtual properties
   */
  virtualItems: VirtualItem[];
  /**
   * Total height of all items
   */
  totalHeight: number;
  /**
   * Current scroll offset
   */
  scrollOffset: number;
  /**
   * Whether virtual scrolling is active
   */
  isVirtual: boolean;
  /**
   * Scroll to specific index
   */
  scrollToIndex: (index: number, alignment?: 'start' | 'center' | 'end') => void;
  /**
   * Measure item height (for dynamic heights)
   */
  measureItem: (index: number, height: number) => void;
}

export interface VirtualItem {
  /**
   * Original index in the data array
   */
  index: number;
  /**
   * Top position in pixels from the start
   */
  offsetTop: number;
  /**
   * Height of the item in pixels
   */
  height: number;
  /**
   * Whether this item is visible in the viewport
   */
  isVisible: boolean;
}

const DEFAULT_CONFIG: Required<VirtualScrollingConfig> = {
  itemHeight: 50,
  overscan: 5,
  threshold: 100,
  containerHeight: 400,
  enableDynamicHeight: false,
  scrollDebounceMs: 16, // ~60fps
};

/**
 * Custom hook for virtual scrolling optimization
 * Provides efficient rendering of large lists by only rendering visible items
 */
export function useVirtualScrolling<T>(
  items: T[],
  config: VirtualScrollingConfig
): VirtualScrollingResult {
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const {
    itemHeight,
    overscan,
    threshold,
    containerHeight: defaultContainerHeight,
    enableDynamicHeight,
    scrollDebounceMs,
  } = mergedConfig;

  // State
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(defaultContainerHeight);
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());

  // Refs
  const containerRef = useRef<HTMLElement | null>(null);
  const totalHeightRef = useRef<HTMLElement | null>(null);
  const scrollTimeoutRef = useRef<number>();
  const rafRef = useRef<number>();
  const isScrollingRef = useRef(false);

  // Determine if virtual scrolling should be active
  const isVirtual = items.length >= threshold;

  // Calculate item positions and heights
  const itemMetrics = useMemo(() => {
    const metrics: VirtualItem[] = [];
    let offset = 0;

    for (let i = 0; i < items.length; i++) {
      const height = enableDynamicHeight
        ? (itemHeights.get(i) || itemHeight)
        : itemHeight;

      metrics.push({
        index: i,
        offsetTop: offset,
        height,
        isVisible: false, // Will be calculated later
      });

      offset += height;
    }

    return metrics;
  }, [items.length, itemHeight, itemHeights, enableDynamicHeight]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return itemMetrics.length > 0
      ? itemMetrics[itemMetrics.length - 1].offsetTop + itemMetrics[itemMetrics.length - 1].height
      : 0;
  }, [itemMetrics]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (!isVirtual) {
      return { start: 0, end: items.length };
    }

    let startIndex = 0;
    let endIndex = items.length;

    // Binary search for start index
    let left = 0;
    let right = itemMetrics.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const item = itemMetrics[mid];

      if (item.offsetTop + item.height >= scrollOffset) {
        startIndex = mid;
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    // Binary search for end index
    left = startIndex;
    right = itemMetrics.length - 1;
    const visibleEnd = scrollOffset + containerHeight;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const item = itemMetrics[mid];

      if (item.offsetTop <= visibleEnd) {
        endIndex = mid + 1;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // Apply overscan
    const overscanStart = Math.max(0, startIndex - overscan);
    const overscanEnd = Math.min(items.length, endIndex + overscan);

    return { start: overscanStart, end: overscanEnd };
  }, [isVirtual, itemMetrics, scrollOffset, containerHeight, overscan, items.length]);

  // Calculate virtual items
  const virtualItems = useMemo(() => {
    if (!isVirtual) {
      return itemMetrics.map(item => ({ ...item, isVisible: true }));
    }

    return itemMetrics.slice(visibleRange.start, visibleRange.end).map(item => ({
      ...item,
      isVisible: true,
    }));
  }, [isVirtual, itemMetrics, visibleRange]);

  // Scroll event handler with debouncing and RAF optimization
  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) {return;}

      const newScrollOffset = container.scrollTop;

      if (newScrollOffset !== scrollOffset) {
        setScrollOffset(newScrollOffset);
        isScrollingRef.current = true;

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Set scrolling to false after debounce period
        scrollTimeoutRef.current = window.setTimeout(() => {
          isScrollingRef.current = false;
        }, scrollDebounceMs);
      }
    });
  }, [scrollOffset, scrollDebounceMs]);

  // Container ref callback
  const containerRefCallback = useCallback((element: HTMLElement | null) => {
    if (containerRef.current) {
      containerRef.current.removeEventListener('scroll', handleScroll);
    }

    containerRef.current = element;

    if (element) {
      // Update container height
      const height = element.clientHeight;
      if (height !== containerHeight) {
        setContainerHeight(height);
      }

      // Add scroll listener
      element.addEventListener('scroll', handleScroll, { passive: true });

      // Set initial scroll offset
      setScrollOffset(element.scrollTop);
    }
  }, [handleScroll, containerHeight]);

  // Total height ref callback
  const totalHeightRefCallback = useCallback((element: HTMLElement | null) => {
    totalHeightRef.current = element;
  }, []);

  // Scroll to index function
  const scrollToIndex = useCallback(
    (index: number, alignment: 'start' | 'center' | 'end' = 'start') => {
      const container = containerRef.current;
      if (!container || index < 0 || index >= itemMetrics.length) {return;}

      const item = itemMetrics[index];
      let scrollTo = item.offsetTop;

      if (alignment === 'center') {
        scrollTo = item.offsetTop + item.height / 2 - containerHeight / 2;
      } else if (alignment === 'end') {
        scrollTo = item.offsetTop + item.height - containerHeight;
      }

      // Ensure scroll position is within bounds
      scrollTo = Math.max(0, Math.min(scrollTo, totalHeight - containerHeight));

      container.scrollTo({ top: scrollTo, behavior: 'smooth' });
    },
    [itemMetrics, containerHeight, totalHeight]
  );

  // Measure item height for dynamic heights
  const measureItem = useCallback((index: number, height: number) => {
    if (!enableDynamicHeight) {return;}

    setItemHeights(prev => {
      const next = new Map(prev);
      const currentHeight = next.get(index);

      if (currentHeight !== height) {
        next.set(index, height);
        return next;
      }

      return prev;
    });
  }, [enableDynamicHeight]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) {return;}

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        if (height !== containerHeight) {
          setContainerHeight(height);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [containerHeight]);

  return {
    containerRef: containerRefCallback,
    totalHeightRef: totalHeightRefCallback,
    virtualItems,
    totalHeight,
    scrollOffset,
    isVirtual,
    scrollToIndex,
    measureItem,
  };
}

/**
 * Utility hook for easier integration with existing components
 * Returns simplified props for common use cases
 */
export function useSimpleVirtualScrolling<T>(
  items: T[],
  itemHeight: number = 50,
  overscan: number = 5
) {
  const result = useVirtualScrolling(items, {
    itemHeight,
    overscan,
    threshold: 50, // Lower threshold for simple usage
  });

  return {
    ...result,
    // Simplified props for easier integration
    style: {
      height: result.totalHeight,
      position: 'relative' as const,
    },
    getItemStyle: (virtualItem: VirtualItem) => ({
      position: 'absolute' as const,
      top: virtualItem.offsetTop,
      height: virtualItem.height,
      width: '100%',
    }),
  };
}