import React from 'react';
import { cn } from '@/lib/utils';

interface FadeTransitionProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: 'fast' | 'normal' | 'slow';
}

/**
 * Smooth fade transition for loading states
 */
export function FadeTransition({
  show,
  children,
  className,
  duration = 'normal'
}: FadeTransitionProps) {
  const durationClass = {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500'
  }[duration];

  return (
    <div
      className={cn(
        'transition-opacity',
        durationClass,
        show ? 'opacity-100' : 'opacity-0 pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  );
}

interface SkeletonToContentTransitionProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Smooth transition from skeleton to content
 */
export function SkeletonToContentTransition({
  loading,
  skeleton,
  children,
  className
}: SkeletonToContentTransitionProps) {
  return (
    <div className={cn('relative', className)}>
      <FadeTransition show={loading}>
        {skeleton}
      </FadeTransition>

      <FadeTransition
        show={!loading}
        className={loading ? 'absolute inset-0' : undefined}
      >
        {children}
      </FadeTransition>
    </div>
  );
}

interface StaggeredRevealProps {
  items: React.ReactNode[];
  show: boolean;
  staggerDelay?: number;
  className?: string;
}

/**
 * Staggered reveal animation for list items
 */
export function StaggeredReveal({
  items,
  show,
  staggerDelay = 100,
  className
}: StaggeredRevealProps) {
  return (
    <div className={className}>
      {items.map((item, index) => (
        <FadeTransition
          key={index}
          show={show}
          className={cn(
            'transition-all',
            show && 'animate-in slide-in-from-left-2 fill-mode-both'
          )}
          duration="normal"
        >
          <div
            style={{
              animationDelay: show ? `${index * staggerDelay}ms` : '0ms',
            }}
          >
            {item}
          </div>
        </FadeTransition>
      ))}
    </div>
  );
}

/**
 * Enhanced loading overlay with backdrop blur
 */
interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  show,
  message = 'Loading...',
  className
}: LoadingOverlayProps) {
  if (!show) {
    return null;
  }

  return (
    <div className={cn(
      'absolute inset-0 bg-background/80 backdrop-blur-sm',
      'flex items-center justify-center rounded-lg z-10',
      'animate-in fade-in-0 duration-200',
      className
    )}>
      <div className='flex items-center gap-3 bg-card px-4 py-2 rounded-lg shadow-lg border'>
        <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
        <span className='text-sm font-medium'>{message}</span>
      </div>
    </div>
  );
}

/**
 * Inline loading spinner for small operations
 */
interface InlineLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InlineLoadingSpinner({
  size = 'sm',
  className
}: InlineLoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-3 w-3 border',
    md: 'h-4 w-4 border-2',
    lg: 'h-5 w-5 border-2'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

/**
 * Button loading state component
 */
interface ButtonLoadingStateProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export function ButtonLoadingState({
  loading,
  children,
  loadingText,
  className
}: ButtonLoadingStateProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {loading && <InlineLoadingSpinner size="sm" />}
      <span>
        {loading && loadingText ? loadingText : children}
      </span>
    </div>
  );
}

/**
 * Form field loading state for real-time validation
 */
interface FormFieldLoadingStateProps {
  loading: boolean;
  error?: string;
  success?: boolean;
  className?: string;
}

export function FormFieldLoadingState({
  loading,
  error,
  success,
  className
}: FormFieldLoadingStateProps) {
  if (!loading && !error && !success) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-1 mt-1', className)}>
      {loading && (
        <>
          <InlineLoadingSpinner size="sm" />
          <span className="text-xs text-muted-foreground">Checking...</span>
        </>
      )}
      {error && (
        <>
          <div className="h-3 w-3 rounded-full bg-destructive" />
          <span className="text-xs text-destructive">{error}</span>
        </>
      )}
      {success && !loading && !error && (
        <>
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-xs text-success">Available</span>
        </>
      )}
    </div>
  );
}

/**
 * Tab content loading state
 */
interface TabLoadingStateProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function TabLoadingState({
  loading,
  skeleton,
  children,
  className
}: TabLoadingStateProps) {
  return (
    <div className={cn('min-h-[200px] relative', className)}>
      <FadeTransition show={loading}>
        <div className="p-6">
          {skeleton}
        </div>
      </FadeTransition>

      <FadeTransition
        show={!loading}
        className={loading ? 'absolute inset-0' : undefined}
      >
        {children}
      </FadeTransition>
    </div>
  );
}