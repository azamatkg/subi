import { toast } from 'sonner';

// API Error Response format from manual
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}

// RTK Query Error format
export interface RTKQueryError {
  status: number | string;
  data?: ApiErrorResponse;
  error?: string;
  message?: string;
}

/**
 * Handles API errors according to the documented format
 * Supports both validation errors and general errors
 * Shows appropriate toast messages and returns structured error info
 */
export function handleApiError(
  error: unknown,
  translateFn?: (key: string, options?: Record<string, unknown>) => string
): {
  message: string;
  validationErrors?: Record<string, string>;
  status?: number;
} {
  const t = translateFn || ((key: string) => key);

  // Handle RTK Query errors
  if (error && typeof error === 'object' && 'status' in error) {
    const rtkError = error as RTKQueryError;
    const apiError = rtkError.data;

    if (
      apiError?.validationErrors &&
      Object.keys(apiError.validationErrors).length > 0
    ) {
      // Handle validation errors
      const validationMessages = Object.entries(apiError.validationErrors)
        .map(([field, message]) => `${field}: ${message}`)
        .join('\n');

      toast.error(t('common.validationErrors'), {
        description: validationMessages,
        duration: 6000,
      });

      return {
        message: apiError.message || t('common.validationFailed'),
        validationErrors: apiError.validationErrors,
        status: apiError.status,
      };
    } else if (apiError?.message) {
      // Handle general API errors
      const message = apiError.message;
      toast.error(message);

      return {
        message,
        status: apiError.status,
      };
    } else if (rtkError.status === 401) {
      // Handle authentication errors
      const message = t('errors.unauthorized');
      toast.error(message);
      return { message, status: 401 };
    } else if (rtkError.status === 403) {
      // Handle authorization errors
      const message = t('errors.forbidden');
      toast.error(message);
      return { message, status: 403 };
    } else if (rtkError.status === 404) {
      // Handle not found errors
      const message = t('errors.notFound');
      toast.error(message);
      return { message, status: 404 };
    } else if (rtkError.status === 409) {
      // Handle conflict errors
      const message = t('errors.conflict');
      toast.error(message);
      return { message, status: 409 };
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    const message = t('errors.networkError');
    toast.error(message);
    return { message };
  }

  // Handle generic errors
  const genericMessage = (error as Error)?.message || t('errors.genericError');
  toast.error(genericMessage);

  return { message: genericMessage };
}

/**
 * Extracts field-specific validation errors for form field highlighting
 */
export function getFieldErrors(
  validationErrors?: Record<string, string>
): Record<string, string> {
  if (!validationErrors) {
    return {};
  }

  // Transform field names to match form field names if needed
  const fieldMapping: Record<string, string> = {
    username: 'username',
    email: 'email',
    password: 'password',
    firstName: 'firstName',
    lastName: 'lastName',
    phone: 'phone',
    department: 'department',
    enabled: 'enabled',
  };

  const mappedErrors: Record<string, string> = {};
  Object.entries(validationErrors).forEach(([apiField, message]) => {
    const formField = fieldMapping[apiField] || apiField;
    mappedErrors[formField] = message;
  });

  return mappedErrors;
}

/**
 * Shows success message with consistent formatting
 */
export function showSuccessMessage(
  message: string,
  description?: string
): void {
  toast.success(message, {
    description,
    duration: 4000,
  });
}

/**
 * Shows warning message with consistent formatting
 */
export function showWarningMessage(
  message: string,
  description?: string
): void {
  toast.warning(message, {
    description,
    duration: 5000,
  });
}

/**
 * Shows informational message with consistent formatting
 */
export function showInfoMessage(
  message: string,
  description?: string
): void {
  toast.info(message, {
    description,
    duration: 3000,
  });
}

/**
 * Input sanitization utilities for user management forms
 */
export const InputSanitizer = {
  /**
   * Sanitize text input to prevent XSS and normalize whitespace
   */
  sanitizeText: (input: string | undefined | null): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[\r\n\t]/g, ' ') // Replace line breaks and tabs with spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .replace(/[<>"'&]/g, ''); // Remove potentially dangerous HTML characters
  },

  /**
   * Sanitize username input with specific rules
   */
  sanitizeUsername: (input: string | undefined | null): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '') // Only allow alphanumeric and underscore
      .substring(0, 50); // Enforce max length
  },

  /**
   * Sanitize email input
   */
  sanitizeEmail: (input: string | undefined | null): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .toLowerCase()
      .substring(0, 255); // Enforce max length
  },

  /**
   * Sanitize phone number input
   */
  sanitizePhone: (input: string | undefined | null): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[^+\d\s-()]/g, '') // Only allow digits, plus, spaces, hyphens, parentheses
      .substring(0, 20); // Enforce reasonable max length
  },
};

