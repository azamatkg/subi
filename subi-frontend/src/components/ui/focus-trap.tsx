import React, { useEffect, useRef } from 'react';
import { FocusManager } from '@/lib/accessibility';
import { cn } from '@/lib/utils';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
  className?: string;
}

/**
 * Focus trap component that manages focus within a container
 * Useful for modals, dropdowns, and other overlay components
 */
export function FocusTrap({
  children,
  active = true,
  restoreFocus = true,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) {
      return;
    }

    // Save current focus if we should restore it later
    if (restoreFocus) {
      FocusManager.saveFocus();
    }

    const cleanup = FocusManager.trapFocus(containerRef.current);
    const firstFocusable = FocusManager.getFirstFocusableElement(
      containerRef.current
    );

    // Focus the first focusable element
    if (firstFocusable) {
      // Small delay to ensure the element is rendered and focusable
      setTimeout(() => firstFocusable.focus(), 0);
    }

    return () => {
      cleanup();
      if (restoreFocus) {
        FocusManager.restoreFocus();
      }
    };
  }, [active, restoreFocus]);

  return (
    <div ref={containerRef} className={cn('focus-trap-container', className)}>
      {children}
    </div>
  );
}

/**
 * Skip to content link for keyboard navigation
 */
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default, visible when focused
        'sr-only focus:not-sr-only',
        'fixed top-4 left-4 z-[9999]',
        'bg-primary text-primary-foreground',
        'px-4 py-2 rounded-md font-medium text-sm',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring',
        className
      )}
      onFocus={e => {
        // Ensure the link is visible when focused
        e.currentTarget.classList.remove('sr-only');
      }}
      onBlur={e => {
        // Hide again when focus is lost
        e.currentTarget.classList.add('sr-only');
      }}
    >
      {children}
    </a>
  );
}

/**
 * Live region for screen reader announcements
 */
interface LiveRegionProps {
  children?: React.ReactNode;
  priority?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  className?: string;
}

export function LiveRegion({
  children,
  priority = 'polite',
  atomic = true,
  className,
}: LiveRegionProps) {
  return (
    <div
      aria-live={priority}
      aria-atomic={atomic}
      className={cn(
        // Visually hidden but available to screen readers
        'sr-only',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Accessible landmark component
 */
interface LandmarkProps {
  children: React.ReactNode;
  role?:
    | 'main'
    | 'navigation'
    | 'banner'
    | 'contentinfo'
    | 'complementary'
    | 'region';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
}

export function Landmark({
  children,
  role = 'region',
  className,
  ...ariaProps
}: LandmarkProps) {
  return (
    <div role={role} className={className} {...ariaProps}>
      {children}
    </div>
  );
}

/**
 * Accessible heading component with automatic hierarchy
 */
interface AccessibleHeadingProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  id?: string;
}

export function AccessibleHeading({
  children,
  level = 2,
  className,
  id,
}: AccessibleHeadingProps) {
  const Component = `h${level}` as const;

  return (
    <Component
      id={id}
      className={cn(
        // Base heading styles
        'font-semibold tracking-tight scroll-m-20',
        // Level-specific styles
        level === 1 && 'text-4xl lg:text-5xl',
        level === 2 && 'text-3xl',
        level === 3 && 'text-2xl',
        level === 4 && 'text-xl',
        level === 5 && 'text-lg',
        level === 6 && 'text-base',
        className
      )}
    >
      {children}
    </Component>
  );
}

/**
 * Visually hidden component for screen readers
 */
interface VisuallyHiddenProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export function VisuallyHidden({
  children,
  asChild = false,
  className,
}: VisuallyHiddenProps) {
  if (asChild && React.isValidElement(children)) {
    const mergedClassName = cn(
      'sr-only',
      (children.props as { className?: string })?.className,
      className
    );

    return React.cloneElement(
      children as React.ReactElement<{ className?: string }>,
      {
        className: mergedClassName,
      }
    );
  }

  return <span className={cn('sr-only', className)}>{children}</span>;
}
