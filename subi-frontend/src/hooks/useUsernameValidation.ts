import { useCallback, useEffect, useState } from 'react';
import { useCheckUsernameExistsMutation } from '@/store/api/userApi';
import { useDebounce } from './useDebounce';

export interface UsernameValidationResult {
  isValid: boolean;
  isChecking: boolean;
  error: string | null;
  isAvailable: boolean | null;
}

export interface UseUsernameValidationOptions {
  debounceMs?: number;
  minLength?: number;
  maxLength?: number;
  excludeUsername?: string; // For edit mode - exclude current username from validation
}

export const useUsernameValidation = (
  username: string,
  options: UseUsernameValidationOptions = {}
) => {
  const {
    debounceMs = 500,
    minLength = 3,
    maxLength = 50,
    excludeUsername,
  } = options;

  const [validationResult, setValidationResult] = useState<UsernameValidationResult>({
    isValid: false,
    isChecking: false,
    error: null,
    isAvailable: null,
  });

  const debouncedUsername = useDebounce(username, debounceMs);
  const [checkUsernameExists] = useCheckUsernameExistsMutation();

  const validateUsernameFormat = useCallback((value: string): string | null => {
    if (!value) {
      return 'Username is required';
    }

    if (value.length < minLength) {
      return `Username must be at least ${minLength} characters`;
    }

    if (value.length > maxLength) {
      return `Username must not exceed ${maxLength} characters`;
    }

    // Username format validation - alphanumeric, underscore, hyphen
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(value)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }

    // Must start with letter or number
    if (!/^[a-zA-Z0-9]/.test(value)) {
      return 'Username must start with a letter or number';
    }

    // Cannot end with special characters
    if (/[-_]$/.test(value)) {
      return 'Username cannot end with a hyphen or underscore';
    }

    // No consecutive special characters
    if (/[-_]{2,}/.test(value)) {
      return 'Username cannot contain consecutive hyphens or underscores';
    }

    return null;
  }, [minLength, maxLength]);

  const checkAvailability = useCallback(async (value: string) => {
    if (!value || value === excludeUsername) {
      return;
    }

    const formatError = validateUsernameFormat(value);
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
      const result = await checkUsernameExists({ username: value }).unwrap();
      const isAvailable = !result.exists;

      setValidationResult({
        isValid: isAvailable,
        isChecking: false,
        error: isAvailable ? null : 'Username is already taken',
        isAvailable,
      });
    } catch {
      setValidationResult({
        isValid: false,
        isChecking: false,
        error: 'Failed to check username availability',
        isAvailable: null,
      });
    }
  }, [checkUsernameExists, excludeUsername, validateUsernameFormat]);

  // Effect to validate when debounced username changes
  useEffect(() => {
    if (debouncedUsername !== username) {
      // Username is still changing, show as checking
      setValidationResult(prev => ({
        ...prev,
        isChecking: true,
      }));
      return;
    }

    checkAvailability(debouncedUsername);
  }, [debouncedUsername, username, checkAvailability]);

  // Reset validation when username is cleared
  useEffect(() => {
    if (!username) {
      setValidationResult({
        isValid: false,
        isChecking: false,
        error: null,
        isAvailable: null,
      });
    }
  }, [username]);

  return validationResult;
};