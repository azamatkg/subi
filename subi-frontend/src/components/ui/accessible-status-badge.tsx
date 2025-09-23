import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AriaHelpers } from '@/lib/accessibility';
import { cn } from '@/lib/utils';

interface AccessibleStatusBadgeProps {
  status: string | undefined | null;
  locale?: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
  // User status mode - when provided, uses isActive/enabled instead of status
  isActive?: boolean;
  enabled?: boolean; // Add support for 'enabled' field from API
  mode?: 'default' | 'user';
}

export function AccessibleStatusBadge({
  status,
  locale = 'ru',
  className,
  showIcon = true,
  size = 'default',
  isActive,
  enabled,
  mode = 'default',
}: AccessibleStatusBadgeProps) {
  // For user mode, use the status field if available, fallback to enabled/isActive
  const effectiveStatus =
    mode === 'user'
      ? status && status.trim() !== ''
        ? status.toUpperCase()
        : enabled !== undefined
          ? enabled
            ? 'ACTIVE'
            : 'INACTIVE'
          : isActive !== undefined
            ? isActive
              ? 'ACTIVE'
              : 'INACTIVE'
            : 'UNKNOWN'
      : status && status.trim() !== ''
        ? status
        : 'UNKNOWN';

  const getStatusVariant = () => {
    // Return 'default' for all statuses - we'll handle custom colors via className
    return 'default' as const;
  };

  const getStatusIcon = () => {
    const iconClass = cn(
      'flex-shrink-0',
      size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
    );

    switch (effectiveStatus.toUpperCase()) {
      case 'APPROVED':
      case 'ACTIVE':
        return (
          <CheckCircle
            className={cn(iconClass, 'text-success-600')}
            aria-hidden='true'
          />
        );
      case 'REJECTED':
      case 'INACTIVE':
        return (
          <XCircle
            className={cn(iconClass, 'text-destructive-600')}
            aria-hidden='true'
          />
        );
      case 'SUSPENDED':
        return (
          <XCircle
            className={cn(iconClass, 'text-warning-600')}
            aria-hidden='true'
          />
        );
      case 'PENDING_CONFIRMATION':
      case 'UNDER_REVIEW':
      case 'UNDER_COMPLETION':
        return (
          <AlertCircle
            className={cn(iconClass, 'text-warning-600')}
            aria-hidden='true'
          />
        );
      case 'SUBMITTED':
        return (
          <Clock
            className={cn(iconClass, 'text-info-600')}
            aria-hidden='true'
          />
        );
      case 'DRAFT':
        return (
          <FileText
            className={cn(iconClass, 'text-neutral-600')}
            aria-hidden='true'
          />
        );
      case 'UNKNOWN':
        return (
          <AlertCircle
            className={cn(iconClass, 'text-muted-foreground')}
            aria-hidden='true'
          />
        );
      default:
        return (
          <AlertCircle
            className={cn(iconClass, 'text-muted-foreground')}
            aria-hidden='true'
          />
        );
    }
  };

  // Use appropriate label function based on mode
  const statusLabel =
    mode === 'user'
      ? AriaHelpers.getUserStatusLabel(effectiveStatus, locale)
      : AriaHelpers.getStatusLabel(effectiveStatus, locale);
  const variant = getStatusVariant();

  // Enhanced status-specific color schemes using semantic color system
  const getStatusColors = () => {
    switch (effectiveStatus.toUpperCase()) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-status-approved-bg text-status-approved border-status-approved-border hover:bg-success-100 transition-colors';
      case 'REJECTED':
      case 'INACTIVE':
        return 'bg-status-rejected-bg text-status-rejected border-status-rejected-border hover:bg-destructive-100 transition-colors';
      case 'SUSPENDED':
        return 'bg-status-pending-bg text-status-pending border-status-pending-border hover:bg-warning-100 transition-colors';
      case 'PENDING_CONFIRMATION':
      case 'UNDER_REVIEW':
      case 'UNDER_COMPLETION':
        return 'bg-status-pending-bg text-status-pending border-status-pending-border hover:bg-warning-100 transition-colors';
      case 'SUBMITTED':
        return 'bg-status-submitted-bg text-status-submitted border-status-submitted-border hover:bg-info-100 transition-colors';
      case 'DRAFT':
        return 'bg-status-draft-bg text-status-draft border-status-draft-border hover:bg-neutral-100 transition-colors';
      case 'UNKNOWN':
        return 'bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted/80 transition-colors';
      default:
        return 'bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted/80 transition-colors';
    }
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        'inline-flex items-center gap-2 font-semibold border shadow-sm',
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'default' && 'px-3 py-1.5 text-sm',
        size === 'lg' && 'px-4 py-2 text-base',
        getStatusColors(),
        className
      )}
      // ARIA attributes for accessibility
      role='status'
      aria-label={`Статус: ${statusLabel}`}
      title={statusLabel}
    >
      {showIcon && getStatusIcon()}
      <span className='truncate'>{statusLabel}</span>
    </Badge>
  );
}

/**
 * Financial amount display with proper accessibility
 */
interface AccessibleAmountProps {
  amount: number;
  currency?: string;
  locale?: string;
  className?: string;
  showCurrency?: boolean;
}

export function AccessibleAmount({
  amount,
  currency = 'KGS',
  locale = 'ru',
  className,
  showCurrency = true,
}: AccessibleAmountProps) {
  const formattedAmount = AriaHelpers.getCurrencyLabel(
    amount,
    currency,
    locale
  );

  return (
    <span
      className={cn('font-medium tabular-nums', className)}
      aria-label={`Сумма: ${formattedAmount}`}
      title={formattedAmount}
    >
      {showCurrency ? formattedAmount : amount.toLocaleString(locale)}
    </span>
  );
}

/**
 * Accessible date display component
 */
interface AccessibleDateProps {
  date: string | Date;
  locale?: string;
  format?: 'short' | 'medium' | 'long';
  className?: string;
}

export function AccessibleDate({
  date,
  locale = 'ru',
  format = 'medium',
  className,
}: AccessibleDateProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: '2-digit', month: 'numeric', day: 'numeric' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
  };

  const formattedDate = dateObj.toLocaleDateString(
    locale === 'ru' ? 'ru-KG' : locale,
    formatOptions[format]
  );

  const isoDate = dateObj.toISOString().split('T')[0];

  return (
    <time
      dateTime={isoDate}
      className={cn('text-sm text-muted-foreground', className)}
      aria-label={`Дата: ${formattedDate}`}
      title={formattedDate}
    >
      {formattedDate}
    </time>
  );
}

/**
 * Loading indicator with proper accessibility
 */
interface AccessibleLoadingProps {
  context?: string;
  locale?: string;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function AccessibleLoading({
  context = 'данные',
  locale = 'ru',
  size = 'default',
  className,
}: AccessibleLoadingProps) {
  const loadingMessage = AriaHelpers.getLoadingLabel(true, context, locale);

  const spinnerSize = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size];

  return (
    <div
      className={cn('flex items-center justify-center gap-3', className)}
      role='status'
      aria-live='polite'
      aria-label={loadingMessage}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent opacity-60',
          spinnerSize
        )}
        aria-hidden='true'
      />
      <span className='text-sm font-medium text-muted-foreground'>
        {loadingMessage}
      </span>
    </div>
  );
}
