import { useCallback, useEffect, useState } from 'react';
import { useCheckEmailExistsMutation } from '@/store/api/userApi';
import { useDebounce } from './useDebounce';

export interface EmailValidationResult {
  isValid: boolean;
  isChecking: boolean;
  error: string | null;
  isAvailable: boolean | null;
}

export interface UseEmailValidationOptions {
  debounceMs?: number;
  excludeEmail?: string; // For edit mode - exclude current email from validation
  allowEmpty?: boolean; // Allow empty email for optional fields
}

export const useEmailValidation = (
  email: string,
  options: UseEmailValidationOptions = {}
) => {
  const {
    debounceMs = 500,
    excludeEmail,
    allowEmpty = false,
  } = options;

  const [validationResult, setValidationResult] = useState<EmailValidationResult>({
    isValid: false,
    isChecking: false,
    error: null,
    isAvailable: null,
  });

  const debouncedEmail = useDebounce(email, debounceMs);
  const [checkEmailExists] = useCheckEmailExistsMutation();

  const validateEmailFormat = useCallback((value: string): string | null => {
    if (!value) {
      if (allowEmpty) {
        return null;
      }
      return 'Email is required';
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }

    // Additional email format checks
    if (value.length > 254) {
      return 'Email address is too long';
    }

    // Check for valid characters
    const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!validEmailRegex.test(value)) {
      return 'Email contains invalid characters';
    }

    // Check local part length (before @)
    const localPart = value.split('@')[0];
    if (localPart.length > 64) {
      return 'Email local part is too long';
    }

    // Check for consecutive dots
    if (value.includes('..')) {
      return 'Email cannot contain consecutive dots';
    }

    // Check for leading/trailing dots in local part
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return 'Email cannot start or end with a dot';
    }

    return null;
  }, [allowEmpty]);

  const checkAvailability = useCallback(async (value: string) => {
    if (!value || (allowEmpty && !value) || value === excludeEmail) {
      if (!value && allowEmpty) {
        setValidationResult({
          isValid: true,
          isChecking: false,
          error: null,
          isAvailable: true,
        });
      }
      return;
    }

    const formatError = validateEmailFormat(value);
    if (formatError) {
      setValidationResult({
        isValid: false,
        isChecking: false,
        error: formatError,
        isAvailable: null,
      });
      return;
    }

    setValidationResult(prev => ({
      ...prev,
      isChecking: true,
      error: null,
    }));

    try {
      const result = await checkEmailExists({ email: value }).unwrap();
      const isAvailable = !result.exists;

      setValidationResult({
        isValid: isAvailable,
        isChecking: false,
        error: isAvailable ? null : 'Email address is already registered',
        isAvailable,
      });
    } catch {
      setValidationResult({
        isValid: false,
        isChecking: false,
        error: 'Failed to check email availability',
        isAvailable: null,
      });
    }
  }, [checkEmailExists, excludeEmail, validateEmailFormat, allowEmpty]);

  // Effect to validate when debounced email changes
  useEffect(() => {
    if (debouncedEmail !== email) {
      // Email is still changing, show as checking
      setValidationResult(prev => ({
        ...prev,
        isChecking: true,
      }));
      return;
    }

    checkAvailability(debouncedEmail);
  }, [debouncedEmail, email, checkAvailability]);

  // Reset validation when email is cleared
  useEffect(() => {
    if (!email) {
      setValidationResult({
        isValid: allowEmpty,
        isChecking: false,
        error: null,
        isAvailable: allowEmpty ? true : null,
      });
    }
  }, [email, allowEmpty]);

  return validationResult;
};