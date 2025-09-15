import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';
import { VirtualItem, VirtualScrollingConfig, useVirtualScrolling } from '@/hooks/useVirtualScrolling';

export interface VirtualListProps<T> {
  /**
   * Array of items to render
   */
  items: T[];
  /**
   * Function to render each item
   */
  renderItem: (item: T, index: number, virtualItem: VirtualItem) => React.ReactNode;
  /**
   * Virtual scrolling configuration
   */
  config?: VirtualScrollingConfig;
  /**
   * Additional CSS classes for the container
   */
  className?: string;
  /**
   * Additional CSS classes for the scroll area
   */
  scrollAreaClassName?: string;
  /**
   * Additional CSS classes for items container
   */
  itemsContainerClassName?: string;
  /**
   * Height of the container (if not specified, will use config.containerHeight or auto)
   */
  height?: number | string;
  /**
   * Width of the container
   */
  width?: number | string;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Loading component to show when loading
   */
  loadingComponent?: React.ReactNode;
  /**
   * Empty state component
   */
  emptyComponent?: React.ReactNode;
  /**
   * Callback when scroll position changes
   */
  onScroll?: (scrollOffset: number) => void;
  /**
   * Callback when visible range changes
   */
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void;
  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
  /**
   * Role for accessibility
   */
  role?: string;
  /**
   * Whether to show scroll indicators
   */
  showScrollIndicators?: boolean;
  /**
   * Enable focus management for keyboard navigation
   */
  enableFocusManagement?: boolean;
}

export interface VirtualListHandle {
  /**
   * Scroll to specific index
   */
  scrollToIndex: (index: number, alignment?: 'start' | 'center' | 'end') => void;
  /**
   * Scroll to top
   */
  scrollToTop: () => void;
  /**
   * Scroll to bottom
   */
  scrollToBottom: () => void;
  /**
   * Get current scroll position
   */
  getScrollOffset: () => number;
  /**
   * Get visible range
   */
  getVisibleRange: () => { start: number; end: number };
}

// Loading skeleton component
const LoadingSkeleton: React.FC<{ count?: number; height?: number }> = ({
  count = 5,
  height = 50
}) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-muted rounded-md"
        style={{ height: `${height}px` }}
      />
    ))}
  </div>
);

// Empty state component
const EmptyState: React.FC<{ message?: string }> = ({
  message = "No items found"
}) => (
  <div className="flex items-center justify-center py-12 text-muted-foreground">
    <p>{message}</p>
  </div>
);

/**
 * VirtualList component for efficient rendering of large lists
 * Provides virtual scrolling capabilities with full accessibility support
 */
