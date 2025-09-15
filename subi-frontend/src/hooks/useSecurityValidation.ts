import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import {
  InputSanitizer,
  RateLimiter,
  SECURITY_LIMITS,
  SecurityDetector,
  SecurityLogger
} from '@/utils/securityValidation';
import { getStoredToken, isTokenExpired } from '@/utils/auth';

// Global rate limiter instance
const globalRateLimiter = new RateLimiter();

export interface SecurityValidationResult {
  isValid: boolean;
  sanitizedValue?: string;
  threats: string[];
  error?: string;
}

export interface SessionSecurityState {
  isSessionValid: boolean;
  timeUntilExpiry: number;
  showTimeoutWarning: boolean;
  isIdle: boolean;
  idleTime: number;
}

export interface UseSecurityValidationOptions {
  enableRealTimeValidation?: boolean;
  enableSessionMonitoring?: boolean;
  enableIdleDetection?: boolean;
  customRateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

export interface UseSecurityValidationReturn {
  // Input validation
  validateInput: (input: string, sanitize?: boolean) => SecurityValidationResult;
  validateAndSanitize: (input: string) => { value: string; isValid: boolean; threats: string[] };

  // Rate limiting
  checkRateLimit: (identifier: string) => boolean;
  getRemainingRequests: (identifier: string) => number;

  // Session security
  sessionSecurity: SessionSecurityState;
  refreshSession: () => void;

  // Security monitoring
  logSecurityEvent: (type: string, details: string) => void;

  // File validation
  validateFile: (file: File, allowedTypes: 'images' | 'documents' | 'archives' | 'spreadsheets') => SecurityValidationResult;