/**
 * Enhanced validation utilities
 */
export const ValidationUtils = {
  /**
   * Validate date range inputs
   */
  validateDateRange: (fromDate: string, toDate: string): { isValid: boolean; error?: string } => {
    if (!fromDate && !toDate) {
      return { isValid: true };
    }

    if (fromDate && !toDate) {
      return { isValid: true };
    }

    if (!fromDate && toDate) {
      return { isValid: true };
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }

    if (from > to) {
      return { isValid: false, error: 'From date must be before to date' };
    }

    // Check if date range is reasonable (not more than 10 years)
    const maxRangeMs = 10 * 365 * 24 * 60 * 60 * 1000; // 10 years in milliseconds
    if (to.getTime() - from.getTime() > maxRangeMs) {
      return { isValid: false, error: 'Date range too large (maximum 10 years)' };
    }

    return { isValid: true };
  },

  /**
   * Validate bulk operation selections
   */
  validateBulkSelection: (selectedIds: string[], maxSelection = 100): { isValid: boolean; error?: string } => {
    if (selectedIds.length === 0) {
      return { isValid: false, error: 'No items selected' };
    }

    if (selectedIds.length > maxSelection) {
      return { isValid: false, error: `Too many items selected (maximum ${maxSelection})` };
    }

    // Check for duplicate IDs
    const uniqueIds = new Set(selectedIds);
    if (uniqueIds.size !== selectedIds.length) {
      return { isValid: false, error: 'Duplicate selections detected' };
    }

    return { isValid: true };
  },

  /**
   * Validate search term for security and performance
   */
  validateSearchTerm: (searchTerm: string): { isValid: boolean; error?: string } => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return { isValid: true };
    }

    const trimmed = searchTerm.trim();

    if (trimmed.length < 2) {
      return { isValid: false, error: 'Search term must be at least 2 characters' };
    }

    if (trimmed.length > 100) {
      return { isValid: false, error: 'Search term too long (maximum 100 characters)' };
    }

    // Check for potential SQL injection patterns
    const suspiciousPatterns = [
      /['"]/,
      /;\s*(DROP|DELETE|INSERT|UPDATE|EXEC|UNION)/i,
      /-{2,}/,
      /\/\*/,
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(trimmed))) {
      return { isValid: false, error: 'Invalid characters in search term' };
    }

    return { isValid: true };
  },
};

/**
 * Network error recovery utilities
 */
export const NetworkErrorRecovery = {
  /**
   * Check if error is retryable
   */
  isRetryableError: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as RTKQueryError).status;
      // Retry on network errors, server errors, and timeouts
      return status === 'FETCH_ERROR' ||
             status === 'PARSING_ERROR' ||
             (typeof status === 'number' && (status >= 500 || status === 408 || status === 429));
    }
    return false;
  },

  /**
   * Get retry delay with exponential backoff
   */
  getRetryDelay: (attemptNumber: number, baseDelay = 1000): number => {
    return Math.min(baseDelay * Math.pow(2, attemptNumber), 30000); // Max 30 seconds
  },

  /**
   * Create retry function with exponential backoff
   */
  createRetryFunction: <T>(
    operation: () => Promise<T>,
    maxAttempts = 3,
    baseDelay = 1000
  ) => {
    return async (): Promise<T> => {
      let lastError: unknown;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          return await operation();
        } catch (error) {
          lastError = error;

          if (!NetworkErrorRecovery.isRetryableError(error) || attempt === maxAttempts - 1) {
            throw error;
          }

          const delay = NetworkErrorRecovery.getRetryDelay(attempt, baseDelay);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      throw lastError;
    };
  },
};
