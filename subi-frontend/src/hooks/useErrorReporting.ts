import { useCallback } from 'react';
import { useErrorContext } from '@/contexts/ErrorContext';

interface ErrorReport {
  error: Error;
  errorInfo?: React.ErrorInfo;
  context?: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  additionalData?: Record<string, unknown>;
}

interface ErrorReportingConfig {
  enableConsoleLogging?: boolean;
  enableRemoteReporting?: boolean;
  remoteEndpoint?: string;
  enableLocalStorage?: boolean;
  maxStoredErrors?: number;
  enableSentryReporting?: boolean;
}

const DEFAULT_CONFIG: ErrorReportingConfig = {
  enableConsoleLogging: true,
  enableRemoteReporting: false,
  enableLocalStorage: true,
  maxStoredErrors: 50,
  enableSentryReporting: false,
};

/**
 * Hook for consistent error reporting throughout the application
 */
export function useErrorReporting(config: ErrorReportingConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { trackErrorPattern } = useErrorContext();

  /**
   * Creates a comprehensive error report
   */
  const createErrorReport = useCallback((
    error: Error,
    errorInfo?: React.ErrorInfo,
    context?: string,
    additionalData?: Record<string, unknown>
  ): ErrorReport => {
    return {
      error,
      errorInfo,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      additionalData,
    };
  }, []);

  /**
   * Logs error to console with structured format
   */
  const logToConsole = useCallback((report: ErrorReport) => {
    if (!finalConfig.enableConsoleLogging) {
      return;
    }

    console.error(`🚨 Error Report - ${report.timestamp}`);
    console.error('Error:', report.error);

    if (report.errorInfo) {
      console.error('Error Info:', report.errorInfo);
    }

    if (report.context) {
      console.error('Context:', report.context);
    }

    console.error('URL:', report.url);
    console.error('User Agent:', report.userAgent);

    if (report.additionalData) {
      console.error('Additional Data:', report.additionalData);
    }

    console.error('--- End Error Report ---');
  }, [finalConfig.enableConsoleLogging]);

  /**
   * Stores error in localStorage for debugging
   */
  const storeLocally = useCallback((report: ErrorReport) => {
    if (!finalConfig.enableLocalStorage) {
      return;
    }

    try {
      const key = 'error_reports';
      const stored = localStorage.getItem(key);
      const reports: ErrorReport[] = stored ? JSON.parse(stored) : [];

      // Add new report
      reports.unshift({
        ...report,
        error: {
          name: report.error.name,
          message: report.error.message,
          stack: report.error.stack,
        } as { name: string; message: string; stack?: string }, // Serialize error object
      });

      // Keep only the most recent errors
      const trimmed = reports.slice(0, finalConfig.maxStoredErrors);

      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch (storageError) {
      console.warn('Failed to store error report locally:', storageError);
    }
  }, [finalConfig.enableLocalStorage, finalConfig.maxStoredErrors]);

  /**
   * Sends error report to remote endpoint
   */
  const reportRemotely = useCallback(async (report: ErrorReport) => {
    if (!finalConfig.enableRemoteReporting || !finalConfig.remoteEndpoint) {
      return;
    }

    try {
      await fetch(finalConfig.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...report,
          error: {
            name: report.error.name,
            message: report.error.message,
            stack: report.error.stack,
          },
        }),
      });
    } catch (networkError) {
      console.warn('Failed to send error report remotely:', networkError);
    }
  }, [finalConfig.enableRemoteReporting, finalConfig.remoteEndpoint]);

  /**
   * Reports error to Sentry (if available)
   */
  const reportToSentry = useCallback((report: ErrorReport) => {
    if (!finalConfig.enableSentryReporting || typeof window === 'undefined') {
      return;
    }

    // Check if Sentry is available
    // @ts-expect-error - Sentry is loaded globally in production
    if (window.Sentry) {
      // @ts-expect-error - Sentry global is injected at runtime in production
      window.Sentry.captureException(report.error, {
        contexts: {
          react: report.errorInfo,
          custom: report.additionalData,
        },
        tags: {
          context: report.context,
        },
      });
    }
  }, [finalConfig.enableSentryReporting]);

  /**
   * Main error reporting function
   */
  const reportError = useCallback(async (
    error: Error,
    errorInfo?: React.ErrorInfo,
    context?: string,
    additionalData?: Record<string, unknown>
  ) => {
    // Create comprehensive error report
    const report = createErrorReport(error, errorInfo, context, additionalData);

    // Track error patterns
    trackErrorPattern(error.name);

    if (error.message.toLowerCase().includes('network')) {
      trackErrorPattern('network_error');
    }

    // Execute all reporting methods
    const reportingTasks = [
      logToConsole(report),
      storeLocally(report),
      reportRemotely(report),
      reportToSentry(report),
    ];

    try {
      await Promise.allSettled(reportingTasks);
    } catch (reportingError) {
      console.error('Error during error reporting:', reportingError);
    }
  }, [createErrorReport, trackErrorPattern, logToConsole, storeLocally, reportRemotely, reportToSentry]);

  /**
   * Retrieves stored error reports from localStorage
   */
  const getStoredReports = useCallback((): ErrorReport[] => {
    if (!finalConfig.enableLocalStorage) {
      return [];
    }

    try {
      const stored = localStorage.getItem('error_reports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [finalConfig.enableLocalStorage]);

  /**
   * Clears stored error reports
   */
  const clearStoredReports = useCallback(() => {
    if (!finalConfig.enableLocalStorage) {
      return;
    }

    try {
      localStorage.removeItem('error_reports');
    } catch (clearError) {
      console.warn('Failed to clear stored error reports:', clearError);
    }
  }, [finalConfig.enableLocalStorage]);

  /**
   * Reports an unhandled error with minimal context
   */
  const reportUnhandledError = useCallback((error: Error, context = 'unhandled') => {
    reportError(error, undefined, context, {
      unhandled: true,
      errorType: 'unhandled_error',
    });
  }, [reportError]);

  /**
   * Reports a component error with React error boundary info
   */
  const reportComponentError = useCallback((error: Error, errorInfo: React.ErrorInfo, componentName?: string) => {
    reportError(error, errorInfo, `component:${componentName || 'unknown'}`, {
      componentName,
      errorType: 'component_error',
    });
  }, [reportError]);

  /**
   * Reports an API error with request context
   */
  const reportApiError = useCallback((error: Error, endpoint?: string, method?: string, status?: number) => {
    reportError(error, undefined, 'api_error', {
      endpoint,
      method,
      status,
      errorType: 'api_error',
    });
  }, [reportError]);

  return {
    reportError,
    reportUnhandledError,
    reportComponentError,
    reportApiError,
    getStoredReports,
    clearStoredReports,
    config: finalConfig,
  };
}

/**
 * Error reporting utilities
 */
export const ErrorReportingUtils = {
  /**
   * Extracts meaningful error information
   */
  extractErrorInfo: (error: unknown): { message: string; stack?: string; name: string } => {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (typeof error === 'string') {
      return {
        name: 'StringError',
        message: error,
      };
    }

    if (error && typeof error === 'object') {
      return {
        name: 'ObjectError',
        message: JSON.stringify(error),
      };
    }

    return {
      name: 'UnknownError',
      message: String(error),
    };
  },

  /**
   * Determines error severity
   */
  getErrorSeverity: (error: Error): 'low' | 'medium' | 'high' | 'critical' => {
    const message = error.message.toLowerCase();

    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }

    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 'high';
    }

    if (message.includes('network') || message.includes('timeout')) {
      return 'medium';
    }

    return 'low';
  },

  /**
   * Anonymizes sensitive data in error reports
   */
  sanitizeErrorData: (data: unknown): unknown => {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth', 'credential'];
    const sanitized = { ...data };

    for (const [key, value] of Object.entries(sanitized)) {
      const lowerKey = key.toLowerCase();

      if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = ErrorReportingUtils.sanitizeErrorData(value);
      }
    }

    return sanitized;
  },
};