  // Bulk operation validation
  validateBulkOperation: (operation: string, targetIds: string[]) => SecurityValidationResult;
}

export const useSecurityValidation = (
  options: UseSecurityValidationOptions = {}
): UseSecurityValidationReturn => {
  const {
    enableRealTimeValidation: _enableRealTimeValidation = true,
    enableSessionMonitoring = true,
    enableIdleDetection = true,
    customRateLimit,
  } = options;

  const { user: _user } = useAuth();
  const [sessionSecurity, setSessionSecurity] = useState<SessionSecurityState>({
    isSessionValid: true,
    timeUntilExpiry: 0,
    showTimeoutWarning: false,
    isIdle: false,
    idleTime: 0,
  });

  // Refs for tracking user activity
  const lastActivityRef = useRef<number>(Date.now());
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout>();
  const idleCheckIntervalRef = useRef<NodeJS.Timeout>();

  // Input validation function
  const validateInput = useCallback((input: string, sanitize = false): SecurityValidationResult => {
    if (!input || typeof input !== 'string') {
      return { isValid: true, sanitizedValue: '', threats: [] };
    }

    // Perform security scan
    const scanResult = SecurityDetector.scanInput(input);

    if (!scanResult.isValid) {
      // Log security threat
      SecurityLogger.logSecurityEvent({
        type: 'threat_detected',
        details: `Input validation failed: ${scanResult.threats.join(', ')}`,
      });
    }

    // Sanitize if requested
    const sanitizedValue = sanitize ? InputSanitizer.sanitizeText(input) : input;

    return {
      isValid: scanResult.isValid,
      sanitizedValue,
      threats: scanResult.threats,
      error: scanResult.isValid ? undefined : 'Input contains potentially dangerous content',
    };
  }, []);

  // Validate and sanitize helper
  const validateAndSanitize = useCallback((input: string) => {
    const result = validateInput(input, true);
    return {
      value: result.sanitizedValue || '',
      isValid: result.isValid,
      threats: result.threats,
    };
  }, [validateInput]);

  // Rate limiting check
  const checkRateLimit = useCallback((identifier: string): boolean => {
    const rateLimitConfig = customRateLimit || {
      maxRequests: SECURITY_LIMITS.RATE_LIMIT_REQUESTS,
      windowMs: SECURITY_LIMITS.RATE_LIMIT_WINDOW,
    };

    const isLimited = globalRateLimiter.isRateLimited(
      identifier,
      rateLimitConfig.maxRequests,
      rateLimitConfig.windowMs
    );

    if (isLimited) {
      SecurityLogger.logSecurityEvent({
        type: 'rate_limit_exceeded',
        details: `Rate limit exceeded for identifier: ${identifier}`,
      });
    }

    return isLimited;
  }, [customRateLimit]);

  // Get remaining requests
  const getRemainingRequests = useCallback((identifier: string): number => {
    const rateLimitConfig = customRateLimit || {
      maxRequests: SECURITY_LIMITS.RATE_LIMIT_REQUESTS,
      windowMs: SECURITY_LIMITS.RATE_LIMIT_WINDOW,
    };

    return globalRateLimiter.getRemainingRequests(
      identifier,
      rateLimitConfig.maxRequests,
      rateLimitConfig.windowMs
    );
  }, [customRateLimit]);

  // Session refresh
  const refreshSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSessionSecurity(prev => ({
      ...prev,
      isIdle: false,
      idleTime: 0,
      showTimeoutWarning: false,
    }));
  }, []);

  // Security event logger
  const logSecurityEvent = useCallback((type: string, details: string) => {
    SecurityLogger.logSecurityEvent({
      type: type as 'threat_detected' | 'rate_limit_exceeded' | 'invalid_access' | 'suspicious_activity',
      details,
    });
  }, []);

  // File validation
  const validateFile = useCallback((
    file: File,
    allowedTypes: 'images' | 'documents' | 'archives' | 'spreadsheets'
  ): SecurityValidationResult => {
    const threats: string[] = [];

    // Validate file name
    const fileNameResult = SecurityDetector.scanInput(file.name);
    if (!fileNameResult.isValid) {
      threats.push(...fileNameResult.threats);
    }

    // Validate file size
    if (file.size > SECURITY_LIMITS.MAX_FILE_SIZE) {
      threats.push('File size exceeds maximum allowed limit');
    }

    // Validate file extension (basic check)
    const allowedExtensions: Record<string, string[]> = {
      images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
      archives: ['.zip', '.rar', '.7z'],
      spreadsheets: ['.xls', '.xlsx', '.csv'],
    };

    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const allowed = allowedExtensions[allowedTypes] || [];

    if (!allowed.includes(extension)) {
      threats.push(`File type ${extension} not allowed`);
    }

    // Check for dangerous extensions
    const dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.scr', '.vbs', '.js', '.jar',
      '.app', '.php', '.asp', '.jsp', '.sh', '.ps1', '.py',
    ];

    if (dangerousExtensions.includes(extension)) {
      threats.push('Potentially dangerous file type detected');
    }

    const isValid = threats.length === 0;

    if (!isValid) {
      SecurityLogger.logSecurityEvent({
        type: 'threat_detected',
        details: `File validation failed: ${threats.join(', ')} for file: ${file.name}`,
      });
    }

    return {
      isValid,
      threats,
      error: isValid ? undefined : 'File validation failed',
    };
  }, []);

  // Bulk operation validation
  const validateBulkOperation = useCallback((
    operation: string,
    targetIds: string[]
  ): SecurityValidationResult => {
    const threats: string[] = [];

    // Validate operation type
    const allowedOperations = ['delete', 'update', 'export', 'activate', 'deactivate'];
    if (!allowedOperations.includes(operation.toLowerCase())) {
      threats.push('Invalid bulk operation type');
    }

    // Validate number of items
    if (targetIds.length > SECURITY_LIMITS.MAX_BULK_OPERATIONS) {
      threats.push(`Too many items selected (maximum ${SECURITY_LIMITS.MAX_BULK_OPERATIONS})`);
    }

    // Validate ID format
    const invalidIds = targetIds.filter(id => {
      if (typeof id !== 'string') {
        return true;
      }
      // Check for valid UUID or numeric format
      return !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) &&
             !/^\d+$/.test(id);
    });

    if (invalidIds.length > 0) {
      threats.push('Invalid ID format detected');
    }

    // Check for duplicates
    const uniqueIds = new Set(targetIds);
    if (uniqueIds.size !== targetIds.length) {
      threats.push('Duplicate IDs detected');
    }

    const isValid = threats.length === 0;

    if (!isValid) {
      SecurityLogger.logSecurityEvent({
        type: 'suspicious_activity',
        details: `Bulk operation validation failed: ${threats.join(', ')} for operation: ${operation}`,
      });
    }

    return {
      isValid,
      threats,
      error: isValid ? undefined : 'Bulk operation validation failed',
    };
  }, []);

  // Session monitoring effect
  useEffect(() => {
    if (!enableSessionMonitoring) {
      return;
    }

    const checkSession = () => {
      const token = getStoredToken();
      const now = Date.now();

      if (!token) {
        setSessionSecurity(prev => ({
          ...prev,
          isSessionValid: false,
          timeUntilExpiry: 0,
        }));
        return;
      }

      const isExpired = isTokenExpired(token);
      if (isExpired) {
        setSessionSecurity(prev => ({
          ...prev,
          isSessionValid: false,
          timeUntilExpiry: 0,
        }));
        return;
      }

      // Calculate time until session warning
      const sessionStart = lastActivityRef.current;
      const timeSinceActivity = now - sessionStart;
      const timeUntilWarning = SECURITY_LIMITS.SESSION_TIMEOUT_WARNING - timeSinceActivity;
      const timeUntilExpiry = SECURITY_LIMITS.SESSION_TIMEOUT - timeSinceActivity;

      setSessionSecurity(prev => ({
        ...prev,
        isSessionValid: true,
        timeUntilExpiry: Math.max(0, timeUntilExpiry),
        showTimeoutWarning: timeUntilWarning <= 0 && timeUntilExpiry > 0,
      }));
    };

    // Check session every 30 seconds
    sessionCheckIntervalRef.current = setInterval(checkSession, 30000);
    checkSession(); // Initial check

    return () => {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }
    };
  }, [enableSessionMonitoring]);

  // Idle detection effect
  useEffect(() => {
    if (!enableIdleDetection) {
      return;
    }

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      setSessionSecurity(prev => ({
        ...prev,
        isIdle: false,
        idleTime: 0,
      }));
    };

    const checkIdle = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      const isIdle = timeSinceActivity > 5 * 60 * 1000; // 5 minutes of inactivity

      setSessionSecurity(prev => ({
        ...prev,
        isIdle,
        idleTime: timeSinceActivity,
      }));
    };

    // Activity event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Check idle status every minute
    idleCheckIntervalRef.current = setInterval(checkIdle, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });

      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
      }
    };
  }, [enableIdleDetection]);

  // Activity tracking for user interactions
  useEffect(() => {
    const handleUserActivity = () => {
      refreshSession();
    };

    // Track form interactions and API calls
    const events = ['focus', 'input', 'change'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [refreshSession]);

  return {
    validateInput,
    validateAndSanitize,
    checkRateLimit,
    getRemainingRequests,
    sessionSecurity,
    refreshSession,
    logSecurityEvent,
    validateFile,
    validateBulkOperation,
  };
};