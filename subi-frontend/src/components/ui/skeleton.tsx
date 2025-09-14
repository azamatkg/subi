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

/**
 * User card skeleton that matches UserCard component layout
 */
interface UserCardSkeletonProps {
  count?: number;
  staggered?: boolean;
  compact?: boolean;
  className?: string;
}

function UserCardSkeleton({
  count = 1,
  staggered = false,
  compact = false,
  className,
}: UserCardSkeletonProps) {
  const cards = Array.from({ length: count });

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4', className)}>
      {cards.map((_, index) => (
        <div
          key={`user-card-skeleton-${index}`}
          className={cn(
            'border border-card-elevated-border bg-card shadow-md rounded-lg',
            staggered && 'animate-pulse',
          )}
          style={
            staggered
              ? {
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '1.5s',
                }
              : undefined
          }
        >
          <div className={cn('p-7', compact && 'p-4')}>
            <div className='space-y-4'>
              {/* Header with avatar, username, and status */}
              <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-3 mb-3'>
                    <Skeleton className='h-9 w-9 rounded-xl' />
                    <Skeleton className='h-4 w-20' />
                  </div>
                  <Skeleton className='h-6 w-40 mb-2' />
                  <Skeleton className='h-4 w-48' />
                </div>
                <div className='flex items-center gap-2 shrink-0'>
                  <Skeleton className='h-6 w-16 rounded-full' />
                  <Skeleton className='h-8 w-8 rounded-lg' />
                </div>
              </div>

              {/* Details section */}
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-5 w-5' />
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-5 w-5' />
                  <Skeleton className='h-4 w-28' />
                  <Skeleton className='h-4 w-20' />
                </div>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-5 w-5' />
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-24' />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * User profile skeleton for detail sections
 */
interface UserProfileSkeletonProps {
  showActivity?: boolean;
  showRoles?: boolean;
  sections?: number;
  className?: string;
}

function UserProfileSkeleton({
  showActivity = true,
  showRoles = true,
  sections = 3,
  className,
}: UserProfileSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-8 rounded' />
          <Skeleton className='h-8 w-32' />
        </div>
        <div className='flex items-start gap-4'>
          <Skeleton className='h-20 w-20 rounded-xl' />
          <div className='space-y-2 flex-1'>
            <Skeleton className='h-8 w-48' />
            <Skeleton className='h-4 w-64' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-6 w-20 rounded-full' />
              <Skeleton className='h-6 w-16 rounded-full' />
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className='grid gap-6 md:grid-cols-2'>
        {Array.from({ length: sections }).map((_, index) => (
          <div key={`profile-section-${index}`} className='space-y-4'>
            <Skeleton className='h-6 w-32' />
            <div className='space-y-3 p-4 border rounded-lg'>
              <div className='grid gap-3'>
                <div className='flex justify-between'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <div className='flex justify-between'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-28' />
                </div>
                <div className='flex justify-between'>
                  <Skeleton className='h-4 w-28' />
                  <Skeleton className='h-4 w-24' />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Roles section */}
      {showRoles && (
        <div className='space-y-4'>
          <Skeleton className='h-6 w-24' />
          <div className='flex flex-wrap gap-2'>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={`role-skeleton-${index}`}
                className='h-6 w-20 rounded-full'
              />
            ))}
          </div>
        </div>
      )}

      {/* Activity timeline */}
      {showActivity && (
        <div className='space-y-4'>
          <Skeleton className='h-6 w-32' />
          <UserActivityTimelineSkeleton items={4} />
        </div>
      )}
    </div>
  );
}

/**
 * User activity timeline skeleton
 */
interface UserActivityTimelineSkeletonProps {
  items?: number;
  compact?: boolean;
  className?: string;
}

function UserActivityTimelineSkeleton({
  items = 5,
  compact = false,
  className,
}: UserActivityTimelineSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={`timeline-item-${index}`}
          className={cn(
            'flex gap-4 pb-4 border-l-2 border-muted pl-4 ml-2 last:border-l-0',
            compact && 'gap-2 pb-2'
          )}
        >
          <Skeleton className='h-6 w-6 rounded-full shrink-0 -ml-7 bg-background border-2 border-muted' />
          <div className='space-y-2 flex-1'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-4 w-40' />
              <Skeleton className='h-3 w-16' />
            </div>
            <Skeleton className={cn('h-3 w-64', compact && 'w-32')} />
            {!compact && <Skeleton className='h-3 w-48' />}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * User form skeleton for form sections
 */
interface UserFormSkeletonProps {
  sections?: ('personal' | 'system' | 'roles' | 'security')[];
  compact?: boolean;
  className?: string;
}

function UserFormSkeleton({
  sections = ['personal', 'system', 'roles'],
  compact = false,
  className,
}: UserFormSkeletonProps) {
  const getSectionContent = (section: string) => {
    switch (section) {
      case 'personal':
        return (
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-12' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>
        );
      case 'system':
        return (
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <div className='relative'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4' />
              </div>
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-10 w-full' />
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Skeleton className='h-4 w-18' />
              <Skeleton className='h-10 w-full' />
            </div>
          </div>
        );
      case 'roles':
        return (
          <div className='space-y-4'>
            <div className='grid gap-3 md:grid-cols-2'>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={`role-checkbox-${index}`} className='flex items-center space-x-2'>
                  <Skeleton className='h-4 w-4 rounded' />
                  <Skeleton className='h-4 w-24' />
                </div>
              ))}
            </div>
          </div>
        );
      case 'security':
        return (
          <div className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-10 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-10 w-full' />
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Skeleton className='h-4 w-4 rounded' />
              <Skeleton className='h-4 w-40' />
            </div>
          </div>
        );
      default:
        return <Skeleton className='h-32 w-full' />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {sections.map((section, _index) => (
        <div
          key={`form-section-${section}`}
          className={cn(
            'p-6 border rounded-lg space-y-4',
            compact && 'p-4 space-y-3'
          )}
        >
          <div className='flex items-center gap-3'>
            <Skeleton className='h-5 w-5' />
            <Skeleton className='h-5 w-32' />
          </div>
          <Skeleton className='h-px w-full' />
          {getSectionContent(section)}
        </div>
      ))}

      {/* Action buttons */}
      <div className='flex justify-end gap-3 pt-4'>
        <Skeleton className='h-10 w-20' />
        <Skeleton className='h-10 w-16' />
      </div>
    </div>
  );
}

/**
 * Search and filter panel skeleton
 */
interface SearchFilterSkeletonProps {
  showDateFilters?: boolean;
  showRoleFilters?: boolean;
  className?: string;
}

function SearchFilterSkeleton({
  showDateFilters = false,
  showRoleFilters = false,
  className,
}: SearchFilterSkeletonProps) {
  return (
    <div className={cn('p-4 border rounded-lg space-y-4', className)}>
      <div className='grid gap-4 md:grid-cols-3'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-12' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-full' />
        </div>
      </div>

      {showRoleFilters && (
        <div className='space-y-2'>
          <Skeleton className='h-4 w-12' />
          <div className='flex flex-wrap gap-2'>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={`role-filter-${index}`}
                className='h-6 w-20 rounded-full'
              />
            ))}
          </div>
        </div>
      )}

      {showDateFilters && (
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
      )}

      <div className='flex justify-end gap-2'>
        <Skeleton className='h-9 w-20' />
        <Skeleton className='h-9 w-24' />
      </div>
    </div>
  );
}

export {
  Skeleton,
  CardSkeleton,
  ListItemSkeleton,
  TableSkeleton,
  PageSkeleton,
  UserCardSkeleton,
  UserProfileSkeleton,
  UserActivityTimelineSkeleton,
  UserFormSkeleton,
  SearchFilterSkeleton,
};
