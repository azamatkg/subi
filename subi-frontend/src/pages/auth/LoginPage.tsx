import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import {
  Loader2,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import {
  FocusTrap,
  AccessibleHeading,
  VisuallyHidden,
  LiveRegion,
} from '@/components/ui/focus-trap';
import { generateId, useAnnouncement } from '@/lib/accessibility';
import { cn } from '@/lib/utils';
import { useSetPageTitle } from '@/hooks/useSetPageTitle';

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Имя пользователя обязательно')
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(50, 'Имя пользователя не должно превышать 50 символов')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Имя пользователя может содержать только буквы, цифры, дефис и подчеркивание'
    ),
  password: z
    .string()
    .min(1, 'Пароль обязателен')
    .min(6, 'Пароль должен содержать минимум 6 символов')
    .max(100, 'Пароль не должен превышать 100 символов'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  useSetPageTitle('Вход в систему');
  const { login, isLoading, error, clearAuthError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const announce = useAnnouncement();

  // Generate stable IDs for form elements
  const usernameId = React.useMemo(() => generateId('username'), []);
  const passwordId = React.useMemo(() => generateId('password'), []);
  const errorId = React.useMemo(() => generateId('login-error'), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearAuthError();

    try {
      const result = await login(data);

      if (!result.success) {
        announce(`Ошибка входа: ${result.error}`, 'assertive');
        console.error('Login failed:', result.error);
      } else {
        announce('Вход выполнен успешно', 'polite');
      }
    } catch (err) {
      announce('Произошла ошибка при входе в систему', 'assertive');
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    announce(showPassword ? 'Пароль скрыт' : 'Пароль отображается', 'polite');
  };

  // Clear error when user starts typing
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearAuthError();
      }, 8000); // Longer timeout for better accessibility
      return () => clearTimeout(timer);
    }
  }, [error, clearAuthError]);

  const isFormLoading = isSubmitting || isLoading;

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50"
      role="main"
      aria-labelledby="login-title"
    >
      {/* Live region for screen reader announcements */}
      <LiveRegion>
        {error && `Ошибка: ${error}`}
        {isFormLoading && 'Выполняется вход в систему'}
      </LiveRegion>

      <div className="container mx-auto px-4 h-screen flex items-center">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Left side - Branding */}
            <div className="w-full lg:w-2/5 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <div className="mb-12">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shadow-lg mb-6">
                    <Shield
                      className="w-8 h-8 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <AccessibleHeading
                    level={1}
                    id="login-title"
                    className="text-3xl font-bold mb-2"
                  >
                    АСУБК
                  </AccessibleHeading>
                  <p className="text-blue-100 text-lg">
                    Автоматизированная система управления банковскими кредитами
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 w-2 h-2 bg-blue-300 rounded-full flex-shrink-0"></div>
                    <p className="text-blue-100">
                      Управление кредитными заявками и документами
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 w-2 h-2 bg-blue-300 rounded-full flex-shrink-0"></div>
                    <p className="text-blue-100">
                      Анализ кредитных программ и комиссий
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 w-2 h-2 bg-blue-300 rounded-full flex-shrink-0"></div>
                    <p className="text-blue-100">
                      Принятие решений по кредитам
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t border-blue-500/30">
                <p className="text-blue-200 text-sm">
                  &copy; 2024 ASUBK Financial Management System. Все права защищены.
                </p>
              </div>
            </div>
            
            {/* Right side - Login Form */}
            <div className="w-full lg:w-3/5 p-8 lg:p-12">
              <div className="max-w-md ml-0 lg:mx-auto">
                <FocusTrap active>
                  <div className="mb-10">
                    <AccessibleHeading
                      level={2}
                      className="text-2xl font-bold text-gray-900 mb-2"
                    >
                      Вход в систему
                    </AccessibleHeading>
                    <p className="text-gray-600">
                      Введите ваши учетные данные для доступа
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                    noValidate
                    aria-describedby={error ? errorId : undefined}
                  >
                    {/* Error display */}
                    {error && (
                      <Alert
                        variant="destructive"
                        id={errorId}
                        role="alert"
                        className="border-red-200 bg-red-50 text-red-800"
                      >
                        <AlertDescription>
                          {error === 'Login failed'
                            ? 'Неверное имя пользователя или пароль'
                            : error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Username field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={usernameId}
                        className="text-sm font-medium text-gray-700"
                      >
                        Имя пользователя
                        <span
                          className="text-red-500 ml-1"
                          aria-label="обязательное поле"
                        >
                          *
                        </span>
                      </Label>
                      <Input
                        id={usernameId}
                        type="text"
                        autoComplete="username"
                        placeholder="Введите имя пользователя"
                        {...register('username', {
                          onChange: () => {
                            if (error) clearAuthError();
                            if (errors.username) clearErrors('username');
                          },
                        })}
                        className={cn(
                          'h-12 transition-all duration-200 border border-gray-300 bg-white rounded-lg',
                          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0',
                          'placeholder:text-gray-400',
                          errors.username &&
                            'border-red-300 focus:border-red-500 focus:ring-red-500/20',
                          'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                        disabled={isFormLoading}
                        aria-invalid={errors.username ? 'true' : 'false'}
                        aria-describedby={
                          errors.username ? `${usernameId}-error` : undefined
                        }
                      />
                      {errors.username && (
                        <p
                          id={`${usernameId}-error`}
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.username.message}
                        </p>
                      )}
                    </div>

                    {/* Password field */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={passwordId}
                        className="text-sm font-medium text-gray-700"
                      >
                        Пароль
                        <span
                          className="text-red-500 ml-1"
                          aria-label="обязательное поле"
                        >
                          *
                        </span>
                      </Label>
                      <div className="relative">
                        <Input
                          id={passwordId}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          placeholder="Введите пароль"
                          {...register('password', {
                            onChange: () => {
                              if (error) clearAuthError();
                              if (errors.password) clearErrors('password');
                            },
                          })}
                          className={cn(
                            'h-12 pr-12 transition-all duration-200 border border-gray-300 bg-white rounded-lg',
                            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0',
                            'placeholder:text-gray-400',
                            errors.password &&
                              'border-red-300 focus:border-red-500 focus:ring-red-500/20',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                          )}
                          disabled={isFormLoading}
                          aria-invalid={errors.password ? 'true' : 'false'}
                          aria-describedby={
                            errors.password
                              ? `${passwordId}-error`
                              : `${passwordId}-help`
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-12 px-3 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-none rounded-r-lg"
                          onClick={togglePasswordVisibility}
                          disabled={isFormLoading}
                          aria-label={
                            showPassword ? 'Скрыть пароль' : 'Показать пароль'
                          }
                        >
                          {showPassword ? (
                            <EyeOff
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          ) : (
                            <Eye
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                      </div>
                      <VisuallyHidden>
                        Пароль должен содержать минимум 6 символов
                      </VisuallyHidden>
                      {errors.password && (
                        <p
                          id={`${passwordId}-error`}
                          className="text-sm text-red-600"
                          role="alert"
                        >
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Remember me checkbox and Forgot password link */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="rememberMe"
                          {...register('rememberMe')}
                          disabled={isFormLoading}
                          className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded"
                        />
                        <Label
                          htmlFor="rememberMe"
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          Запомнить меня
                        </Label>
                      </div>
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-sm text-blue-600 hover:text-blue-700 h-auto"
                        onClick={() => {
                          announce(
                            'Функция восстановления пароля будет доступна в ближайшее время',
                            'polite'
                          );
                        }}
                        disabled={isFormLoading}
                      >
                        Забыли пароль?
                      </Button>
                    </div>

                    {/* Submit button */}
                    <Button
                      type="submit"
                      className={cn(
                        'w-full h-12 font-medium transition-all duration-200 text-white rounded-lg',
                        'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
                        'shadow-sm hover:shadow-md',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2'
                      )}
                      disabled={isFormLoading || !isDirty}
                      aria-describedby="submit-help"
                    >
                      {isFormLoading ? (
                        <>
                          <Loader2
                            className="mr-2 h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          <span>Вход в систему...</span>
                        </>
                      ) : (
                        <span>Войти в систему</span>
                      )}
                    </Button>

                    <VisuallyHidden>
                      {!isValid &&
                        isDirty &&
                        'Исправьте ошибки в форме перед отправкой'}
                      {!isDirty && 'Заполните форму для входа в систему'}
                    </VisuallyHidden>
                  </form>
                </FocusTrap>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};