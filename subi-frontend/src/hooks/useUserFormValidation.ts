import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createUserSchema,
  updateUserSchema,
  type UserFormData,
} from '@/schemas/userSchemas';

interface UseUserFormValidationProps {
  isEditMode: boolean;
  defaultValues?: Partial<UserFormData>;
}

export const useUserFormValidation = ({
  isEditMode,
  defaultValues,
}: UseUserFormValidationProps) => {
  const schema = isEditMode ? updateUserSchema : createUserSchema;

  const form = useForm<UserFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  return {
    form,
    schema,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
  };
};