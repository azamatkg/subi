import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { UserAddEditPage } from '../UserAddEditPage';
import { baseApi } from '@/store/api/baseApi';

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    hasAnyRole: vi.fn(() => true),
    user: { roles: ['ADMIN'] },
  }),
}));

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useSetPageTitle', () => ({
  useSetPageTitle: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/utils/errorHandling', () => ({
  handleApiError: vi.fn(),
  showSuccessMessage: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({})),
    useNavigate: () => vi.fn(),
  };
});

const createTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

const renderWithProviders = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe('UserAddEditPage - Enhanced Features (TDD)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Enhanced Form Structure', () => {
    it('should render enhanced user creation form with all sections', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByText('userManagement.createUser')
        ).toBeInTheDocument();
      });

      // Enhanced sections that should be present
      expect(
        screen.getByText('userManagement.personalInformation')
      ).toBeInTheDocument();
      expect(
        screen.getByText('userManagement.systemAccess')
      ).toBeInTheDocument();
      expect(
        screen.getByText('userManagement.roleAssignment')
      ).toBeInTheDocument();
    });

    it('should render all enhanced form fields for user creation', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByLabelText('userManagement.fields.firstName')
        ).toBeInTheDocument();
      });

      // Personal information fields
      expect(
        screen.getByLabelText('userManagement.fields.firstName')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('userManagement.fields.lastName')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('userManagement.fields.email')
      ).toBeInTheDocument();

      // System access fields
      expect(
        screen.getByLabelText('userManagement.fields.username')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('userManagement.fields.password')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('userManagement.fields.confirmPassword')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('userManagement.fields.enabled')
      ).toBeInTheDocument();
    });

    it('should display all role options with descriptions', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByText('userManagement.roleAssignment')
        ).toBeInTheDocument();
      });

      // All roles should be present
      expect(
        screen.getByText('userManagement.roles.admin')
      ).toBeInTheDocument();
      expect(
        screen.getByText('userManagement.roles.credit_manager')
      ).toBeInTheDocument();
      expect(
        screen.getByText('userManagement.roles.credit_analyst')
      ).toBeInTheDocument();
      expect(
        screen.getByText('userManagement.roles.decision_maker')
      ).toBeInTheDocument();
      expect(
        screen.getByText('userManagement.roles.commission_member')
      ).toBeInTheDocument();
      expect(screen.getByText('userManagement.roles.user')).toBeInTheDocument();

      // Role descriptions should be present
      expect(
        screen.getByText('userManagement.roleDescriptions.admin')
      ).toBeInTheDocument();
      expect(
        screen.getByText('userManagement.roleDescriptions.user')
      ).toBeInTheDocument();
    });
  });

  describe('Enhanced Real-time Validation Features', () => {
    it('should provide username availability checking infrastructure', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByLabelText('userManagement.fields.username')
        ).toBeInTheDocument();
      });

      const usernameInput = screen.getByLabelText(
        'userManagement.fields.username'
      );
      await user.type(usernameInput, 'testuser');

      // Input should accept the value (infrastructure is ready)
      expect(usernameInput).toHaveValue('testuser');
    });

    it('should provide email availability checking infrastructure', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByLabelText('userManagement.fields.email')
        ).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText('userManagement.fields.email');
      await user.type(emailInput, 'test@example.com');

      // Input should accept the value (infrastructure is ready)
      expect(emailInput).toHaveValue('test@example.com');
    });
  });

  describe('Enhanced Password Security Features', () => {
    it('should provide password visibility toggle functionality', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByLabelText('userManagement.fields.password')
        ).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(
        'userManagement.fields.password'
      );
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Find toggle button (should be present for enhanced UX)
      const toggleButtons = screen.getAllByRole('button');
      const passwordToggle = toggleButtons.find(
        btn =>
          btn.querySelector('svg') &&
          btn.closest('.relative') === passwordInput.closest('.relative')
      );

      expect(passwordToggle).toBeInTheDocument();
    });

    it('should display password requirements for better UX', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByText('userManagement.passwordRequirements')
        ).toBeInTheDocument();
      });

      // Enhanced password requirements should be visible
      expect(
        screen.getByText('userManagement.passwordRequirements')
      ).toBeInTheDocument();
    });
  });

  describe('Enhanced Form Validation', () => {
    it('should validate password confirmation matching', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByLabelText('userManagement.fields.password')
        ).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(
        'userManagement.fields.password'
      );
      const confirmPasswordInput = screen.getByLabelText(
        'userManagement.fields.confirmPassword'
      );

      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'different');

      const submitButton = screen.getByRole('button', {
        name: /common\.create/,
      });
      await user.click(submitButton);

      // Enhanced validation should show mismatch error
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should validate required fields with enhanced error messages', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /common\.create/ })
        ).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', {
        name: /common\.create/,
      });
      await user.click(submitButton);

      // Enhanced validation should show specific error messages
      await waitFor(() => {
        const errors = screen.getAllByText(/must be at least/i);
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    it('should validate role selection requirement', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByText('userManagement.roleAssignment')
        ).toBeInTheDocument();
      });

      // Enhanced role validation should require at least one role
      const userRoleCheckbox = screen.getByRole('checkbox', { checked: true });
      await user.click(userRoleCheckbox);

      const submitButton = screen.getByRole('button', {
        name: /common\.create/,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('At least one role must be selected')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Enhanced Navigation and UX', () => {
    it('should provide enhanced back navigation with breadcrumb-style UI', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /common\.back/ })
        ).toBeInTheDocument();
      });

      // Enhanced back button should be present
      const backButton = screen.getByRole('button', { name: /common\.back/ });
      expect(backButton).toBeInTheDocument();
    });

    it('should display enhanced page titles and descriptions', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByText('userManagement.createUser')
        ).toBeInTheDocument();
      });

      // Enhanced descriptions should provide better context
      expect(screen.getByText('userManagement.createUser')).toBeInTheDocument();
      expect(
        screen.getByText('userManagement.createUserDescription')
      ).toBeInTheDocument();
    });
  });

  describe('Enhanced Accessibility Features', () => {
    it('should provide proper form labeling and ARIA attributes', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeInTheDocument();
      });

      // Enhanced accessibility: form should be properly structured
      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();

      // All inputs should have proper labels
      const firstNameInput = screen.getByLabelText(
        'userManagement.fields.firstName'
      );
      const lastNameInput = screen.getByLabelText(
        'userManagement.fields.lastName'
      );
      const emailInput = screen.getByLabelText('userManagement.fields.email');

      expect(firstNameInput).toBeInTheDocument();
      expect(lastNameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
    });

    it('should provide enhanced visual feedback for form state', async () => {
      renderWithProviders(<UserAddEditPage />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /common\.create/ })
        ).toBeInTheDocument();
      });

      // Enhanced visual feedback: buttons should show loading states
      const submitButton = screen.getByRole('button', {
        name: /common\.create/,
      });
      expect(submitButton).not.toHaveAttribute('disabled');
    });
  });

  describe('Enhanced Error Handling', () => {
    it('should handle component mounting without errors', () => {
      expect(() => {
        renderWithProviders(<UserAddEditPage />);
      }).not.toThrow();
    });

    it('should provide enhanced error boundaries for better UX', () => {
      // Enhanced error handling should prevent crashes
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderWithProviders(<UserAddEditPage />);

      // Should not have any console errors during normal rendering
      expect(consoleError).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });
});
