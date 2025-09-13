import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '@/store/api/baseApi'
import UserListPage from '@/pages/admin/UserListPage'
import UserAddEditPage from '@/pages/admin/UserAddEditPage'
import UserDetailPage from '@/pages/admin/UserDetailPage'
import { User, UserRole } from '@/types/user'

// Mock user profiles with different roles
const adminUser: User = {
  id: 1,
  username: 'admin_user',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  phone: '+996555123456',
  status: 'ACTIVE',
  roles: ['ADMIN'],
  permissions: ['READ_USERS', 'WRITE_USERS', 'DELETE_USERS', 'MANAGE_ROLES'],
  isEmailVerified: true,
  isPhoneVerified: true,
  lastLoginAt: '2024-01-15T10:30:00Z',
  createdAt: '2024-01-01T08:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
}

const creditManagerUser: User = {
  id: 2,
  username: 'credit_manager',
  email: 'credit@example.com',
  firstName: 'Credit',
  lastName: 'Manager',
  phone: '+996555789012',
  status: 'ACTIVE',
  roles: ['CREDIT_MANAGER'],
  permissions: ['READ_CREDITS', 'WRITE_CREDITS'],
  isEmailVerified: true,
  isPhoneVerified: true,
  lastLoginAt: '2024-01-15T09:00:00Z',
  createdAt: '2024-01-02T08:00:00Z',
  updatedAt: '2024-01-15T09:00:00Z'
}

const regularUser: User = {
  id: 3,
  username: 'regular_user',
  email: 'user@example.com',
  firstName: 'Regular',
  lastName: 'User',
  phone: '+996555345678',
  status: 'ACTIVE',
  roles: ['USER'],
  permissions: ['READ_PROFILE'],
  isEmailVerified: true,
  isPhoneVerified: true,
  lastLoginAt: '2024-01-15T08:00:00Z',
  createdAt: '2024-01-03T08:00:00Z',
  updatedAt: '2024-01-15T08:00:00Z'
}

// Mock API handlers
const mockApiHandlers = {
  getCurrentUser: vi.fn(),
  searchUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  getUserById: vi.fn()
}

// Mock auth context
const mockAuthContext = {
  currentUser: adminUser,
  hasPermission: vi.fn(),
  hasRole: vi.fn(),
  isAdmin: vi.fn()
}

// Create mock store
const createMockStore = (currentUser: User) => {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: (state = { currentUser }, action) => state
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware)
  })
}

// Test wrapper component
const TestWrapper = ({ 
  children, 
  currentUser = adminUser 
}: { 
  children: React.ReactNode
  currentUser?: User 
}) => {
  const store = createMockStore(currentUser)
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  )
}

// Mock protected route component
const ProtectedRoute = ({ children, requiredPermissions }: { 
  children: React.ReactNode
  requiredPermissions: string[]
}) => {
  const hasPermission = mockAuthContext.hasPermission
  const hasAccess = requiredPermissions.every(permission => hasPermission(permission))
  
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />
  }
  
  return <>{children}</>
}

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn(),
    Navigate: ({ to }: { to: string }) => <div data-testid="redirect">{to}</div>
  }
})

// Mock auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthContext
}))

// Mock the API hooks
vi.mock('@/store/api/userApi', () => ({
  useSearchUsersQuery: () => {
    mockApiHandlers.searchUsers()
    return {
      data: {
        users: [adminUser, creditManagerUser, regularUser],
        totalCount: 3,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10
      },
      isLoading: false,
      isError: false,
      error: null
    }
  },
  useGetUserByIdQuery: () => {
    mockApiHandlers.getUserById()
    return {
      data: regularUser,
      isLoading: false,
      isError: false,
      error: null
    }
  },
  useCreateUserMutation: () => [
    mockApiHandlers.createUser,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null
    }
  ],
  useUpdateUserMutation: () => [
    mockApiHandlers.updateUser,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null
    }
  ],
  useDeleteUserMutation: () => [
    mockApiHandlers.deleteUser,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null
    }
  ]
}))

