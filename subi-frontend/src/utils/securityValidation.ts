/**
 * Client-side security validation utilities
 * Provides XSS prevention, input sanitization, and security pattern detection
 */

// Security configuration constants
export const SECURITY_LIMITS = {
  MAX_INPUT_LENGTH: 10000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_BULK_OPERATIONS: 100,
  SESSION_TIMEOUT_WARNING: 5 * 60 * 1000, // 5 minutes
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
} as const;

// Suspicious patterns for detection
const SUSPICIOUS_PATTERNS = {
  SQL_INJECTION: [
    /['"]/,
    /;\s*(DROP|DELETE|INSERT|UPDATE|EXEC|UNION|SELECT|ALTER|CREATE|TRUNCATE)/i,
    /-{2,}/,
    /\/\*/,
    /\*\//,
    /\b(OR|AND)\s+\d+\s*=\s*\d+/i,
    /\b(UNION\s+SELECT|UNION\s+ALL)/i,
  ],
  XSS: [
    /<script[^>]*>.*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe[^>]*>.*?<\/iframe>/i,
    /<embed[^>]*>/i,
    /<object[^>]*>/i,
    /vbscript:/i,
    /expression\s*\(/i,
  ],
  PATH_TRAVERSAL: [
    /\.\.\//,
    /\.\.\\\\/,
    /%2e%2e%2f/i,
    /%2e%2e\\\\/i,
    /\.\.%2f/i,
    /\.\.%5c/i,
  ],
  COMMAND_INJECTION: [
    /[;&|`$()]/,
    /\|\s*\w+/,
    /&&\s*\w+/,
    /;\s*\w+/,
  ],
} as const;

// HTML entities for XSS prevention
const HTML_ENTITIES: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '&': '&amp;',
  '/': '&#x2F;',
} as const;

/**
 * Input sanitization utilities
 */
export const InputSanitizer = {
  /**
   * Escape HTML entities to prevent XSS
   */
  escapeHtml: (input: string): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input.replace(/[<>"'&/]/g, (char) => HTML_ENTITIES[char] || char);
  },

  /**
   * Remove all HTML tags from input
   */
  stripHtml: (input: string): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input.replace(/<[^>]*>/g, '');
  },

  /**
   * Sanitize text input with comprehensive security measures
   */
  sanitizeText: (input: string, maxLength = SECURITY_LIMITS.MAX_INPUT_LENGTH): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[\r\n\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[<>"'&]/g, (char) => HTML_ENTITIES[char] || char);
  },

  /**
   * Sanitize username with strict rules
   */
  sanitizeUsername: (input: string): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '')
      .substring(0, 50);
  },

  /**
   * Sanitize email address
   */
  sanitizeEmail: (input: string): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9@._-]/g, '')
      .substring(0, 254);
  },

  /**
   * Sanitize phone number
   */
  sanitizePhone: (input: string): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[^+\d\s-()]/g, '')
      .substring(0, 20);
  },

  /**
   * Sanitize file name
   */
  sanitizeFileName: (input: string): string => {
    if (!input || typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\.\./g, '')
      .substring(0, 255);
  },
};

/**
 * Security pattern detection
 */
export const SecurityDetector = {
  /**
   * Check for SQL injection patterns
   */
  detectSqlInjection: (input: string): { isValid: boolean; threat?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: true };
    }

    const normalizedInput = input.toLowerCase().trim();

    for (const pattern of SUSPICIOUS_PATTERNS.SQL_INJECTION) {
      if (pattern.test(normalizedInput)) {
        return {
          isValid: false,
          threat: 'Potential SQL injection detected'
        };
      }
    }

    return { isValid: true };
  },

  /**
   * Check for XSS patterns
   */
  detectXss: (input: string): { isValid: boolean; threat?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: true };
    }

    for (const pattern of SUSPICIOUS_PATTERNS.XSS) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          threat: 'Potential XSS attack detected'
        };
      }
    }

    return { isValid: true };
  },

  /**
   * Check for path traversal patterns
   */
  detectPathTraversal: (input: string): { isValid: boolean; threat?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: true };
    }

    for (const pattern of SUSPICIOUS_PATTERNS.PATH_TRAVERSAL) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          threat: 'Potential path traversal detected'
        };
      }
    }

    return { isValid: true };
  },

  /**
   * Check for command injection patterns
   */
  detectCommandInjection: (input: string): { isValid: boolean; threat?: string } => {
    if (!input || typeof input !== 'string') {
      return { isValid: true };
    }

    for (const pattern of SUSPICIOUS_PATTERNS.COMMAND_INJECTION) {
      if (pattern.test(input)) {
        return {
          isValid: false,
          threat: 'Potential command injection detected'
        };
      }
    }

    return { isValid: true };
  },

  /**
   * Comprehensive security scan
   */
  scanInput: (input: string): { isValid: boolean; threats: string[] } => {
    const threats: string[] = [];

    const sqlCheck = SecurityDetector.detectSqlInjection(input);
    if (!sqlCheck.isValid && sqlCheck.threat) {
      threats.push(sqlCheck.threat);
    }

    const xssCheck = SecurityDetector.detectXss(input);
    if (!xssCheck.isValid && xssCheck.threat) {
      threats.push(xssCheck.threat);
    }

    const pathCheck = SecurityDetector.detectPathTraversal(input);
    if (!pathCheck.isValid && pathCheck.threat) {
      threats.push(pathCheck.threat);
    }

    const cmdCheck = SecurityDetector.detectCommandInjection(input);
    if (!cmdCheck.isValid && cmdCheck.threat) {
      threats.push(cmdCheck.threat);
    }

    return {
      isValid: threats.length === 0,
      threats,
    };
  },
};

/**
 * File upload security validation
 */
export const FileSecurityValidator = {
  /**
   * Allowed file extensions for different types
   */
  ALLOWED_EXTENSIONS: {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    archives: ['.zip', '.rar', '.7z'],
    spreadsheets: ['.xls', '.xlsx', '.csv'],
  } as const,

  /**
   * Dangerous file extensions that should never be allowed
   */
  DANGEROUS_EXTENSIONS: [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.app', '.deb', '.pkg', '.dmg', '.iso', '.msi', '.php', '.asp', '.jsp',
    '.sh', '.ps1', '.py', '.rb', '.pl', '.cgi',
  ] as const,

  /**
   * Validate file extension
   */
  validateFileExtension: (fileName: string, allowedTypes: keyof typeof FileSecurityValidator.ALLOWED_EXTENSIONS): { isValid: boolean; error?: string } => {
    if (!fileName || typeof fileName !== 'string') {
      return { isValid: false, error: 'Invalid file name' };
    }

    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));

    // Check for dangerous extensions
    if (FileSecurityValidator.DANGEROUS_EXTENSIONS.includes(extension)) {
      return { isValid: false, error: 'File type not allowed for security reasons' };
    }

    // Check if extension is in allowed list
    const allowedExtensions = FileSecurityValidator.ALLOWED_EXTENSIONS[allowedTypes];
    if (!allowedExtensions.includes(extension)) {
      return { isValid: false, error: `File type ${extension} not allowed` };
    }

    return { isValid: true };
  },

  /**
   * Validate file size
   */
  validateFileSize: (fileSize: number, maxSize = SECURITY_LIMITS.MAX_FILE_SIZE): { isValid: boolean; error?: string } => {
    if (typeof fileSize !== 'number' || fileSize < 0) {
      return { isValid: false, error: 'Invalid file size' };
    }

    if (fileSize > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return { isValid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
    }

    return { isValid: true };
  },

  /**
   * Validate file name for security
   */
  validateFileName: (fileName: string): { isValid: boolean; error?: string } => {
    if (!fileName || typeof fileName !== 'string') {
      return { isValid: false, error: 'Invalid file name' };
    }

    // Check for path traversal attempts
    const pathCheck = SecurityDetector.detectPathTraversal(fileName);
    if (!pathCheck.isValid) {
      return { isValid: false, error: 'Invalid file name format' };
    }

    // Check for null bytes and other dangerous characters
    if (fileName.includes('\0') || /[<>:"/\\|?*]/.test(fileName)) {
      return { isValid: false, error: 'File name contains invalid characters' };
    }

    // Check length
    if (fileName.length > 255) {
      return { isValid: false, error: 'File name too long' };
    }

    return { isValid: true };
  },
};

/**
 * Rate limiting utilities for client-side protection
 */
export class RateLimiter {
  private requestTimes: Map<string, number[]> = new Map();

  /**
   * Check if action is rate limited
   */
  isRateLimited(
    identifier: string,
    maxRequests = SECURITY_LIMITS.RATE_LIMIT_REQUESTS,
    windowMs = SECURITY_LIMITS.RATE_LIMIT_WINDOW
  ): boolean {
    const now = Date.now();
    const requests = this.requestTimes.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);

    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return true;
    }

    // Add current request
    validRequests.push(now);
    this.requestTimes.set(identifier, validRequests);

    return false;
  }

  /**
   * Clear rate limit data for identifier
   */
  clearRateLimit(identifier: string): void {
    this.requestTimes.delete(identifier);
  }

  /**
   * Get remaining requests before rate limit
   */
  getRemainingRequests(
    identifier: string,
    maxRequests = SECURITY_LIMITS.RATE_LIMIT_REQUESTS,
    windowMs = SECURITY_LIMITS.RATE_LIMIT_WINDOW
  ): number {
    const now = Date.now();
    const requests = this.requestTimes.get(identifier) || [];
    const validRequests = requests.filter(time => now - time < windowMs);

    return Math.max(0, maxRequests - validRequests.length);
  }
}

/**
 * CSRF protection utilities
 */
export const CsrfProtection = {
  /**
   * Generate CSRF token
   */
  generateCsrfToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Store CSRF token securely
   */
  storeCsrfToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('csrf-token', token);
    }
  },

  /**
   * Get stored CSRF token
   */
  getCsrfToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('csrf-token');
    }
    return null;
  },

  /**
   * Validate CSRF token
   */
  validateCsrfToken: (token: string): boolean => {
    const storedToken = CsrfProtection.getCsrfToken();
    return storedToken === token && token.length === 64;
  },

  /**
   * Clear CSRF token
   */
  clearCsrfToken: (): void => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('csrf-token');
    }
  },
};

/**
 * Bulk operation security validation
 */
export const BulkOperationValidator = {
  /**
   * Validate bulk operation parameters
   */
  validateBulkOperation: (
    operation: string,
    targetIds: string[],
    maxItems = SECURITY_LIMITS.MAX_BULK_OPERATIONS
  ): { isValid: boolean; error?: string } => {
    // Validate operation type
    const allowedOperations = ['delete', 'update', 'export', 'activate', 'deactivate'];
    if (!allowedOperations.includes(operation.toLowerCase())) {
      return { isValid: false, error: 'Invalid bulk operation type' };
    }

    // Validate target IDs
    if (!Array.isArray(targetIds) || targetIds.length === 0) {
      return { isValid: false, error: 'No items selected for bulk operation' };
    }

    if (targetIds.length > maxItems) {
      return { isValid: false, error: `Too many items selected (maximum ${maxItems})` };
    }

    // Validate ID format (UUIDs or numbers)
    const invalidIds = targetIds.filter(id => {
      if (typeof id !== 'string') {
        return true;
      }
      // Check for UUID format or numeric ID
      return !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) &&
             !/^\d+$/.test(id);
    });

    if (invalidIds.length > 0) {
      return { isValid: false, error: 'Invalid ID format detected' };
    }

    // Check for duplicates
    const uniqueIds = new Set(targetIds);
    if (uniqueIds.size !== targetIds.length) {
      return { isValid: false, error: 'Duplicate IDs detected' };
    }

    return { isValid: true };
  },
};

/**
 * Global security logger for monitoring
 */
export const SecurityLogger = {
  /**
   * Log security event
   */
  logSecurityEvent: (event: {
    type: 'threat_detected' | 'rate_limit_exceeded' | 'invalid_access' | 'suspicious_activity';
    details: string;
    userAgent?: string;
    timestamp?: Date;
  }): void => {
    const logEntry = {
      ...event,
      timestamp: event.timestamp || new Date(),
      userAgent: event.userAgent || navigator.userAgent,
      url: window.location.href,
    };

    // In production, this would send to a security monitoring service
    console.warn('[SECURITY EVENT]', logEntry);

    // Store locally for debugging (in development only)
    if (process.env.NODE_ENV === 'development') {
      const logs = JSON.parse(localStorage.getItem('security-logs') || '[]');
      logs.push(logEntry);
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      localStorage.setItem('security-logs', JSON.stringify(logs));
    }
  },

  /**
   * Get security logs (development only)
   */
  getSecurityLogs: (): unknown[] => {
    if (process.env.NODE_ENV === 'development') {
      return JSON.parse(localStorage.getItem('security-logs') || '[]');
    }
    return [];
  },

  /**
   * Clear security logs
   */
  clearSecurityLogs: (): void => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('security-logs');
    }
  },
};