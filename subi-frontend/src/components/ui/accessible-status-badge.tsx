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
  status: string;
  locale?: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function AccessibleStatusBadge({
  status,
  locale = 'ru',
  className,
  showIcon = true,
  size = 'default',
}: AccessibleStatusBadgeProps) {
  const getStatusVariant = () => {
    // Return 'default' for all statuses - we'll handle custom colors via className
    return 'default' as const;
  };

  const getStatusIcon = (status: string) => {
    const iconClass = cn(
      'flex-shrink-0',
      size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
    );

    switch (status.toUpperCase()) {
      case 'APPROVED':
        return (
          <CheckCircle
            className={cn(iconClass, 'text-emerald-600 dark:text-emerald-400')}
            aria-hidden="true"
          />
        );
      case 'REJECTED':
        return (
          <XCircle
            className={cn(iconClass, 'text-red-600 dark:text-red-400')}
            aria-hidden="true"
          />
        );
      case 'UNDER_REVIEW':
      case 'UNDER_COMPLETION':
        return (
          <AlertCircle
            className={cn(iconClass, 'text-amber-600 dark:text-amber-400')}
            aria-hidden="true"
          />
        );
      case 'SUBMITTED':
        return (
          <Clock
            className={cn(iconClass, 'text-blue-600 dark:text-blue-400')}
            aria-hidden="true"
          />
        );
      case 'DRAFT':
        return (
          <FileText
            className={cn(iconClass, 'text-slate-600 dark:text-slate-400')}
            aria-hidden="true"
          />
        );
      default:
        return (
          <Clock
            className={cn(iconClass, 'text-slate-600 dark:text-slate-400')}
            aria-hidden="true"
          />
        );
    }
  };

  const statusLabel = AriaHelpers.getStatusLabel(status, locale);
  const variant = getStatusVariant();

  // Enhanced status-specific color schemes
  const getStatusColors = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
      case 'ACTIVE':
        return [
          'bg-emerald-50 text-emerald-700 border-emerald-200',
          'dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
          'hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
        ];
      case 'REJECTED':
      case 'INACTIVE':
        return [
          'bg-red-50 text-red-700 border-red-200',
          'dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
          'hover:bg-red-100 dark:hover:bg-red-900/30',
        ];
      case 'PENDING_CONFIRMATION':
      case 'UNDER_REVIEW':
      case 'UNDER_COMPLETION':
        return [
          'bg-amber-50 text-amber-700 border-amber-200',
          'dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
          'hover:bg-amber-100 dark:hover:bg-amber-900/30',
        ];
      case 'DRAFT':
        return [
          'bg-slate-50 text-slate-600 border-slate-200',
          'dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800',
          'hover:bg-slate-100 dark:hover:bg-slate-900/30',
        ];
      default:
        return [
          'bg-blue-50 text-blue-700 border-blue-200',
          'dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
          'hover:bg-blue-100 dark:hover:bg-blue-900/30',
        ];
    }
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        'inline-flex items-center gap-2 font-semibold transition-all duration-200 border',
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'default' && 'px-3 py-1.5 text-sm',
        size === 'lg' && 'px-4 py-2 text-base',
        ...getStatusColors(status),
        className
      )}
      // ARIA attributes for accessibility
      role="status"
      aria-label={`Статус: ${statusLabel}`}
      title={statusLabel}
    >
      {showIcon && getStatusIcon(status)}
      <span className="truncate">{statusLabel}</span>
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
      role="status"
      aria-live="polite"
      aria-label={loadingMessage}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent opacity-60',
          spinnerSize
        )}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-muted-foreground">
        {loadingMessage}
      </span>
    </div>
  );
}
