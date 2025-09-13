import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/60', className)}
      {...props}
    />
  );
}

/**
 * Card skeleton for dashboard cards
 */
interface CardSkeletonProps {
  showIcon?: boolean;
  showTrend?: boolean;
  className?: string;
}

function CardSkeleton({
  showIcon = true,
  showTrend = false,
  className,
}: CardSkeletonProps) {
  return (
    <div className={cn('p-6 border rounded-xl bg-card shadow-sm', className)}>
      <div className='flex items-center justify-between mb-2'>
        <Skeleton className='h-4 w-24' />
        {showIcon && <Skeleton className='h-5 w-5 rounded' />}
      </div>
      <Skeleton className='h-8 w-20 mb-1' />
      {showTrend && (
        <div className='flex items-center gap-1'>
          <Skeleton className='h-3 w-3 rounded' />
          <Skeleton className='h-3 w-16' />
        </div>
      )}
    </div>
  );
}

/**
 * List item skeleton for application/decision lists
 */
interface ListItemSkeletonProps {
  showAvatar?: boolean;
  showBadge?: boolean;
  showActions?: boolean;
  className?: string;
}

function ListItemSkeleton({
  showAvatar = false,
  showBadge = true,
  showActions = true,
  className,
}: ListItemSkeletonProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl bg-muted/30',
        className
      )}
    >
      {showAvatar && <Skeleton className='h-12 w-12 rounded-full' />}
      <div className='flex-1 space-y-2'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-4 w-32' />
          {showBadge && <Skeleton className='h-5 w-16 rounded-full' />}
        </div>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-3 w-24' />
          <Skeleton className='h-3 w-20' />
          <Skeleton className='h-3 w-28' />
        </div>
      </div>
      {showActions && <Skeleton className='h-8 w-8 rounded' />}
    </div>
  );
}

/**
 * Table skeleton for data tables
 */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

function TableSkeleton({
  rows = 5,
  columns = 6,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div
        className='grid gap-4 pb-2 border-b'
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className='h-4 w-20' />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          className='grid gap-4 py-3'
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className={cn(
                'h-4',
                colIndex === 0 && 'w-24', // First column wider
                colIndex === 1 && 'w-32', // Second column wider
                colIndex > 1 && 'w-16' // Other columns smaller
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Page skeleton for full page loading states
 */
interface PageSkeletonProps {
  showHeader?: boolean;
  showCards?: boolean;
  showList?: boolean;
  className?: string;
}

function PageSkeleton({
  showHeader = true,
  showCards = true,
  showList = true,
  className,
}: PageSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Page Header */}
      {showHeader && (
        <div className='space-y-2'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
      )}

      {/* Cards Grid */}
      {showCards && (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={`card-${i}`} showTrend={i < 2} />
          ))}
        </div>
      )}

      {/* Content List */}
      {showList && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-9 w-24' />
          </div>
          <div className='space-y-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <ListItemSkeleton key={`list-${i}`} showAvatar />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export {
  Skeleton,
  CardSkeleton,
  ListItemSkeleton,
  TableSkeleton,
  PageSkeleton,
};
