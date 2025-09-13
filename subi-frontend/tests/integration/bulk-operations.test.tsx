import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '@/store/api/baseApi'
import UserListPage from '@/pages/admin/UserListPage'
import { User } from '@/types/user'

// Mock user data
const mockUsers: User[] = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+996555123456',
    status: 'ACTIVE',
    roles: ['USER'],
    permissions: ['READ_PROFILE'],
    isEmailVerified: true,
    isPhoneVerified: true,
    lastLoginAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+996555789012',
    status: 'ACTIVE',
    roles: ['USER'],
    permissions: ['READ_PROFILE'],
    isEmailVerified: true,
    isPhoneVerified: false,
    lastLoginAt: '2024-01-10T14:20:00Z',
    createdAt: '2024-01-02T09:15:00Z',
    updatedAt: '2024-01-10T14:20:00Z'
  },
  {
    id: 3,
    username: 'bob_wilson',
    email: 'bob@example.com',
    firstName: 'Bob',
    lastName: 'Wilson',
    phone: '+996555345678',
    status: 'INACTIVE',
    roles: ['USER'],
    permissions: ['READ_PROFILE'],
    isEmailVerified: false,
    isPhoneVerified: true,
    lastLoginAt: null,
    createdAt: '2024-01-14T16:45:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  },
  {
    id: 4,
    username: 'alice_brown',
    email: 'alice@example.com',
    firstName: 'Alice',
    lastName: 'Brown',
    phone: '+996555567890',
    status: 'PENDING',
    roles: ['USER'],
    permissions: ['READ_PROFILE'],
    isEmailVerified: true,
    isPhoneVerified: true,
    lastLoginAt: null,
    createdAt: '2024-01-13T11:20:00Z',
    updatedAt: '2024-01-13T11:20:00Z'
  }
]

// Mock API response
const mockSearchResponse = {
  users: mockUsers,
  totalCount: 4,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10
}

// Mock bulk operation results
const mockBulkResults = {
  successCount: 2,
  failureCount: 0,
  results: [
    { userId: 1, success: true, message: 'User updated successfully' },
    { userId: 2, success: true, message: 'User updated successfully' }
  ]
}

// Mock API handlers
const mockApiHandlers = {
  searchUsers: vi.fn(),
  bulkUpdateUsers: vi.fn(),
  bulkDeleteUsers: vi.fn(),
  bulkActivateUsers: vi.fn(),
  bulkDeactivateUsers: vi.fn(),
  bulkAssignRole: vi.fn(),
  bulkRemoveRole: vi.fn(),
  exportUsers: vi.fn()
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

// Mock the API hooks
vi.mock('@/store/api/userApi', () => ({
  useSearchUsersQuery: () => {
    mockApiHandlers.searchUsers()
    return {
      data: mockSearchResponse,
      isLoading: false,
      isError: false,
      error: null
    }
  },
  useBulkUpdateUsersMutation: () => [
    mockApiHandlers.bulkUpdateUsers,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null
    }
  ],
  useBulkDeleteUsersMutation: () => [
    mockApiHandlers.bulkDeleteUsers,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null
    }
  ],
  useBulkActivateUsersMutation: () => [
    mockApiHandlers.bulkActivateUsers,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null
    }
  ],
  useBulkDeactivateUsersMutation: () => [
    mockApiHandlers.bulkDeactivateUsers,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null
    }
  ],
  useBulkAssignRoleMutation: () => [
    mockApiHandlers.bulkAssignRole,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null
    }
  ],
  useBulkRemoveRoleMutation: () => [
    mockApiHandlers.bulkRemoveRole,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null
    }
  ],
  useExportUsersMutation: () => [
    mockApiHandlers.exportUsers,
    {
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null
    }
  ]
}))

vi.mock('@/store/api/roleApi', () => ({
  useGetRolesQuery: () => ({
    data: [
      { id: 1, name: 'ADMIN', description: 'Administrator' },
      { id: 2, name: 'USER', description: 'Regular User' },
      { id: 3, name: 'CREDIT_MANAGER', description: 'Credit Manager' }
    ],
    isLoading: false
  })
}))

