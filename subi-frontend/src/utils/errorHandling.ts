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
  translateFn?: (key: string, options?: any) => string
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
  const genericMessage = (error as any)?.message || t('errors.genericError');
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
