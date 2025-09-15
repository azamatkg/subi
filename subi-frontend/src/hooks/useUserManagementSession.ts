import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { useSecurityValidation } from './useSecurityValidation';

// User management specific session storage keys
const USER_MANAGEMENT_STORAGE = {
  FORM_BACKUP: 'user_management_form_backup',
  BULK_OPERATION_STATE: 'user_management_bulk_state',
  SESSION_RECOVERY_DATA: 'user_management_session_recovery',
} as const;

export interface UserManagementFormData {
  formId: string;
  formData: Record<string, unknown>;
  timestamp: number;
  pageUrl: string;
}

export interface BulkOperationState {
  operationType: 'delete' | 'updateStatus' | 'updateRoles' | 'export';
  selectedIds: string[];
  operationData?: Record<string, unknown>;
  progress?: {
    total: number;
    completed: number;
    failed: string[];
  };
  timestamp: number;
}

export interface SessionRecoveryData {
  formBackups: UserManagementFormData[];
  bulkOperation?: BulkOperationState;
  navigationState?: {
    currentPage: string;
    filters?: Record<string, unknown>;
    pagination?: {
      page: number;
      limit: number;
    };
  };
  lastActivity: number;
}

export interface UseUserManagementSessionOptions {
  autoBackupForms?: boolean;
  backupInterval?: number;
  maxBackupAge?: number;
  enableBulkOperationProtection?: boolean;
}

export interface UseUserManagementSessionReturn {
  // Form backup management
  backupFormData: (formId: string, data: Record<string, unknown>) => void;
  restoreFormData: (formId: string) => Record<string, unknown> | null;
  clearFormBackup: (formId: string) => void;
  hasFormBackup: (formId: string) => boolean;

  // Bulk operation management
  saveBulkOperationState: (state: BulkOperationState) => void;
  restoreBulkOperationState: () => BulkOperationState | null;
  clearBulkOperationState: () => void;
  hasPendingBulkOperation: boolean;

  // Session recovery
  getSessionRecoveryData: () => SessionRecoveryData | null;
  clearSessionRecovery: () => void;

  // Session timeout handling
  sessionSecurity: ReturnType<typeof useSecurityValidation>['sessionSecurity'];
  onSessionWarning: (callback: () => void) => void;
  onSessionExpiry: (callback: () => void) => void;
  extendSession: () => void;

  // Session state
  isSessionHealthy: boolean;
  timeUntilExpiry: number;
  shouldShowWarning: boolean;
}

