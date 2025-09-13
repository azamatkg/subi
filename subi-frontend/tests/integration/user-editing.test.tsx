import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '@/store/api/baseApi'
import UserAddEditPage from '@/pages/admin/UserAddEditPage'
import { User } from '@/types/user'

// Mock user data
const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  phone: '+996555123456',
  status: 'ACTIVE',
  roles: ['USER'],
  permissions: ['READ_PROFILE'],
  isEmailVerified: true,
  isPhoneVerified: false,
  lastLoginAt: '2024-01-15T10:30:00Z',
  createdAt: '2024-01-01T08:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  profile: {
    dateOfBirth: '1990-05-15',
    address: {
      street: 'Test Street 123',
      city: 'Bishkek',
      region: 'Chui',
      postalCode: '720000',
      country: 'KG'
    },
    emergencyContact: {
      name: 'Emergency Contact',
      phone: '+996555987654',
      relationship: 'Friend'
    }
  },
  settings: {
    language: 'en',
    timezone: 'Asia/Bishkek',
    emailNotifications: true,
    smsNotifications: false
  }
}

const mockUpdatedUser: User = {
  ...mockUser,
  firstName: 'Updated',
  lastName: 'Name',
  phone: '+996555999999',
  profile: {
    ...mockUser.profile!,
    address: {
      ...mockUser.profile!.address,
      street: 'Updated Street 456'
    }
  }
}

// Mock API endpoints
const mockApiHandlers = {
  getUserById: vi.fn(),
  updateUser: vi.fn(),
  checkUsernameExists: vi.fn(),
  checkEmailExists: vi.fn(),
  getRoles: vi.fn(),
  getPermissions: vi.fn()
}

// Create mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware)
  })
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createMockStore()
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  )
}

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn()
  }
})

// Mock the API hooks
vi.mock('@/store/api/userApi', () => ({
  useGetUserByIdQuery: () => ({
    data: mockUser,
    isLoading: false,
    isError: false,
    error: null
  }),
  useUpdateUserMutation: () => [
    mockApiHandlers.updateUser,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null
    }
  ],
  useCheckUsernameExistsQuery: mockApiHandlers.checkUsernameExists,
  useCheckEmailExistsQuery: mockApiHandlers.checkEmailExists
}))

vi.mock('@/store/api/roleApi', () => ({
  useGetRolesQuery: () => ({
    data: [
      { id: 1, name: 'ADMIN', description: 'Administrator' },
      { id: 2, name: 'USER', description: 'Regular User' }
    ],
    isLoading: false
  })
}))

vi.mock('@/store/api/permissionApi', () => ({
  useGetPermissionsQuery: () => ({
    data: [
      { id: 1, name: 'READ_PROFILE', description: 'Read Profile' },
      { id: 2, name: 'WRITE_PROFILE', description: 'Write Profile' }
    ],
    isLoading: false
  })
}))

