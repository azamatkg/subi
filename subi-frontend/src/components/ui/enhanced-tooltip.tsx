import * as React from 'react';
import { AlertTriangle, HelpCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

export interface EnhancedTooltipProps {
  /** The content to show in the tooltip */
  content: React.ReactNode;
  /** The trigger element that will show the tooltip on hover */
  children: React.ReactNode;
  /** Side where tooltip appears */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of tooltip */
  align?: 'start' | 'center' | 'end';
  /** Delay before showing tooltip (ms) */
  delayDuration?: number;
  /** Whether to show arrow */
  showArrow?: boolean;
  /** Maximum width of tooltip content */
  maxWidth?: string;
  /** Variant styling */
  variant?: 'default' | 'help' | 'info' | 'warning';
  /** Additional CSS classes */
  className?: string;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /** Rich content with title and description */
  title?: string;
  /** Description text */
  description?: string;
  /** Keyboard shortcut to show */
  shortcut?: string;
}

/**
 * EnhancedTooltip - A wrapper around the base Tooltip with additional features
 *
 * Features:
 * - Rich content with title, description, and keyboard shortcuts
 * - Different variants (help, info, warning)
 * - Accessibility enhancements
 * - Consistent styling and behavior
 */
export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  maxWidth = '320px',
  variant = 'default',
  className,
  disabled = false,
  title,
  description,
  shortcut,
}) => {
  const { t } = useTranslation();

  if (disabled) {
    return <>{children}</>;
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'help':
        return 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100';
      case 'info':
        return 'bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100';
      default:
        return '';
    }
  };

  const renderContent = () => {
    // If using rich content (title/description)
    if (title || description || shortcut) {
      return (
        <div className="space-y-2">
          {title && (
            <div className="font-semibold text-sm leading-tight">
              {title}
            </div>
          )}
          {description && (
            <div className="text-xs leading-relaxed text-muted-foreground">
              {description}
            </div>
          )}
          {shortcut && (
            <div className="flex items-center gap-2 pt-1 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                {t('common.shortcut')}:
              </span>
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">
                {shortcut}
              </kbd>
            </div>
          )}
        </div>
      );
    }

    return content;
  };

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            'max-w-[320px] p-3 text-left',
            getVariantStyles(),
            className
          )}
          style={{ maxWidth }}
          sideOffset={8}
        >
          {renderContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * HelpTooltip - A specialized tooltip for help content
 */
export const HelpTooltip: React.FC<Omit<EnhancedTooltipProps, 'variant' | 'children'> & {
  /** Icon size */
  iconSize?: number;
  /** Whether to show as inline or block */
  inline?: boolean;
}> = ({
  iconSize = 16,
  inline = true,
  className,
  ...props
}) => {
  return (
    <EnhancedTooltip
      variant="help"
      {...props}
      className={cn(inline && 'inline-flex', className)}
    >
      <HelpCircle
        className={cn(
          'text-muted-foreground hover:text-foreground transition-colors cursor-help',
          inline && 'inline'
        )}
        size={iconSize}
        aria-label="Help"
      />
    </EnhancedTooltip>
  );
};

/**
 * InfoTooltip - A specialized tooltip for informational content
 */
export const InfoTooltip: React.FC<Omit<EnhancedTooltipProps, 'variant' | 'children'> & {
  /** Icon size */
  iconSize?: number;
  /** Whether to show as inline or block */
  inline?: boolean;
}> = ({
  iconSize = 16,
  inline = true,
  className,
  ...props
}) => {
  return (
    <EnhancedTooltip
      variant="info"
      {...props}
      className={cn(inline && 'inline-flex', className)}
    >
      <Info
        className={cn(
          'text-muted-foreground hover:text-foreground transition-colors cursor-help',
          inline && 'inline'
        )}
        size={iconSize}
        aria-label="Information"
      />
    </EnhancedTooltip>
  );
};

/**
 * WarningTooltip - A specialized tooltip for warning content
 */
export const WarningTooltip: React.FC<Omit<EnhancedTooltipProps, 'variant' | 'children'> & {
  /** Icon size */
  iconSize?: number;
  /** Whether to show as inline or block */
  inline?: boolean;
}> = ({
  iconSize = 16,
  inline = true,
  className,
  ...props
}) => {
  return (
    <EnhancedTooltip
      variant="warning"
      {...props}
      className={cn(inline && 'inline-flex', className)}
    >
      <AlertTriangle
        className={cn(
          'text-warning hover:text-warning/80 transition-colors cursor-help',
          inline && 'inline'
        )}
        size={iconSize}
        aria-label="Warning"
      />
    </EnhancedTooltip>
  );
};

/**
 * QuickTooltip - A simple tooltip for basic use cases
 */
export const QuickTooltip: React.FC<{
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}> = ({ content, children, side = 'top' }) => {
  return (
    <EnhancedTooltip
      content={content}
      side={side}
      delayDuration={200}
      maxWidth="240px"
    >
      {children}
    </EnhancedTooltip>
  );
};