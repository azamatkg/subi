import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import UserAddEditPage from '@/pages/admin/UserAddEditPage'
import { baseApi } from '@/store/api/baseApi'
import { User, UserRole, UserStatus } from '@/types/user'

// Mock the API endpoints
const mockUserApi = {
  useCreateUserMutation: vi.fn(),
  useCheckUsernameAvailabilityQuery: vi.fn(),
  useCheckEmailAvailabilityQuery: vi.fn(),
  useGetRolesQuery: vi.fn(),
  useGetPermissionsQuery: vi.fn(),
}

vi.mock('@/store/api/userApi', () => ({
  userApi: mockUserApi,
  useCreateUserMutation: () => mockUserApi.useCreateUserMutation(),
  useCheckUsernameAvailabilityQuery: (username: string) => 
    mockUserApi.useCheckUsernameAvailabilityQuery(username),
  useCheckEmailAvailabilityQuery: (email: string) => 
    mockUserApi.useCheckEmailAvailabilityQuery(email),
}))

vi.mock('@/store/api/roleApi', () => ({
  useGetRolesQuery: () => mockUserApi.useGetRolesQuery(),
}))

vi.mock('@/store/api/permissionApi', () => ({
  useGetPermissionsQuery: () => mockUserApi.useGetPermissionsQuery(),
}))

// Mock react-router-dom navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  }
})

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  })
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createTestStore()
  return (
    <Provider store={store}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          {children}
        </I18nextProvider>
      </BrowserRouter>
    </Provider>
  )
}

// Mock data
const mockRoles: UserRole[] = [
  { id: '1', name: 'ADMIN', displayName: 'Administrator', permissions: [] },
  { id: '2', name: 'CREDIT_MANAGER', displayName: 'Credit Manager', permissions: [] },
  { id: '3', name: 'CREDIT_ANALYST', displayName: 'Credit Analyst', permissions: [] },
]

const mockCreatedUser: User = {
  id: '123',
  username: 'newuser',
  email: 'newuser@example.com',
  firstName: 'John',
  lastName: 'Doe',
  middleName: 'Michael',
  phoneNumber: '+996555123456',
  dateOfBirth: '1990-01-15',
  status: UserStatus.ACTIVE,
  roles: [mockRoles[0]],
  permissions: [],
  metadata: {
    lastLoginAt: null,
    loginAttempts: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    version: 1,
  },
  preferences: {
    language: 'en',
    timezone: 'Asia/Bishkek',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    theme: 'light',
    dateFormat: 'DD/MM/YYYY',
    currency: 'KGS',
  },
}