describe('Bulk Operations Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockApiHandlers.bulkUpdateUsers.mockResolvedValue({
      data: mockBulkResults
    })
    mockApiHandlers.bulkDeleteUsers.mockResolvedValue({
      data: mockBulkResults
    })
    mockApiHandlers.bulkActivateUsers.mockResolvedValue({
      data: mockBulkResults
    })
    mockApiHandlers.bulkDeactivateUsers.mockResolvedValue({
      data: mockBulkResults
    })
    mockApiHandlers.bulkAssignRole.mockResolvedValue({
      data: mockBulkResults
    })
    mockApiHandlers.bulkRemoveRole.mockResolvedValue({
      data: mockBulkResults
    })
    mockApiHandlers.exportUsers.mockResolvedValue({
      data: new Blob(['user data'], { type: 'text/csv' })
    })
  })

  it('should enable bulk actions when users are selected', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Initially, bulk actions should be disabled
    const bulkActionsToolbar = screen.queryByTestId('bulk-actions-toolbar')
    expect(bulkActionsToolbar).not.toBeInTheDocument()

    // Select users
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // First user checkbox (skip header)
    await user.click(checkboxes[2]) // Second user checkbox

    // Bulk actions toolbar should appear
    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
    })

    // Should show selected count
    expect(screen.getByText('2 users selected')).toBeInTheDocument()
  })

  it('should select all users when header checkbox is clicked', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Click select all checkbox
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i })
    await user.click(selectAllCheckbox)

    // All users should be selected
    await waitFor(() => {
      expect(screen.getByText('4 users selected')).toBeInTheDocument()
    })

    // All individual checkboxes should be checked
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.slice(1).forEach(checkbox => {
      expect(checkbox).toBeChecked()
    })
  })

  it('should deselect all users when clear selection is clicked', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select all users
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i })
    await user.click(selectAllCheckbox)

    await waitFor(() => {
      expect(screen.getByText('4 users selected')).toBeInTheDocument()
    })

    // Clear selection
    const clearButton = screen.getByRole('button', { name: /clear selection/i })
    await user.click(clearButton)

    // No users should be selected
    expect(screen.queryByTestId('bulk-actions-toolbar')).not.toBeInTheDocument()
  })

  it('should perform bulk activate operation', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select inactive users
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[3]) // Bob Wilson (inactive)

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
    })

    // Click bulk activate button
    const activateButton = screen.getByRole('button', { name: /activate/i })
    await user.click(activateButton)

    // Confirm action in dialog
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    // Verify API call
    await waitFor(() => {
      expect(mockApiHandlers.bulkActivateUsers).toHaveBeenCalledWith({
        userIds: [3]
      })
    })
  })

  it('should perform bulk deactivate operation', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select active users
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // John Doe (active)
    await user.click(checkboxes[2]) // Jane Smith (active)

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
    })

    // Click bulk deactivate button
    const deactivateButton = screen.getByRole('button', { name: /deactivate/i })
    await user.click(deactivateButton)

    // Confirm action in dialog
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    // Verify API call
    await waitFor(() => {
      expect(mockApiHandlers.bulkDeactivateUsers).toHaveBeenCalledWith({
        userIds: [1, 2]
      })
    })
  })

  it('should perform bulk role assignment', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select users
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // John Doe
    await user.click(checkboxes[2]) // Jane Smith

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
    })

    // Click assign role button
    const assignRoleButton = screen.getByRole('button', { name: /assign role/i })
    await user.click(assignRoleButton)

    // Select role in dialog
    const roleSelect = screen.getByRole('combobox', { name: /select role/i })
    await user.click(roleSelect)
    const adminOption = screen.getByText('ADMIN')
    await user.click(adminOption)

    // Confirm action
    const confirmButton = screen.getByRole('button', { name: /assign/i })
    await user.click(confirmButton)

    // Verify API call
    await waitFor(() => {
      expect(mockApiHandlers.bulkAssignRole).toHaveBeenCalledWith({
        userIds: [1, 2],
        roleId: 1
      })
    })
  })

  it('should perform bulk role removal', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select users
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // John Doe
    await user.click(checkboxes[2]) // Jane Smith

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
    })

    // Click remove role button
    const removeRoleButton = screen.getByRole('button', { name: /remove role/i })
    await user.click(removeRoleButton)

    // Select role in dialog
    const roleSelect = screen.getByRole('combobox', { name: /select role/i })
    await user.click(roleSelect)
    const userOption = screen.getByText('USER')
    await user.click(userOption)

    // Confirm action
    const confirmButton = screen.getByRole('button', { name: /remove/i })
    await user.click(confirmButton)

    // Verify API call
    await waitFor(() => {
      expect(mockApiHandlers.bulkRemoveRole).toHaveBeenCalledWith({
        userIds: [1, 2],
        roleId: 2
      })
    })
  })

  it('should perform bulk delete operation with confirmation', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select users
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // John Doe
    await user.click(checkboxes[2]) // Jane Smith

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
    })

    // Click bulk delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    // Should show confirmation dialog with warning
    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument()
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument()

    // Type confirmation text
    const confirmInput = screen.getByPlaceholderText(/type delete to confirm/i)
    await user.type(confirmInput, 'DELETE')

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /delete users/i })
    await user.click(confirmButton)

    // Verify API call
    await waitFor(() => {
      expect(mockApiHandlers.bulkDeleteUsers).toHaveBeenCalledWith({
        userIds: [1, 2]
      })
    })
  })

  it('should prevent bulk delete without proper confirmation', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select users
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // John Doe

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
    })

    // Click bulk delete button
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await user.click(deleteButton)

    // Try to confirm without typing DELETE
    const confirmButton = screen.getByRole('button', { name: /delete users/i })
    expect(confirmButton).toBeDisabled()

    // Type wrong confirmation
    const confirmInput = screen.getByPlaceholderText(/type delete to confirm/i)
    await user.type(confirmInput, 'delete')

    // Should still be disabled (case sensitive)
    expect(confirmButton).toBeDisabled()
  })

  it('should export selected users', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select users
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // John Doe
    await user.click(checkboxes[2]) // Jane Smith

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
    })

    // Click export button
    const exportButton = screen.getByRole('button', { name: /export/i })
    await user.click(exportButton)

    // Select export format
    const csvOption = screen.getByRole('radio', { name: /csv/i })
    await user.click(csvOption)

    // Confirm export
    const confirmButton = screen.getByRole('button', { name: /export users/i })
    await user.click(confirmButton)

    // Verify API call
    await waitFor(() => {
      expect(mockApiHandlers.exportUsers).toHaveBeenCalledWith({
        userIds: [1, 2],
        format: 'csv'
      })
    })
  })

  it('should show progress indicator during bulk operations', async () => {
    // Mock loading state
    vi.mocked(mockApiHandlers.bulkActivateUsers).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: mockBulkResults }), 1000))
    )

    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select users
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[3]) // Bob Wilson

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
    })

    // Click bulk activate
    const activateButton = screen.getByRole('button', { name: /activate/i })
    await user.click(activateButton)

    // Confirm action
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    // Should show loading indicator
    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument()
    })
  })

  it('should show bulk operation results summary', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select users
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // John Doe
    await user.click(checkboxes[2]) // Jane Smith

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
    })

    // Perform bulk activate
    const activateButton = screen.getByRole('button', { name: /activate/i })
    await user.click(activateButton)

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    // Should show results summary
    await waitFor(() => {
      expect(screen.getByText(/2 users updated successfully/i)).toBeInTheDocument()
      expect(screen.getByText(/0 failures/i)).toBeInTheDocument()
    })
  })

  it('should handle bulk operation errors gracefully', async () => {
    // Mock API error
    mockApiHandlers.bulkActivateUsers.mockRejectedValue({
      data: {
        message: 'Bulk operation failed',
        details: ['Insufficient permissions for user 1']
      }
    })

    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select users
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[1]) // John Doe

    await waitFor(() => {
      expect(screen.getByTestId('bulk-actions-toolbar')).toBeInTheDocument()
    })

    // Perform bulk activate
    const activateButton = screen.getByRole('button', { name: /activate/i })
    await user.click(activateButton)

    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    await user.click(confirmButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/bulk operation failed/i)).toBeInTheDocument()
    })
  })
})