export const VirtualList = forwardRef<VirtualListHandle, VirtualListProps<unknown>>(
  <T,>({
    items,
    renderItem,
    config = {},
    className,
    scrollAreaClassName,
    itemsContainerClassName,
    height = '100%',
    width = '100%',
    loading = false,
    loadingComponent,
    emptyComponent,
    onScroll,
    onVisibleRangeChange,
    ariaLabel,
    role = 'list',
    showScrollIndicators = false,
    enableFocusManagement = true,
    ...props
  }: VirtualListProps<T>, ref: React.Ref<VirtualListHandle>) => {
    const containerStyle = {
      height: typeof height === 'number' ? `${height}px` : height,
      width: typeof width === 'number' ? `${width}px` : width,
    };

    // Use virtual scrolling hook
    const virtualScrolling = useVirtualScrolling(items, {
      containerHeight: typeof height === 'number' ? height : 400,
      ...config,
    });

    const {
      containerRef,
      totalHeightRef,
      virtualItems,
      totalHeight,
      scrollOffset,
      isVirtual,
      scrollToIndex,
      measureItem: _measureItem,
    } = virtualScrolling;

    // Refs for focus management
    const itemRefs = useRef<Map<number, HTMLElement>>(new Map());
    const focusedIndexRef = useRef<number>(-1);

    // Handle scroll callback
    useEffect(() => {
      if (onScroll) {
        onScroll(scrollOffset);
      }
    }, [scrollOffset, onScroll]);

    // Handle visible range change callback
    useEffect(() => {
      if (onVisibleRangeChange && virtualItems.length > 0) {
        const startIndex = virtualItems[0]?.index ?? 0;
        const endIndex = virtualItems[virtualItems.length - 1]?.index ?? 0;
        onVisibleRangeChange(startIndex, endIndex);
      }
    }, [virtualItems, onVisibleRangeChange]);

    // Imperative handle for parent components
    useImperativeHandle(ref, () => ({
      scrollToIndex: (index: number, alignment?: 'start' | 'center' | 'end') => {
        scrollToIndex(index, alignment);
      },
      scrollToTop: () => {
        scrollToIndex(0, 'start');
      },
      scrollToBottom: () => {
        scrollToIndex(items.length - 1, 'end');
      },
      getScrollOffset: () => scrollOffset,
      getVisibleRange: () => {
        if (virtualItems.length === 0) {return { start: 0, end: 0 };}
        return {
          start: virtualItems[0].index,
          end: virtualItems[virtualItems.length - 1].index,
        };
      },
    }), [scrollToIndex, scrollOffset, virtualItems, items.length]);

    // Keyboard navigation handler
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (!enableFocusManagement || virtualItems.length === 0) {return;}

      const currentFocusedIndex = focusedIndexRef.current;
      let newFocusedIndex = currentFocusedIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          newFocusedIndex = Math.min(items.length - 1, currentFocusedIndex + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          newFocusedIndex = Math.max(0, currentFocusedIndex - 1);
          break;
        case 'Home':
          e.preventDefault();
          newFocusedIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newFocusedIndex = items.length - 1;
          break;
        case 'PageDown':
          e.preventDefault();
          newFocusedIndex = Math.min(items.length - 1, currentFocusedIndex + 10);
          break;
        case 'PageUp':
          e.preventDefault();
          newFocusedIndex = Math.max(0, currentFocusedIndex - 10);
          break;
        default:
          return;
      }

      if (newFocusedIndex !== currentFocusedIndex) {
        focusedIndexRef.current = newFocusedIndex;

        // Scroll to the focused item if it's not visible
        const isInVisibleRange = virtualItems.some(item => item.index === newFocusedIndex);
        if (!isInVisibleRange) {
          scrollToIndex(newFocusedIndex, 'center');
        }

        // Focus the element when it becomes available
        setTimeout(() => {
          const element = itemRefs.current.get(newFocusedIndex);
          if (element) {
            element.focus();
          }
        }, 0);
      }
    }, [enableFocusManagement, virtualItems, items.length, scrollToIndex]);

    // Item ref callbacks - memoize individual callbacks to prevent infinite loops
    const itemRefCallbacks = useRef<Map<number, (element: HTMLElement | null) => void>>(new Map());

    const getItemRef = useCallback((index: number) => {
      let callback = itemRefCallbacks.current.get(index);
      if (!callback) {
        callback = (element: HTMLElement | null) => {
          if (element) {
            itemRefs.current.set(index, element);
          } else {
            itemRefs.current.delete(index);
          }
        };
        itemRefCallbacks.current.set(index, callback);
      }
      return callback;
    }, []);

    // Clean up unused ref callbacks when virtualItems change
    useEffect(() => {
      const currentIndices = new Set(virtualItems.map(item => item.index));
      const callbackIndices = Array.from(itemRefCallbacks.current.keys());

      // Remove callbacks for items that are no longer in the virtual list
      for (const index of callbackIndices) {
        if (!currentIndices.has(index)) {
          itemRefCallbacks.current.delete(index);
          itemRefs.current.delete(index);
        }
      }
    }, [virtualItems]);

    // Handle loading state
    if (loading) {
      return (
        <div
          className={cn('relative overflow-hidden', className)}
          style={containerStyle}
          role={role}
          aria-label={ariaLabel || "Loading list"}
        >
          {loadingComponent || (
            <LoadingSkeleton
              count={Math.min(10, Math.floor((typeof height === 'number' ? height : 400) / (config.itemHeight || 50)))}
              height={config.itemHeight || 50}
            />
          )}
        </div>
      );
    }

    // Handle empty state
    if (items.length === 0) {
      return (
        <div
          className={cn('relative', className)}
          style={containerStyle}
          role={role}
          aria-label={ariaLabel || "Empty list"}
        >
          {emptyComponent || <EmptyState />}
        </div>
      );
    }

    // Main render
    return (
      <div
        className={cn('relative', className)}
        style={containerStyle}
        role={role}
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        tabIndex={enableFocusManagement ? 0 : -1}
        {...props}
      >
        {/* Scroll indicators */}
        {showScrollIndicators && (
          <>
            <div
              className={cn(
                'absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-border/50 to-transparent pointer-events-none z-10 transition-opacity',
                scrollOffset > 0 ? 'opacity-100' : 'opacity-0'
              )}
            />
            <div
              className={cn(
                'absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-border/50 to-transparent pointer-events-none z-10 transition-opacity',
                scrollOffset < totalHeight - (typeof height === 'number' ? height : 400) ? 'opacity-100' : 'opacity-0'
              )}
            />
          </>
        )}

        {/* Scrollable container */}
        <div
          ref={containerRef}
          className={cn(
            'overflow-auto h-full w-full',
            scrollAreaClassName
          )}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--muted-foreground)) transparent',
          }}
        >
          {/* Total height placeholder for virtual scrolling */}
          <div
            ref={totalHeightRef}
            style={{
              height: isVirtual ? totalHeight : 'auto',
              position: 'relative',
            }}
          >
            {/* Items container */}
            <div
              className={cn(
                isVirtual ? 'relative' : 'space-y-0',
                itemsContainerClassName
              )}
              role="none"
            >
              {virtualItems.map((virtualItem) => {
                const item = items[virtualItem.index];
                if (!item) {return null;}

                const itemStyle = isVirtual ? {
                  position: 'absolute' as const,
                  top: virtualItem.offsetTop,
                  left: 0,
                  right: 0,
                  height: virtualItem.height,
                } : undefined;

                return (
                  <div
                    key={virtualItem.index}
                    ref={getItemRef(virtualItem.index)}
                    style={itemStyle}
                    className={cn(
                      'w-full',
                      focusedIndexRef.current === virtualItem.index && 'ring-2 ring-primary/50',
                      !isVirtual && 'min-h-0' // Allow natural height when not virtual
                    )}
                    role="listitem"
                    tabIndex={enableFocusManagement ? 0 : -1}
                    aria-setsize={items.length}
                    aria-posinset={virtualItem.index + 1}
                  >
                    {renderItem(item, virtualItem.index, virtualItem)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {isVirtual && `Showing ${virtualItems.length} of ${items.length} items`}
        </div>
      </div>
    );
  }
);

VirtualList.displayName = 'VirtualList';

/**
 * Simple wrapper component for common use cases
 */
export const SimpleVirtualList = <T,>({
  items,
  renderItem,
  itemHeight = 50,
  className,
  ...props
}: Omit<VirtualListProps<T>, 'config'> & {
  itemHeight?: number;
}) => {
  return (
    <VirtualList
      items={items}
      renderItem={renderItem}
      config={{ itemHeight, threshold: 50 }}
      className={className}
      {...props}
    />
  );
};