describe('User Creation Workflow Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock returns
    mockUserApi.useCreateUserMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false, error: null, isSuccess: false }
    ])

    mockUserApi.useCheckUsernameAvailabilityQuery.mockReturnValue({
      data: { available: true },
      isLoading: false,
      error: null,
    })

    mockUserApi.useCheckEmailAvailabilityQuery.mockReturnValue({
      data: { available: true },
      isLoading: false,
      error: null,
    })

    mockUserApi.useGetRolesQuery.mockReturnValue({
      data: mockRoles,
      isLoading: false,
      error: null,
    })

    mockUserApi.useGetPermissionsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })
  })

  it('should complete full user creation workflow successfully', async () => {
    const mockCreateUser = vi.fn().mockResolvedValue({ data: mockCreatedUser })
    mockUserApi.useCreateUserMutation.mockReturnValue([
      mockCreateUser,
      { isLoading: false, error: null, isSuccess: false }
    ])

    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    // Verify form is rendered
    expect(screen.getByRole('heading', { name: /add new user/i })).toBeInTheDocument()

    // Fill out required fields
    await user.type(screen.getByLabelText(/username/i), 'newuser')
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')
    await user.type(screen.getByLabelText(/middle name/i), 'Michael')
    await user.type(screen.getByLabelText(/phone number/i), '+996555123456')

    // Set date of birth
    const dobInput = screen.getByLabelText(/date of birth/i)
    await user.clear(dobInput)
    await user.type(dobInput, '1990-01-15')

    // Select role
    const roleSelect = screen.getByRole('combobox', { name: /select roles/i })
    await user.click(roleSelect)
    await user.click(screen.getByText('Administrator'))

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create user/i })
    await user.click(submitButton)

    // Verify API call was made with correct data
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@example.com',
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Michael',
        phoneNumber: '+996555123456',
        dateOfBirth: '1990-01-15',
        roleIds: ['1'],
        status: UserStatus.ACTIVE,
      })
    })
  })

  it('should handle real-time username validation during creation', async () => {
    // Mock username as unavailable
    mockUserApi.useCheckUsernameAvailabilityQuery.mockImplementation((username) => {
      if (username === 'existinguser') {
        return {
          data: { available: false },
          isLoading: false,
          error: null,
        }
      }
      return {
        data: { available: true },
        isLoading: false,
        error: null,
      }
    })

    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    // Type an existing username
    const usernameInput = screen.getByLabelText(/username/i)
    await user.type(usernameInput, 'existinguser')

    // Wait for validation to trigger
    await waitFor(() => {
      expect(screen.getByText(/username is already taken/i)).toBeInTheDocument()
    })

    // Change to available username
    await user.clear(usernameInput)
    await user.type(usernameInput, 'newuser')

    // Validation error should disappear
    await waitFor(() => {
      expect(screen.queryByText(/username is already taken/i)).not.toBeInTheDocument()
    })
  })

  it('should handle real-time email validation during creation', async () => {
    // Mock email as unavailable
    mockUserApi.useCheckEmailAvailabilityQuery.mockImplementation((email) => {
      if (email === 'existing@example.com') {
        return {
          data: { available: false },
          isLoading: false,
          error: null,
        }
      }
      return {
        data: { available: true },
        isLoading: false,
        error: null,
      }
    })

    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    // Type an existing email
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'existing@example.com')

    // Wait for validation to trigger
    await waitFor(() => {
      expect(screen.getByText(/email is already in use/i)).toBeInTheDocument()
    })

    // Change to available email
    await user.clear(emailInput)
    await user.type(emailInput, 'new@example.com')

    // Validation error should disappear
    await waitFor(() => {
      expect(screen.queryByText(/email is already in use/i)).not.toBeInTheDocument()
    })
  })

  it('should handle form validation errors during creation', async () => {
    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /create user/i })
    await user.click(submitButton)

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
    })

    // Fill invalid email
    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
    })
  })

  it('should handle API errors during creation', async () => {
    const mockCreateUser = vi.fn().mockRejectedValue({
      data: { message: 'Server error occurred' }
    })
    mockUserApi.useCreateUserMutation.mockReturnValue([
      mockCreateUser,
      { 
        isLoading: false, 
        error: { data: { message: 'Server error occurred' } }, 
        isSuccess: false 
      }
    ])

    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    // Fill out form with valid data
    await user.type(screen.getByLabelText(/username/i), 'newuser')
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create user/i })
    await user.click(submitButton)

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/server error occurred/i)).toBeInTheDocument()
    })
  })

  it('should show loading state during creation', async () => {
    const mockCreateUser = vi.fn()
    mockUserApi.useCreateUserMutation.mockReturnValue([
      mockCreateUser,
      { isLoading: true, error: null, isSuccess: false }
    ])

    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    // Submit button should show loading state
    const submitButton = screen.getByRole('button', { name: /creating/i })
    expect(submitButton).toBeDisabled()
  })

  it('should navigate to user list after successful creation', async () => {
    const mockCreateUser = vi.fn().mockResolvedValue({ data: mockCreatedUser })
    mockUserApi.useCreateUserMutation.mockReturnValue([
      mockCreateUser,
      { isLoading: false, error: null, isSuccess: true }
    ])

    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    // Fill out and submit form
    await user.type(screen.getByLabelText(/username/i), 'newuser')
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')

    const submitButton = screen.getByRole('button', { name: /create user/i })
    await user.click(submitButton)

    // Verify navigation occurred
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users')
    })
  })

  it('should handle multiple role selection during creation', async () => {
    const mockCreateUser = vi.fn().mockResolvedValue({ data: mockCreatedUser })
    mockUserApi.useCreateUserMutation.mockReturnValue([
      mockCreateUser,
      { isLoading: false, error: null, isSuccess: false }
    ])

    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    // Fill required fields
    await user.type(screen.getByLabelText(/username/i), 'newuser')
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/first name/i), 'John')
    await user.type(screen.getByLabelText(/last name/i), 'Doe')

    // Select multiple roles
    const roleSelect = screen.getByRole('combobox', { name: /select roles/i })
    await user.click(roleSelect)
    await user.click(screen.getByText('Administrator'))
    await user.click(screen.getByText('Credit Manager'))

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create user/i })
    await user.click(submitButton)

    // Verify API call includes multiple roles
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          roleIds: expect.arrayContaining(['1', '2'])
        })
      )
    })
  })
})