export const useUserManagementSession = (
  options: UseUserManagementSessionOptions = {}
): UseUserManagementSessionReturn => {
  // Memoize options to prevent re-renders when options object is recreated
  const memoizedOptions = useMemo(() => ({
    autoBackupForms: options.autoBackupForms ?? true,
    backupInterval: options.backupInterval ?? 30000, // 30 seconds
    maxBackupAge: options.maxBackupAge ?? 24 * 60 * 60 * 1000, // 24 hours
    enableBulkOperationProtection: options.enableBulkOperationProtection ?? true,
  }), [options.autoBackupForms, options.backupInterval, options.maxBackupAge, options.enableBulkOperationProtection]);

  const {
    autoBackupForms,
    backupInterval,
    maxBackupAge,
    enableBulkOperationProtection,
  } = memoizedOptions;

  useAuth();

  // Memoize security validation options to prevent re-renders
  const securityOptions = useMemo(() => ({
    enableSessionMonitoring: true,
    enableIdleDetection: true,
  }), []);

  const { sessionSecurity, refreshSession } = useSecurityValidation(securityOptions);

  const [hasPendingBulkOperation, setHasPendingBulkOperation] = useState(false);
  const [isSessionHealthy, setIsSessionHealthy] = useState(true);

  // Callback refs for session events
  const sessionWarningCallbackRef = useRef<(() => void) | null>(null);
  const sessionExpiryCallbackRef = useRef<(() => void) | null>(null);

  // Auto-cleanup interval ref
  const cleanupIntervalRef = useRef<NodeJS.Timeout>();

  // Get current page URL for context
  const getCurrentPageUrl = useCallback(() => {
    return window.location.pathname + window.location.search;
  }, []);

  // Session recovery functions (moved up to avoid circular dependency)
  const getSessionRecoveryData = useCallback((): SessionRecoveryData | null => {
    try {
      const dataJson = localStorage.getItem(USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA);
      if (!dataJson) {
        return null;
      }

      return JSON.parse(dataJson) as SessionRecoveryData;
    } catch (error) {
      console.warn('Failed to get session recovery data:', error);
      return null;
    }
  }, []);

  // Form backup functions - ordered to avoid circular dependencies
  const clearFormBackup = useCallback((formId: string) => {
    try {
      const recoveryData = getSessionRecoveryData();
      if (!recoveryData) {
        return;
      }

      const updatedBackups = recoveryData.formBackups.filter(b => b.formId !== formId);
      const updatedRecoveryData = {
        ...recoveryData,
        formBackups: updatedBackups,
      };

      localStorage.setItem(
        USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA,
        JSON.stringify(updatedRecoveryData)
      );
    } catch (error) {
      console.warn('Failed to clear form backup:', error);
    }
  }, [getSessionRecoveryData]);

  const restoreFormData = useCallback((formId: string): Record<string, unknown> | null => {
    try {
      const recoveryData = getSessionRecoveryData();
      if (!recoveryData) {
        return null;
      }

      const backup = recoveryData.formBackups.find(b => b.formId === formId);
      if (!backup) {
        return null;
      }

      // Check if backup is not too old
      const age = Date.now() - backup.timestamp;
      if (age > maxBackupAge) {
        clearFormBackup(formId);
        return null;
      }

      return backup.formData;
    } catch (error) {
      console.warn('Failed to restore form data:', error);
      return null;
    }
  }, [maxBackupAge, getSessionRecoveryData, clearFormBackup]);

  const backupFormData = useCallback((formId: string, data: Record<string, unknown>) => {
    if (!autoBackupForms) {
      return;
    }

    try {
      // Get current recovery data directly to avoid circular dependency
      const currentRecoveryData = (() => {
        try {
          const dataJson = localStorage.getItem(USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA);
          return dataJson ? JSON.parse(dataJson) as SessionRecoveryData : null;
        } catch (error) {
          console.warn('Failed to get session recovery data:', error);
          return null;
        }
      })();

      const existingBackups = currentRecoveryData?.formBackups || [];
      const backup: UserManagementFormData = {
        formId,
        formData: data,
        timestamp: Date.now(),
        pageUrl: getCurrentPageUrl(),
      };

      // Remove existing backup for this form
      const filteredBackups = existingBackups.filter(b => b.formId !== formId);
      const updatedBackups = [...filteredBackups, backup];

      const recoveryData: SessionRecoveryData = {
        ...currentRecoveryData,
        formBackups: updatedBackups,
        lastActivity: Date.now(),
      };

      localStorage.setItem(
        USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA,
        JSON.stringify(recoveryData)
      );
    } catch (error) {
      console.warn('Failed to backup form data:', error);
    }
  }, [autoBackupForms, getCurrentPageUrl]);

  const hasFormBackup = useCallback((formId: string): boolean => {
    const recoveryData = getSessionRecoveryData();
    if (!recoveryData) {
      return false;
    }

    return recoveryData.formBackups.some(b => b.formId === formId);
  }, [getSessionRecoveryData]);

  // Bulk operation functions
  const clearBulkOperationState = useCallback(() => {
    try {
      localStorage.removeItem(USER_MANAGEMENT_STORAGE.BULK_OPERATION_STATE);
      setHasPendingBulkOperation(false);

      // Get current recovery data directly to avoid circular dependency
      const currentRecoveryData = (() => {
        try {
          const dataJson = localStorage.getItem(USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA);
          return dataJson ? JSON.parse(dataJson) as SessionRecoveryData : null;
        } catch (error) {
          console.warn('Failed to get session recovery data:', error);
          return null;
        }
      })();

      // Also clear from session recovery data
      if (currentRecoveryData) {
        const updatedRecoveryData = {
          ...currentRecoveryData,
          bulkOperation: undefined,
        };
        localStorage.setItem(
          USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA,
          JSON.stringify(updatedRecoveryData)
        );
      }
    } catch (error) {
      console.warn('Failed to clear bulk operation state:', error);
    }
  }, []);

  const saveBulkOperationState = useCallback((state: BulkOperationState) => {
    if (!enableBulkOperationProtection) {
      return;
    }

    try {
      localStorage.setItem(
        USER_MANAGEMENT_STORAGE.BULK_OPERATION_STATE,
        JSON.stringify({ ...state, timestamp: Date.now() })
      );
      setHasPendingBulkOperation(true);

      // Get current recovery data directly to avoid circular dependency
      const currentRecoveryData = (() => {
        try {
          const dataJson = localStorage.getItem(USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA);
          return dataJson ? JSON.parse(dataJson) as SessionRecoveryData : null;
        } catch (error) {
          console.warn('Failed to get session recovery data:', error);
          return null;
        }
      })();

      // Also save to session recovery data
      const recoveryData: SessionRecoveryData = {
        ...currentRecoveryData,
        bulkOperation: state,
        lastActivity: Date.now(),
      };

      localStorage.setItem(
        USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA,
        JSON.stringify(recoveryData)
      );
    } catch (error) {
      console.warn('Failed to save bulk operation state:', error);
    }
  }, [enableBulkOperationProtection]);

  const restoreBulkOperationState = useCallback((): BulkOperationState | null => {
    try {
      const stateJson = localStorage.getItem(USER_MANAGEMENT_STORAGE.BULK_OPERATION_STATE);
      if (!stateJson) {
        return null;
      }

      const state = JSON.parse(stateJson) as BulkOperationState;

      // Check if state is not too old (max 1 hour for bulk operations)
      const maxAge = 60 * 60 * 1000; // 1 hour
      const age = Date.now() - state.timestamp;

      if (age > maxAge) {
        clearBulkOperationState();
        return null;
      }

      return state;
    } catch (error) {
      console.warn('Failed to restore bulk operation state:', error);
      return null;
    }
  }, [clearBulkOperationState]);

  const clearSessionRecovery = useCallback(() => {
    try {
      localStorage.removeItem(USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA);
      localStorage.removeItem(USER_MANAGEMENT_STORAGE.BULK_OPERATION_STATE);
      localStorage.removeItem(USER_MANAGEMENT_STORAGE.FORM_BACKUP);
      setHasPendingBulkOperation(false);
    } catch (error) {
      console.warn('Failed to clear session recovery data:', error);
    }
  }, []);

  // Session event handlers
  const onSessionWarning = useCallback((callback: () => void) => {
    sessionWarningCallbackRef.current = callback;
  }, []);

  const onSessionExpiry = useCallback((callback: () => void) => {
    sessionExpiryCallbackRef.current = callback;
  }, []);

  const extendSession = useCallback(() => {
    refreshSession();

    // Get current recovery data directly to avoid circular dependency
    const currentRecoveryData = (() => {
      try {
        const dataJson = localStorage.getItem(USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA);
        return dataJson ? JSON.parse(dataJson) as SessionRecoveryData : null;
      } catch (error) {
        console.warn('Failed to get session recovery data:', error);
        return null;
      }
    })();

    // Update last activity in recovery data
    if (currentRecoveryData) {
      const updatedRecoveryData = {
        ...currentRecoveryData,
        lastActivity: Date.now(),
      };
      localStorage.setItem(
        USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA,
        JSON.stringify(updatedRecoveryData)
      );
    }
  }, [refreshSession]);

  // Check for pending bulk operations on mount (run only once)
  useEffect(() => {
    const checkBulkState = () => {
      try {
        const stateJson = localStorage.getItem(USER_MANAGEMENT_STORAGE.BULK_OPERATION_STATE);
        if (!stateJson) {
          return null;
        }

        const state = JSON.parse(stateJson) as BulkOperationState;

        // Check if state is not too old (max 1 hour for bulk operations)
        const maxAge = 60 * 60 * 1000; // 1 hour
        const age = Date.now() - state.timestamp;

        if (age > maxAge) {
          localStorage.removeItem(USER_MANAGEMENT_STORAGE.BULK_OPERATION_STATE);
          return null;
        }

        return state;
      } catch (error) {
        console.warn('Failed to restore bulk operation state:', error);
        return null;
      }
    };

    const bulkState = checkBulkState();
    setHasPendingBulkOperation(!!bulkState);
  }, []); // Empty dependency array - run only on mount

  // Monitor session security changes
  useEffect(() => {
    const wasHealthy = isSessionHealthy;
    const nowHealthy = sessionSecurity.isSessionValid;

    setIsSessionHealthy(nowHealthy);

    // Trigger callbacks based on session state changes
    if (sessionSecurity.showTimeoutWarning && sessionWarningCallbackRef.current) {
      sessionWarningCallbackRef.current();
    }

    if (wasHealthy && !nowHealthy && sessionExpiryCallbackRef.current) {
      sessionExpiryCallbackRef.current();
    }
  }, [sessionSecurity.isSessionValid, sessionSecurity.showTimeoutWarning, isSessionHealthy]);

  const cleanup = useCallback(() => {
    try {
      const dataJson = localStorage.getItem(USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA);
      if (!dataJson) {
        return;
      }

      const recoveryData = JSON.parse(dataJson) as SessionRecoveryData;
      const now = Date.now();
      const validBackups = recoveryData.formBackups.filter(
        backup => now - backup.timestamp <= maxBackupAge
      );

      if (validBackups.length !== recoveryData.formBackups.length) {
        const updatedRecoveryData = {
          ...recoveryData,
          formBackups: validBackups,
        };
        localStorage.setItem(
          USER_MANAGEMENT_STORAGE.SESSION_RECOVERY_DATA,
          JSON.stringify(updatedRecoveryData)
        );
      }
    } catch (error) {
      console.warn('Failed to cleanup old backups:', error);
    }
  }, [maxBackupAge]);

  // Auto cleanup old backups
  useEffect(() => {
    cleanupIntervalRef.current = setInterval(cleanup, backupInterval);
    cleanup(); // Run initial cleanup

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [cleanup, backupInterval]);

  return {
    // Form backup management
    backupFormData,
    restoreFormData,
    clearFormBackup,
    hasFormBackup,

    // Bulk operation management
    saveBulkOperationState,
    restoreBulkOperationState,
    clearBulkOperationState,
    hasPendingBulkOperation,

    // Session recovery
    getSessionRecoveryData,
    clearSessionRecovery,

    // Session timeout handling
    sessionSecurity,
    onSessionWarning,
    onSessionExpiry,
    extendSession,

    // Session state
    isSessionHealthy,
    timeUntilExpiry: sessionSecurity.timeUntilExpiry,
    shouldShowWarning: sessionSecurity.showTimeoutWarning,
  };
};