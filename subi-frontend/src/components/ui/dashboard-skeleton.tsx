import React from 'react';

interface DashboardSkeletonProps {
  statCardsCount?: number;
  dashboardCardsCount?: number;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  statCardsCount = 2,
  dashboardCardsCount = 3
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Array.from({ length: statCardsCount }).map((_, i) => (
          <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: dashboardCardsCount }).map((_, i) => (
          <div key={i} className="h-80 bg-muted/50 animate-pulse rounded-xl"></div>
        ))}
      </div>
    </div>
  );
};