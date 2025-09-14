import React, { useContext } from 'react';
import { ErrorContext } from '@/contexts/ErrorContext';

/**
 * Hook to access error context
 */
export function useErrorContext() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

/**
 * Hook for handling errors in components
 */
export function useErrorHandler(componentId: string) {
  const { addError, clearError, incrementRetry, resetRetry, getRetryCount, canRetry, hasError, getError } = useErrorContext();

  const handleError = React.useCallback((error: Error) => {
    console.error(`Error in component ${componentId}:`, error);
    addError(componentId, error);
  }, [componentId, addError]);

  const clearComponentError = React.useCallback(() => {
    clearError(componentId);
  }, [clearError, componentId]);

  const retry = React.useCallback(() => {
    if (canRetry(componentId)) {
      incrementRetry(componentId);
      clearError(componentId);
      return true;
    }
    return false;
  }, [canRetry, componentId, incrementRetry, clearError]);

  const reset = React.useCallback(() => {
    resetRetry(componentId);
    clearError(componentId);
  }, [resetRetry, clearError, componentId]);

  return {
    handleError,
    clearError: clearComponentError,
    retry,
    reset,
    retryCount: getRetryCount(componentId),
    maxRetriesReached: !canRetry(componentId),
    hasError: hasError(componentId),
    error: getError(componentId),
  };
}

/**
 * Error recovery utilities
 */
export const ErrorRecoveryUtils = {
  /**
   * Determines if an error is recoverable
   */
  isRecoverableError: (error: Error): boolean => {
    const message = error.message.toLowerCase();
    const recoverablePatterns = [
      'network error',
      'timeout',
      'fetch failed',
      'connection refused',
      'temporary failure',
    ];

    return recoverablePatterns.some(pattern => message.includes(pattern));
  },

  /**
   * Gets appropriate retry delay based on attempt count
   */
  getRetryDelay: (attemptCount: number): number => {
    // Exponential backoff: 1s, 2s, 4s, 8s
    return Math.min(1000 * Math.pow(2, attemptCount), 8000);
  },

  /**
   * Creates a user-friendly error message
   */
  getUserFriendlyMessage: (error: Error): string => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'Проблемы с подключением к сети. Проверьте интернет-соединение.';
    }

    if (message.includes('timeout')) {
      return 'Превышено время ожидания. Попробуйте еще раз.';
    }

    if (message.includes('unauthorized') || message.includes('403')) {
      return 'Недостаточно прав для выполнения операции.';
    }

    if (message.includes('not found') || message.includes('404')) {
      return 'Запрашиваемый ресурс не найден.';
    }

    if (message.includes('server') || message.includes('500')) {
      return 'Ошибка сервера. Попробуйте позже.';
    }

    return 'Произошла неожиданная ошибка. Попробуйте обновить страницу.';
  },
};