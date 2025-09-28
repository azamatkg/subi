import { UseFormWatch } from 'react-hook-form';
import * as z from 'zod';
import {
  useCheckUsernameAvailabilityQuery,
  useCheckEmailAvailabilityQuery,
} from '@/store/api/userApi';
import type { UserFormData } from '@/schemas/userSchemas';

interface UseAvailabilityChecksProps {
  watch: UseFormWatch<UserFormData>;
  isEditMode: boolean;
  userId?: string;
  originalEmail?: string;
}

export const useAvailabilityChecks = ({
  watch,
  isEditMode,
  userId,
  originalEmail,
}: UseAvailabilityChecksProps) => {
  // Watch form values
  const watchedUsername = isEditMode
    ? undefined
    : (watch('username' as keyof UserFormData) as string | undefined);
  const watchedEmail = watch('email') as string;

  // Username availability check
  const {
    data: usernameCheckResponse,
    isLoading: usernameChecking,
    error: usernameCheckError,
  } = useCheckUsernameAvailabilityQuery(
    {
      username: watchedUsername || '',
      excludeUserId: isEditMode ? userId : undefined,
    },
    {
      skip:
        !watchedUsername ||
        typeof watchedUsername !== 'string' ||
        watchedUsername.length < 3,
    }
  );

  // Email availability check
  const {
    data: emailCheckResponse,
    isLoading: emailChecking,
    error: emailCheckError,
  } = useCheckEmailAvailabilityQuery(
    {
      email: watchedEmail || '',
      excludeUserId: isEditMode ? userId : undefined,
    },
    {
      skip:
        !watchedEmail ||
        !z.string().email().safeParse(watchedEmail).success ||
        (isEditMode && watchedEmail === originalEmail),
    }
  );

  return {
    // Username checks
    usernameCheckResponse,
    usernameChecking,
    usernameCheckError,
    isUsernameAvailable: usernameCheckResponse?.data?.available,

    // Email checks
    emailCheckResponse,
    emailChecking,
    emailCheckError,
    isEmailAvailable: emailCheckResponse?.data?.available,

    // Helper methods
    hasUsernameError: usernameCheckResponse && !usernameCheckResponse.data.available,
    hasEmailError: emailCheckResponse && !emailCheckResponse.data.available,
    isCheckingAvailability: usernameChecking || emailChecking,
  };
};