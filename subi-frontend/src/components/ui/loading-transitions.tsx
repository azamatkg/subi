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