describe('User Editing Workflow Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockApiHandlers.updateUser.mockResolvedValue({
      data: mockUpdatedUser
    })
    mockApiHandlers.checkUsernameExists.mockReturnValue({
      data: { exists: false },
      isLoading: false
    })
    mockApiHandlers.checkEmailExists.mockReturnValue({
      data: { exists: false },
      isLoading: false
    })
  })

  it('should load existing user data and populate form fields', async () => {
    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    // Wait for user data to load and form to populate
    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
      expect(screen.getByDisplayValue('User')).toBeInTheDocument()
      expect(screen.getByDisplayValue('+996555123456')).toBeInTheDocument()
    })

    // Verify address fields are populated
    expect(screen.getByDisplayValue('Test Street 123')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Bishkek')).toBeInTheDocument()
    expect(screen.getByDisplayValue('720000')).toBeInTheDocument()
  })

  it('should validate form fields during editing', async () => {
    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
    })

    // Clear required field and check validation
    const firstNameField = screen.getByDisplayValue('Test')
    await user.clear(firstNameField)
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    })

    // Test invalid email format
    const emailField = screen.getByDisplayValue('test@example.com')
    await user.clear(emailField)
    await user.type(emailField, 'invalid-email')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument()
    })
  })

  it('should perform real-time username validation during editing', async () => {
    // Mock username exists check
    mockApiHandlers.checkUsernameExists.mockReturnValue({
      data: { exists: true },
      isLoading: false
    })

    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('testuser')).toBeInTheDocument()
    })

    // Change username to existing one
    const usernameField = screen.getByDisplayValue('testuser')
    await user.clear(usernameField)
    await user.type(usernameField, 'existinguser')

    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument()
    })
  })

  it('should perform real-time email validation during editing', async () => {
    // Mock email exists check
    mockApiHandlers.checkEmailExists.mockReturnValue({
      data: { exists: true },
      isLoading: false
    })

    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
    })

    // Change email to existing one
    const emailField = screen.getByDisplayValue('test@example.com')
    await user.clear(emailField)
    await user.type(emailField, 'existing@example.com')

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })

  it('should successfully update user with valid data', async () => {
    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
    })

    // Update form fields
    const firstNameField = screen.getByDisplayValue('Test')
    await user.clear(firstNameField)
    await user.type(firstNameField, 'Updated')

    const lastNameField = screen.getByDisplayValue('User')
    await user.clear(lastNameField)
    await user.type(lastNameField, 'Name')

    const phoneField = screen.getByDisplayValue('+996555123456')
    await user.clear(phoneField)
    await user.type(phoneField, '+996555999999')

    const streetField = screen.getByDisplayValue('Test Street 123')
    await user.clear(streetField)
    await user.type(streetField, 'Updated Street 456')

    // Submit form
    const submitButton = screen.getByRole('button', { name: /update user/i })
    await user.click(submitButton)

    // Verify API call
    await waitFor(() => {
      expect(mockApiHandlers.updateUser).toHaveBeenCalledWith({
        id: 1,
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+996555999999',
        profile: expect.objectContaining({
          address: expect.objectContaining({
            street: 'Updated Street 456'
          })
        })
      })
    })
  })

  it('should handle role and permission updates', async () => {
    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
    })

    // Find and update roles
    const roleSelect = screen.getByRole('combobox', { name: /roles/i })
    await user.click(roleSelect)

    // Select ADMIN role
    const adminOption = screen.getByText('ADMIN')
    await user.click(adminOption)

    // Submit form
    const submitButton = screen.getByRole('button', { name: /update user/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockApiHandlers.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: expect.arrayContaining(['ADMIN'])
        })
      )
    })
  })

  it('should handle API errors gracefully during update', async () => {
    // Mock API error
    mockApiHandlers.updateUser.mockRejectedValue({
      data: {
        message: 'User update failed',
        details: ['Email already exists']
      }
    })

    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
    })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /update user/i })
    await user.click(submitButton)

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/user update failed/i)).toBeInTheDocument()
    })
  })

  it('should prevent navigation with unsaved changes', async () => {
    const mockNavigate = vi.fn()
    vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate)

    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
    })

    // Make changes
    const firstNameField = screen.getByDisplayValue('Test')
    await user.clear(firstNameField)
    await user.type(firstNameField, 'Modified')

    // Try to navigate away (simulate browser back button or navigation)
    const beforeUnloadEvent = new Event('beforeunload')
    window.dispatchEvent(beforeUnloadEvent)

    // Should show confirmation dialog
    expect(beforeUnloadEvent.defaultPrevented).toBe(true)
  })

  it('should reset form to original values when reset button is clicked', async () => {
    render(
      <TestWrapper>
        <UserAddEditPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
    })

    // Make changes
    const firstNameField = screen.getByDisplayValue('Test')
    await user.clear(firstNameField)
    await user.type(firstNameField, 'Modified')

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset/i })
    await user.click(resetButton)

    // Verify form is reset
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test')).toBeInTheDocument()
    })
  })
})