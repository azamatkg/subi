/**
 * Accessibility utilities for ASUBK Financial Management System
 * Provides WCAG 2.1 AA compliant utilities and helpers
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Generate unique IDs for form elements and accessibility
 */
let idCounter = 0;
export function generateId(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Announce content to screen readers
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';

  document.body.appendChild(announcement);
  announcement.textContent = message;

  // Clean up after announcement
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.parentNode.removeChild(announcement);
    }
  }, 1000);
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private static lastFocusedElement: HTMLElement | null = null;

  static saveFocus() {
    this.lastFocusedElement = document.activeElement as HTMLElement;
  }

  static restoreFocus() {
    if (this.lastFocusedElement) {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
  }

  static trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  static getFirstFocusableElement(container: HTMLElement): HTMLElement | null {
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );
    return (focusableElements[0] as HTMLElement) || null;
  }
}

/**
 * Hook for focus trap functionality
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const cleanup = FocusManager.trapFocus(containerRef.current);
    const firstFocusable = FocusManager.getFirstFocusableElement(
      containerRef.current
    );

    if (firstFocusable) {
      firstFocusable.focus();
    }

    return cleanup;
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for announcing changes to screen readers
 */
export function useAnnouncement() {
  return useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      announceToScreenReader(message, priority);
    },
    []
  );
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardNavigation = {
  isNavigationKey(key: string): boolean {
    return [
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
      'PageUp',
      'PageDown',
    ].includes(key);
  },

  isActionKey(key: string): boolean {
    return ['Enter', ' ', 'Space'].includes(key);
  },

  isEscapeKey(key: string): boolean {
    return key === 'Escape' || key === 'Esc';
  },

  handleListNavigation(
    event: React.KeyboardEvent,
    items: NodeListOf<HTMLElement> | HTMLElement[],
    currentIndex: number,
    onSelectionChange: (index: number) => void
  ) {
    const itemArray = Array.from(items);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < itemArray.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : itemArray.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = itemArray.length - 1;
        break;
      default:
        return;
    }

    onSelectionChange(newIndex);
    itemArray[newIndex]?.focus();
  },
};

/**
 * ARIA helpers for financial status indicators
 */
export const AriaHelpers = {
  getStatusLabel(status: string, locale: string = 'ru'): string {
    const statusLabels: Record<string, Record<string, string>> = {
      ru: {
        SUBMITTED: 'Заявка подана',
        UNDER_COMPLETION: 'На доработке',
        UNDER_REVIEW: 'На рассмотрении',
        APPROVED: 'Одобрено',
        REJECTED: 'Отклонено',
        DRAFT: 'Черновик',
        ACTIVE: 'Активный',
        INACTIVE: 'Неактивный',
      },
      en: {
        SUBMITTED: 'Application submitted',
        UNDER_COMPLETION: 'Under completion',
        UNDER_REVIEW: 'Under review',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
        DRAFT: 'Draft',
        ACTIVE: 'Active',
        INACTIVE: 'Inactive',
      },
      kg: {
        SUBMITTED: 'Арыз берилди',
        UNDER_COMPLETION: 'Толуктоодо',
        UNDER_REVIEW: 'Карап жатат',
        APPROVED: 'Макулданды',
        REJECTED: 'Четке кагылды',
        DRAFT: 'Долбоор',
        ACTIVE: 'Активдүү',
        INACTIVE: 'Активдүү эмес',
      },
    };

    return statusLabels[locale]?.[status] || status;
  },

  /**
   * Get user status label based on status string for user management
   */
  getUserStatusLabel(status: string, locale: string = 'ru'): string {
    const statusLabels: Record<string, Record<string, string>> = {
      ru: {
        ACTIVE: 'Активный',
        INACTIVE: 'Неактивный',
        SUSPENDED: 'Заблокированный',
        UNKNOWN: 'Неизвестно',
      },
      en: {
        ACTIVE: 'Active',
        INACTIVE: 'Inactive',
        SUSPENDED: 'Suspended',
        UNKNOWN: 'Unknown',
      },
      kg: {
        ACTIVE: 'Активдүү',
        INACTIVE: 'Активдүү эмес',
        SUSPENDED: 'Блокталган',
        UNKNOWN: 'Белгисиз',
      },
    };

    // Handle null, undefined, or empty status
    if (!status || status.trim() === '') {
      return statusLabels[locale]?.['UNKNOWN'] || 'Unknown';
    }

    const normalizedStatus = status.toUpperCase().trim();
    const translatedStatus = statusLabels[locale]?.[normalizedStatus];

    // If translation exists, use it
    if (translatedStatus) {
      return translatedStatus;
    }

    // For unknown statuses, return fallback
    return statusLabels[locale]?.['UNKNOWN'] || 'Unknown';
  },

  getCurrencyLabel(
    amount: number,
    currency: string = 'KGS',
    locale: string = 'ru'
  ): string {
    const formatter = new Intl.NumberFormat(
      locale === 'ru' ? 'ru-KG' : locale,
      {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
      }
    );
    return formatter.format(amount);
  },

  getDateLabel(date: string | Date, locale: string = 'ru'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale === 'ru' ? 'ru-KG' : locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  getLoadingLabel(
    isLoading: boolean,
    context: string,
    locale: string = 'ru'
  ): string {
    if (!isLoading) return '';

    const loadingLabels: Record<string, string> = {
      ru: `Загружаю ${context}...`,
      en: `Loading ${context}...`,
      kg: `${context} жүктөлүүдө...`,
    };

    return loadingLabels[locale] || loadingLabels.ru;
  },
};

/**
 * Color contrast ratio calculator for accessibility compliance
 */
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real application, you'd use a proper color parsing library

  function getLuminance(color: string): number {
    // This is a simplified version - use a proper color library in production
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination meets WCAG guidelines
 */
export function meetsWCAGContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = level === 'AAA' ? 7 : 4.5;
  return ratio >= minRatio;
}

/**
 * Responsive breakpoint utilities for accessibility
 */
export const BreakpointUtils = {
  isMobile: () => window.innerWidth < 768,
  isTablet: () => window.innerWidth >= 768 && window.innerWidth < 1024,
  isDesktop: () => window.innerWidth >= 1024,

  // Media query hooks for responsive design
  useMediaQuery: (query: string): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  },
};
