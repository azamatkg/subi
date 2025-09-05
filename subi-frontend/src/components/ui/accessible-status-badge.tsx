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
  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'default' as const; // Will be styled as success
      case 'REJECTED':
        return 'destructive' as const;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'UNDER_COMPLETION':
        return 'secondary' as const;
      case 'DRAFT':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
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
  const variant = getStatusVariant(status);

  return (
    <Badge
      variant={variant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium transition-colors',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'lg' && 'px-3 py-1 text-base',
        // Enhanced styling for approved status
        status.toUpperCase() === 'APPROVED' && [
          'bg-emerald-100 text-emerald-800 border-emerald-200',
          'dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800',
          'hover:bg-emerald-200 dark:hover:bg-emerald-900/30',
        ],
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
