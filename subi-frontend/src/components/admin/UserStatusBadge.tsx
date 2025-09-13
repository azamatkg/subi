import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Pause,
  AlertTriangle,
  Clock,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserStatus } from '@/types/user';
import { useTranslation } from 'react-i18next';

interface UserStatusBadgeProps {
  status: UserStatus;
  enabled?: boolean;
  isActive?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  variant?: 'badge' | 'pill' | 'dot';
  interactive?: boolean;
  onClick?: () => void;
}

export function UserStatusBadge({
  status,
  enabled = true,
  isActive = true,
  className,
  size = 'default',
  showIcon = true,
  variant = 'badge',
  interactive = false,
  onClick,
}: UserStatusBadgeProps) {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    // Determine the effective status considering enabled and isActive flags
    const effectiveStatus = !enabled ? 'DISABLED' : !isActive ? 'INACTIVE' : status;

    switch (effectiveStatus) {
      case UserStatus.ACTIVE:
        return {
          label: t('userStatus.active'),
          icon: CheckCircle,
          colors: {
            bg: 'bg-success-50',
            text: 'text-success-700',
            border: 'border-success-200',
            hover: 'hover:bg-success-100',
            dot: 'bg-success-500',
          },
          ariaLabel: t('userStatus.activeDescription'),
        };

      case UserStatus.INACTIVE:
        return {
          label: t('userStatus.inactive'),
          icon: XCircle,
          colors: {
            bg: 'bg-destructive-50',
            text: 'text-destructive-700',
            border: 'border-destructive-200',
            hover: 'hover:bg-destructive-100',
            dot: 'bg-destructive-500',
          },
          ariaLabel: t('userStatus.inactiveDescription'),
        };

      case UserStatus.SUSPENDED:
        return {
          label: t('userStatus.suspended'),
          icon: Pause,
          colors: {
            bg: 'bg-warning-50',
            text: 'text-warning-700',
            border: 'border-warning-200',
            hover: 'hover:bg-warning-100',
            dot: 'bg-warning-500',
          },
          ariaLabel: t('userStatus.suspendedDescription'),
        };

      case 'DISABLED':
        return {
          label: t('userStatus.disabled'),
          icon: AlertTriangle,
          colors: {
            bg: 'bg-neutral-50',
            text: 'text-neutral-600',
            border: 'border-neutral-200',
            hover: 'hover:bg-neutral-100',
            dot: 'bg-neutral-400',
          },
          ariaLabel: t('userStatus.disabledDescription'),
        };

      default:
        return {
          label: t('userStatus.unknown'),
          icon: Clock,
          colors: {
            bg: 'bg-neutral-50',
            text: 'text-neutral-600',
            border: 'border-neutral-200',
            hover: 'hover:bg-neutral-100',
            dot: 'bg-neutral-400',
          },
          ariaLabel: t('userStatus.unknownDescription'),
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 'h-3 w-3',
      dot: 'h-2 w-2',
      text: 'text-xs',
    },
    default: {
      badge: 'px-3 py-1.5 text-sm',
      icon: 'h-4 w-4',
      dot: 'h-2.5 w-2.5',
      text: 'text-sm',
    },
    lg: {
      badge: 'px-4 py-2 text-base',
      icon: 'h-5 w-5',
      dot: 'h-3 w-3',
      text: 'text-base',
    },
  };

  const baseClasses = cn(
    'inline-flex items-center gap-1.5 font-medium transition-colors',
    config.colors.bg,
    config.colors.text,
    config.colors.border,
    {
      'border cursor-pointer': variant === 'badge',
      'rounded-full border-2': variant === 'pill',
      [config.colors.hover]: interactive,
      'hover:shadow-sm': interactive,
      'focus:outline-none focus:ring-2 focus:ring-offset-1': interactive,
    }
  );

  // Dot variant - just a colored dot with label
  if (variant === 'dot') {
    return (
      <div
        className={cn('inline-flex items-center gap-2', className)}
        role="status"
        aria-label={config.ariaLabel}
        onClick={interactive ? onClick : undefined}
      >
        <div
          className={cn(
            'rounded-full',
            config.colors.dot,
            sizeClasses[size].dot
          )}
          aria-hidden="true"
        />
        <span className={cn('font-medium', config.colors.text, sizeClasses[size].text)}>
          {config.label}
        </span>
      </div>
    );
  }

  // Badge and pill variants
  return (
    <Badge
      className={cn(
        baseClasses,
        sizeClasses[size].badge,
        variant === 'pill' && 'rounded-full',
        className
      )}
      role="status"
      aria-label={config.ariaLabel}
      title={config.ariaLabel}
      onClick={interactive ? onClick : undefined}
    >
      {showIcon && (
        <Icon
          className={cn(sizeClasses[size].icon, 'flex-shrink-0')}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{config.label}</span>
    </Badge>
  );
}

// Specialized variants for common use cases
interface UserStatusDotProps {
  status: UserStatus;
  enabled?: boolean;
  isActive?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function UserStatusDot({
  status,
  enabled = true,
  isActive = true,
  className,
  size = 'default',
}: UserStatusDotProps) {
  return (
    <UserStatusBadge
      status={status}
      enabled={enabled}
      isActive={isActive}
      className={className}
      size={size}
      variant="dot"
      showIcon={false}
    />
  );
}

interface UserStatusPillProps {
  status: UserStatus;
  enabled?: boolean;
  isActive?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

export function UserStatusPill({
  status,
  enabled = true,
  isActive = true,
  className,
  size = 'default',
  interactive = false,
  onClick,
}: UserStatusPillProps) {
  return (
    <UserStatusBadge
      status={status}
      enabled={enabled}
      isActive={isActive}
      className={className}
      size={size}
      variant="pill"
      interactive={interactive}
      onClick={onClick}
    />
  );
}

// Status indicator with additional user info
interface UserStatusIndicatorProps {
  status: UserStatus;
  enabled?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  className?: string;
  showLastLogin?: boolean;
}

export function UserStatusIndicator({
  status,
  enabled = true,
  isActive = true,
  lastLoginAt,
  className,
  showLastLogin = false,
}: UserStatusIndicatorProps) {
  const { t } = useTranslation();

  const formatLastLogin = (date: string) => {
    const loginDate = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - loginDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return t('userStatus.lastLogin.recently');
    } else if (diffInHours < 24) {
      return t('userStatus.lastLogin.hours', { hours: diffInHours });
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return t('userStatus.lastLogin.days', { days: diffInDays });
    }
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <UserStatusBadge
        status={status}
        enabled={enabled}
        isActive={isActive}
        size="sm"
      />

      {showLastLogin && lastLoginAt && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="h-3 w-3" />
          <span>{formatLastLogin(lastLoginAt)}</span>
        </div>
      )}
    </div>
  );
}

export default UserStatusBadge;