describe('Role-Based Access Control Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.hasPermission.mockImplementation((permission: string) => {
      return mockAuthContext.currentUser.permissions.includes(permission)
    })
    mockAuthContext.hasRole.mockImplementation((role: string) => {
      return mockAuthContext.currentUser.roles.includes(role)
    })
    mockAuthContext.isAdmin.mockImplementation(() => {
      return mockAuthContext.currentUser.roles.includes('ADMIN')
    })
  })

  describe('Admin User Access', () => {
    beforeEach(() => {
      mockAuthContext.currentUser = adminUser
    })

    it('should allow admin to access user management pages', async () => {
      render(
        <TestWrapper currentUser={adminUser}>
          <ProtectedRoute requiredPermissions={['READ_USERS']}>
            <UserListPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should render user list page
      await waitFor(() => {
        expect(screen.getByText('admin_user')).toBeInTheDocument()
        expect(screen.getByText('credit_manager')).toBeInTheDocument()
        expect(screen.getByText('regular_user')).toBeInTheDocument()
      })

      // Should not show unauthorized redirect
      expect(screen.queryByTestId('redirect')).not.toBeInTheDocument()
    })

    it('should allow admin to create new users', async () => {
      render(
        <TestWrapper currentUser={adminUser}>
          <ProtectedRoute requiredPermissions={['WRITE_USERS']}>
            <UserAddEditPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should render create user form
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument()
      })

      // Should show all role options for admin
      const roleSelect = screen.getByRole('combobox', { name: /roles/i })
      await user.click(roleSelect)

      expect(screen.getByText('ADMIN')).toBeInTheDocument()
      expect(screen.getByText('CREDIT_MANAGER')).toBeInTheDocument()
      expect(screen.getByText('USER')).toBeInTheDocument()
    })

    it('should allow admin to edit any user', async () => {
      render(
        <TestWrapper currentUser={adminUser}>
          <ProtectedRoute requiredPermissions={['WRITE_USERS']}>
            <UserAddEditPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should render edit form
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /update user/i })).toBeInTheDocument()
      })

      // Should be able to edit sensitive fields
      expect(screen.getByDisplayValue('regular_user')).not.toBeDisabled()
      expect(screen.getByDisplayValue('user@example.com')).not.toBeDisabled()
    })

    it('should allow admin to delete users', async () => {
      render(
        <TestWrapper currentUser={adminUser}>
          <ProtectedRoute requiredPermissions={['DELETE_USERS']}>
            <UserDetailPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should show delete button
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete user/i })).toBeInTheDocument()
      })
    })

    it('should allow admin to perform bulk operations', async () => {
      render(
        <TestWrapper currentUser={adminUser}>
          <ProtectedRoute requiredPermissions={['WRITE_USERS']}>
            <UserListPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('admin_user')).toBeInTheDocument()
      })

      // Select users
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1]) // First user checkbox

      // Should show bulk actions toolbar
      await waitFor(() => {
        expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
      })

      // Should show all bulk action options
      expect(screen.getByRole('button', { name: /activate/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /deactivate/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /assign role/i })).toBeInTheDocument()
    })
  })

  describe('Credit Manager Access', () => {
    beforeEach(() => {
      mockAuthContext.currentUser = creditManagerUser
    })

    it('should deny credit manager access to user management', async () => {
      render(
        <TestWrapper currentUser={creditManagerUser}>
          <ProtectedRoute requiredPermissions={['READ_USERS']}>
            <UserListPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should redirect to unauthorized
      expect(screen.getByTestId('redirect')).toHaveTextContent('/unauthorized')
    })

    it('should deny credit manager access to user creation', async () => {
      render(
        <TestWrapper currentUser={creditManagerUser}>
          <ProtectedRoute requiredPermissions={['WRITE_USERS']}>
            <UserAddEditPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should redirect to unauthorized
      expect(screen.getByTestId('redirect')).toHaveTextContent('/unauthorized')
    })

    it('should deny credit manager access to user editing', async () => {
      render(
        <TestWrapper currentUser={creditManagerUser}>
          <ProtectedRoute requiredPermissions={['WRITE_USERS']}>
            <UserAddEditPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should redirect to unauthorized
      expect(screen.getByTestId('redirect')).toHaveTextContent('/unauthorized')
    })
  })

  describe('Regular User Access', () => {
    beforeEach(() => {
      mockAuthContext.currentUser = regularUser
    })

    it('should deny regular user access to user management', async () => {
      render(
        <TestWrapper currentUser={regularUser}>
          <ProtectedRoute requiredPermissions={['READ_USERS']}>
            <UserListPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should redirect to unauthorized
      expect(screen.getByTestId('redirect')).toHaveTextContent('/unauthorized')
    })

    it('should deny regular user access to user creation', async () => {
      render(
        <TestWrapper currentUser={regularUser}>
          <ProtectedRoute requiredPermissions={['WRITE_USERS']}>
            <UserAddEditPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should redirect to unauthorized
      expect(screen.getByTestId('redirect')).toHaveTextContent('/unauthorized')
    })

    it('should deny regular user access to user editing', async () => {
      render(
        <TestWrapper currentUser={regularUser}>
          <ProtectedRoute requiredPermissions={['WRITE_USERS']}>
            <UserAddEditPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should redirect to unauthorized
      expect(screen.getByTestId('redirect')).toHaveTextContent('/unauthorized')
    })

    it('should deny regular user access to user details', async () => {
      render(
        <TestWrapper currentUser={regularUser}>
          <ProtectedRoute requiredPermissions={['READ_USERS']}>
            <UserDetailPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should redirect to unauthorized
      expect(screen.getByTestId('redirect')).toHaveTextContent('/unauthorized')
    })
  })

  describe('Permission-Based Feature Access', () => {
    it('should show/hide features based on specific permissions', async () => {
      // Admin with all permissions
      mockAuthContext.currentUser = adminUser
      
      const { rerender } = render(
        <TestWrapper currentUser={adminUser}>
          <UserListPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('admin_user')).toBeInTheDocument()
      })

      // Should show create button for WRITE_USERS permission
      expect(screen.getByRole('button', { name: /create user/i })).toBeInTheDocument()

      // Should show export button for READ_USERS permission
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()

      // Test with limited permissions user
      const limitedUser = {
        ...adminUser,
        permissions: ['READ_USERS'] // Only read permission
      }
      
      mockAuthContext.currentUser = limitedUser
      
      rerender(
        <TestWrapper currentUser={limitedUser}>
          <UserListPage />
        </TestWrapper>
      )

      // Should hide create button without WRITE_USERS permission
      expect(screen.queryByRole('button', { name: /create user/i })).not.toBeInTheDocument()

      // Should still show export button with READ_USERS permission
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument()
    })

    it('should restrict role assignment based on user permissions', async () => {
      // User with limited role management permissions
      const limitedAdminUser = {
        ...adminUser,
        permissions: ['READ_USERS', 'WRITE_USERS'] // No MANAGE_ROLES
      }
      
      mockAuthContext.currentUser = limitedAdminUser

      render(
        <TestWrapper currentUser={limitedAdminUser}>
          <UserAddEditPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /update user/i })).toBeInTheDocument()
      })

      // Role field should be disabled or hidden without MANAGE_ROLES permission
      const roleSelect = screen.queryByRole('combobox', { name: /roles/i })
      if (roleSelect) {
        expect(roleSelect).toBeDisabled()
      } else {
        expect(roleSelect).not.toBeInTheDocument()
      }
    })

    it('should handle permission checks for bulk operations', async () => {
      mockAuthContext.currentUser = adminUser

      render(
        <TestWrapper currentUser={adminUser}>
          <UserListPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('admin_user')).toBeInTheDocument()
      })

      // Select users
      const checkboxes = screen.getAllByRole('checkbox')
      await user.click(checkboxes[1])

      await waitFor(() => {
        expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
      })

      // All bulk operations should be available for admin
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /assign role/i })).toBeInTheDocument()

      // Test with user without DELETE_USERS permission
      const limitedUser = {
        ...adminUser,
        permissions: ['READ_USERS', 'WRITE_USERS'] // No DELETE_USERS
      }
      
      mockAuthContext.currentUser = limitedUser

      // Should hide delete button
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
    })
  })

  describe('Dynamic Permission Updates', () => {
    it('should update UI when user permissions change', async () => {
      const { rerender } = render(
        <TestWrapper currentUser={regularUser}>
          <ProtectedRoute requiredPermissions={['READ_USERS']}>
            <UserListPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Initially should be unauthorized
      expect(screen.getByTestId('redirect')).toHaveTextContent('/unauthorized')

      // Update user permissions
      const upgradedUser = {
        ...regularUser,
        roles: ['ADMIN'],
        permissions: ['READ_USERS', 'WRITE_USERS', 'DELETE_USERS']
      }
      
      mockAuthContext.currentUser = upgradedUser

      rerender(
        <TestWrapper currentUser={upgradedUser}>
          <ProtectedRoute requiredPermissions={['READ_USERS']}>
            <UserListPage />
          </ProtectedRoute>
        </TestWrapper>
      )

      // Should now have access
      await waitFor(() => {
        expect(screen.queryByTestId('redirect')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling for Unauthorized Actions', () => {
    it('should handle API errors for unauthorized actions gracefully', async () => {
      // Mock API error for unauthorized action
      mockApiHandlers.deleteUser.mockRejectedValue({
        status: 403,
        data: {
          message: 'Insufficient permissions',
          code: 'FORBIDDEN'
        }
      })

      mockAuthContext.currentUser = adminUser

      render(
        <TestWrapper currentUser={adminUser}>
          <UserDetailPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete user/i })).toBeInTheDocument()
      })

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete user/i })
      await user.click(deleteButton)

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i })
      await user.click(confirmButton)

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/insufficient permissions/i)).toBeInTheDocument()
      })
    })
  })
})