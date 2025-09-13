import React from 'react';
import { Clock, User, Shield, Key, LogIn, LogOut, UserPlus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AccessibleDate, AccessibleLoading } from '@/components/ui/accessible-status-badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ActivityAction, UserActivityTimelineEntry } from '@/types/user';
import { useTranslation } from 'react-i18next';

interface UserActivityTimelineProps {
  activities: UserActivityTimelineEntry[];
  isLoading?: boolean;
  className?: string;
  maxItems?: number;
  showPerformedBy?: boolean;
}

export function UserActivityTimeline({
  activities = [],
  isLoading = false,
  className,
  maxItems = 10,
  showPerformedBy = true,
}: UserActivityTimelineProps) {
  const { t } = useTranslation();

  const getActivityIcon = (action: ActivityAction) => {
    const iconClass = 'h-4 w-4 flex-shrink-0';

    switch (action) {
      case ActivityAction.LOGIN:
        return <LogIn className={cn(iconClass, 'text-success-600')} aria-hidden="true" />;
      case ActivityAction.LOGOUT:
        return <LogOut className={cn(iconClass, 'text-info-600')} aria-hidden="true" />;
      case ActivityAction.PASSWORD_CHANGE:
        return <Key className={cn(iconClass, 'text-warning-600')} aria-hidden="true" />;
      case ActivityAction.PROFILE_UPDATE:
        return <User className={cn(iconClass, 'text-info-600')} aria-hidden="true" />;
      case ActivityAction.ROLE_CHANGE:
        return <Shield className={cn(iconClass, 'text-warning-600')} aria-hidden="true" />;
      case ActivityAction.STATUS_CHANGE:
        return <Shield className={cn(iconClass, 'text-warning-600')} aria-hidden="true" />;
      case ActivityAction.ACCOUNT_CREATED:
        return <UserPlus className={cn(iconClass, 'text-success-600')} aria-hidden="true" />;
      case ActivityAction.ACCOUNT_DELETED:
        return <Trash2 className={cn(iconClass, 'text-destructive-600')} aria-hidden="true" />;
      default:
        return <Clock className={cn(iconClass, 'text-neutral-600')} aria-hidden="true" />;
    }
  };

  const getActivityBadgeVariant = (action: ActivityAction) => {
    switch (action) {
      case ActivityAction.LOGIN:
      case ActivityAction.ACCOUNT_CREATED:
        return 'default';
      case ActivityAction.LOGOUT:
      case ActivityAction.PROFILE_UPDATE:
        return 'secondary';
      case ActivityAction.PASSWORD_CHANGE:
      case ActivityAction.ROLE_CHANGE:
      case ActivityAction.STATUS_CHANGE:
        return 'outline';
      case ActivityAction.ACCOUNT_DELETED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getActivityColor = (action: ActivityAction) => {
    switch (action) {
      case ActivityAction.LOGIN:
      case ActivityAction.ACCOUNT_CREATED:
        return 'border-success-200 bg-success-50';
      case ActivityAction.LOGOUT:
      case ActivityAction.PROFILE_UPDATE:
        return 'border-info-200 bg-info-50';
      case ActivityAction.PASSWORD_CHANGE:
      case ActivityAction.ROLE_CHANGE:
      case ActivityAction.STATUS_CHANGE:
        return 'border-warning-200 bg-warning-50';
      case ActivityAction.ACCOUNT_DELETED:
        return 'border-destructive-200 bg-destructive-50';
      default:
        return 'border-neutral-200 bg-neutral-50';
    }
  };

  const getActivityTitle = (activity: UserActivityTimelineEntry) => {
    const key = `userActivity.${activity.type.toLowerCase()}`;
    return t(key, { defaultValue: activity.title });
  };

  const getActivityDescription = (activity: UserActivityTimelineEntry) => {
    if (activity.metadata?.reason) {
      return `${activity.description}. ${t('userActivity.reason')}: ${activity.metadata.reason}`;
    }
    return activity.description;
  };

  const formatMetadata = (metadata: UserActivityTimelineEntry['metadata']) => {
    if (!metadata) return null;

    const items = [];

    if (metadata.oldValue && metadata.newValue) {
      items.push(
        `${t('userActivity.changed')} "${metadata.oldValue}" → "${metadata.newValue}"`
      );
    }

    if (metadata.ipAddress) {
      items.push(`IP: ${metadata.ipAddress}`);
    }

    return items.length > 0 ? items.join(', ') : null;
  };

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('userActivity.timeline')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AccessibleLoading context={t('userActivity.loading')} />
        </CardContent>
      </Card>
    );
  }

  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('userActivity.timeline')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t('userActivity.noActivities')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('userActivity.timeline')}
          </div>
          <Badge variant="secondary" className="text-xs">
            {activities.length} {t('userActivity.activities')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          {displayActivities.map((activity, index) => (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < displayActivities.length - 1 && (
                <div
                  className="absolute left-4 top-8 h-8 w-px bg-border"
                  aria-hidden="true"
                />
              )}

              {/* Activity item */}
              <div className="flex gap-3 relative">
                {/* Activity icon with background */}
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2',
                    getActivityColor(activity.type)
                  )}
                >
                  {getActivityIcon(activity.type)}
                </div>

                {/* Activity content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {getActivityTitle(activity)}
                        </h4>
                        <Badge
                          variant={getActivityBadgeVariant(activity.type)}
                          className="text-xs px-1.5 py-0.5"
                        >
                          {activity.type}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {getActivityDescription(activity)}
                      </p>

                      {formatMetadata(activity.metadata) && (
                        <p className="text-xs text-muted-foreground mb-2 font-mono bg-muted px-2 py-1 rounded">
                          {formatMetadata(activity.metadata)}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <AccessibleDate
                          date={activity.timestamp}
                          format="medium"
                          className="text-xs"
                        />

                        {showPerformedBy && activity.performedBy && (
                          <>
                            <Separator orientation="vertical" className="h-3" />
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="font-medium">
                                {activity.performedBy.fullName || activity.performedBy.username}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activities.length > maxItems && (
          <div className="text-center pt-2">
            <Badge variant="outline" className="text-xs">
              {t('userActivity.showingMore', {
                shown: maxItems,
                total: activities.length,
              })}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UserActivityTimeline;