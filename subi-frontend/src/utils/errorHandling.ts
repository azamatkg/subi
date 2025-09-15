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

/**
 * Security-enhanced error handling utilities
 */
export const SecurityErrorHandler = {
  /**
   * Check if error indicates a security threat
   */
  isSecurityThreat: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as RTKQueryError).status;
      // Security-related status codes
      return typeof status === 'number' &&
             (status === 401 || status === 403 || status === 429 || status === 418);
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('unauthorized') ||
             message.includes('forbidden') ||
             message.includes('blocked') ||
             message.includes('suspicious') ||
             message.includes('rate limit') ||
             message.includes('csrf') ||
             message.includes('xss') ||
             message.includes('injection');
    }

    return false;
  },

  /**
   * Sanitize error message before displaying to user
   */
  sanitizeErrorMessage: (message: string): string => {
    if (!message || typeof message !== 'string') {
      return 'An unexpected error occurred';
    }

    // Remove potentially sensitive information
    return message
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]') // IP addresses
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '[UUID]') // UUIDs
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Email addresses
      .replace(/Bearer\s+[A-Za-z0-9-._~+/]+=*/g, '[TOKEN]') // Bearer tokens
      .replace(/password[:\s=]+[^\s]+/gi, 'password: [REDACTED]') // Passwords
      .replace(/secret[:\s=]+[^\s]+/gi, 'secret: [REDACTED]') // Secrets
      .replace(/key[:\s=]+[^\s]+/gi, 'key: [REDACTED]') // API keys
      .substring(0, 500); // Limit message length
  },

  /**
   * Check if error should be logged for security monitoring
   */
  shouldLogSecurityEvent: (error: unknown): boolean => {
    if (!SecurityErrorHandler.isSecurityThreat(error)) {
      return false;
    }

    // Always log security-related errors
    return true;
  },

  /**
   * Log security-related error event
   */
  logSecurityError: (error: unknown, context?: { userId?: string; action?: string; resource?: string }): void => {
    if (!SecurityErrorHandler.shouldLogSecurityEvent(error)) {
      return;
    }

    const sanitizedMessage = error instanceof Error
      ? SecurityErrorHandler.sanitizeErrorMessage(error.message)
      : 'Unknown security error';

    const securityEvent = {
      type: 'security_error' as const,
      details: sanitizedMessage,
      timestamp: new Date(),
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context,
      },
      severity: SecurityErrorHandler.getErrorSeverity(error),
    };

    // In production, this would send to a security monitoring service
    console.warn('[SECURITY ERROR]', securityEvent);

    // Store locally for debugging (in development only)
    if (process.env.NODE_ENV === 'development') {
      const logs = JSON.parse(localStorage.getItem('security-error-logs') || '[]');
      logs.push(securityEvent);
      // Keep only last 50 error logs
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }
      localStorage.setItem('security-error-logs', JSON.stringify(logs));
    }
  },

  /**
   * Determine error severity level
   */
  getErrorSeverity: (error: unknown): 'low' | 'medium' | 'high' | 'critical' => {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as RTKQueryError).status;

      if (status === 401) {
        return 'medium'; // Authentication required
      }
      if (status === 403) {
        return 'high';   // Forbidden access
      }
      if (status === 429) {
        return 'medium'; // Rate limited
      }
      if (status === 418) {
        return 'critical'; // I'm a teapot (often used for blocked requests)
      }
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('csrf') || message.includes('xss') || message.includes('injection')) {
        return 'critical';
      }
      if (message.includes('unauthorized') || message.includes('forbidden')) {
        return 'high';
      }
      if (message.includes('suspicious') || message.includes('blocked')) {
        return 'medium';
      }
    }

    return 'low';
  },

  /**
   * Handle security error with appropriate response
   */
  handleSecurityError: (
    error: unknown,
    context?: { userId?: string; action?: string; resource?: string }
  ): {
    shouldBlock: boolean;
    shouldRedirect: boolean;
    redirectTo?: string;
    userMessage: string;
  } => {
    SecurityErrorHandler.logSecurityError(error, context);

    const severity = SecurityErrorHandler.getErrorSeverity(error);
    const sanitizedMessage = error instanceof Error
      ? SecurityErrorHandler.sanitizeErrorMessage(error.message)
      : 'A security error occurred';

    switch (severity) {
      case 'critical':
        return {
          shouldBlock: true,
          shouldRedirect: true,
          redirectTo: '/security-error',
          userMessage: 'A critical security issue was detected. Please contact support.',
        };

      case 'high':
        return {
          shouldBlock: true,
          shouldRedirect: true,
          redirectTo: '/unauthorized',
          userMessage: 'Access denied. You do not have permission to perform this action.',
        };

      case 'medium':
        return {
          shouldBlock: true,
          shouldRedirect: false,
          userMessage: sanitizedMessage || 'Access temporarily restricted. Please try again later.',
        };

      case 'low':
      default:
        return {
          shouldBlock: false,
          shouldRedirect: false,
          userMessage: sanitizedMessage || 'An error occurred. Please try again.',
        };
    }
  },
};

/**
 * Request validation utilities
 */
export const RequestValidator = {
  /**
   * Validate API request parameters
   */
  validateRequestParams: (params: Record<string, unknown>): { isValid: boolean; sanitizedParams: Record<string, unknown>; errors: string[] } => {
    const errors: string[] = [];
    const sanitizedParams: Record<string, unknown> = {};

    Object.entries(params).forEach(([key, value]) => {
      // Validate parameter name
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
        errors.push(`Invalid parameter name: ${key}`);
        return;
      }

      // Sanitize string values
      if (typeof value === 'string') {
        const sanitized = InputSanitizer.sanitizeText(value);
        if (sanitized !== value) {
          errors.push(`Parameter ${key} contains potentially unsafe content`);
        }
        sanitizedParams[key] = sanitized;
      } else if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
        sanitizedParams[key] = value;
      } else if (Array.isArray(value)) {
        // Validate array elements
        const sanitizedArray = value.map(item => {
          if (typeof item === 'string') {
            return InputSanitizer.sanitizeText(item);
          }
          return item;
        });
        sanitizedParams[key] = sanitizedArray;
      } else {
        errors.push(`Unsupported parameter type for ${key}`);
      }
    });

    return {
      isValid: errors.length === 0,
      sanitizedParams,
      errors,
    };
  },

  /**
   * Validate request headers for security
   */
  validateRequestHeaders: (headers: Record<string, string>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    Object.entries(headers).forEach(([name, value]) => {
      // Check for header injection attempts
      if (name.includes('\n') || name.includes('\r') || value.includes('\n') || value.includes('\r')) {
        errors.push(`Header injection attempt detected in ${name}`);
      }

      // Validate Content-Type
      if (name.toLowerCase() === 'content-type') {
        const allowedTypes = [
          'application/json',
          'application/x-www-form-urlencoded',
          'multipart/form-data',
          'text/plain'
        ];

        const contentType = value.split(';')[0].trim();
        if (!allowedTypes.includes(contentType)) {
          errors.push(`Unsupported content type: ${contentType}`);
        }
      }

      // Check for suspicious header values
      if (typeof value === 'string') {
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /vbscript:/i,
          /on\w+=/i,
        ];

        if (suspiciousPatterns.some(pattern => pattern.test(value))) {
          errors.push(`Suspicious content detected in header ${name}`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
