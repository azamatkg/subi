import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '@/store/api/baseApi'
import UserListPage from '@/pages/admin/UserListPage'
import { User, UserSearchParams } from '@/types/user'

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
    status: 'INACTIVE',
    roles: ['ADMIN'],
    permissions: ['READ_PROFILE', 'WRITE_PROFILE'],
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
    status: 'PENDING',
    roles: ['CREDIT_MANAGER'],
    permissions: ['READ_PROFILE', 'MANAGE_CREDITS'],
    isEmailVerified: false,
    isPhoneVerified: true,
    lastLoginAt: null,
    createdAt: '2024-01-14T16:45:00Z',
    updatedAt: '2024-01-14T16:45:00Z'
  }
]

// Mock API response
const mockSearchResponse = {
  users: mockUsers,
  totalCount: 3,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10
}

// Mock API handlers
const mockApiHandlers = {
  searchUsers: vi.fn(),
  getUserStats: vi.fn(),
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
  useSearchUsersQuery: (params: UserSearchParams) => {
    mockApiHandlers.searchUsers(params)
    
    // Filter mock data based on search params
    let filteredUsers = [...mockUsers]
    
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filteredUsers = filteredUsers.filter(user =>
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower)
      )
    }
    
    if (params.status && params.status.length > 0) {
      filteredUsers = filteredUsers.filter(user =>
        params.status!.includes(user.status)
      )
    }
    
    if (params.roles && params.roles.length > 0) {
      filteredUsers = filteredUsers.filter(user =>
        user.roles.some(role => params.roles!.includes(role))
      )
    }
    
    if (params.isEmailVerified !== undefined) {
      filteredUsers = filteredUsers.filter(user =>
        user.isEmailVerified === params.isEmailVerified
      )
    }
    
    if (params.isPhoneVerified !== undefined) {
      filteredUsers = filteredUsers.filter(user =>
        user.isPhoneVerified === params.isPhoneVerified
      )
    }
    
    return {
      data: {
        ...mockSearchResponse,
        users: filteredUsers,
        totalCount: filteredUsers.length
      },
      isLoading: false,
      isError: false,
      error: null
    }
  },
  useGetUserStatsQuery: () => {
    mockApiHandlers.getUserStats()
    return {
      data: {
        totalUsers: 3,
        activeUsers: 1,
        inactiveUsers: 1,
        pendingUsers: 1,
        emailVerifiedUsers: 2,
        phoneVerifiedUsers: 2
      },
      isLoading: false
    }
  }
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

describe('User Search and Filter Integration', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should display all users by default', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
      expect(screen.getByText('jane_smith')).toBeInTheDocument()
      expect(screen.getByText('bob_wilson')).toBeInTheDocument()
    })

    // Verify initial API call
    expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 10
      })
    )
  })

  it('should filter users by search text', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Find search input and type
    const searchInput = screen.getByPlaceholderText(/search users/i)
    await user.type(searchInput, 'john')

    // Wait for debounced search
    await waitFor(() => {
      expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'john'
        })
      )
    })

    // Should only show John's user
    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.queryByText('jane_smith')).not.toBeInTheDocument()
    expect(screen.queryByText('bob_wilson')).not.toBeInTheDocument()
  })

  it('should filter users by status', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Find status filter
    const statusFilter = screen.getByRole('combobox', { name: /status/i })
    await user.click(statusFilter)

    // Select ACTIVE status
    const activeOption = screen.getByText('Active')
    await user.click(activeOption)

    await waitFor(() => {
      expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['ACTIVE']
        })
      )
    })

    // Should only show active users
    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.queryByText('jane_smith')).not.toBeInTheDocument()
    expect(screen.queryByText('bob_wilson')).not.toBeInTheDocument()
  })

  it('should filter users by multiple statuses', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Select multiple statuses
    const statusFilter = screen.getByRole('combobox', { name: /status/i })
    await user.click(statusFilter)

    const activeOption = screen.getByText('Active')
    await user.click(activeOption)

    const inactiveOption = screen.getByText('Inactive')
    await user.click(inactiveOption)

    await waitFor(() => {
      expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['ACTIVE', 'INACTIVE']
        })
      )
    })

    // Should show active and inactive users
    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.getByText('jane_smith')).toBeInTheDocument()
    expect(screen.queryByText('bob_wilson')).not.toBeInTheDocument()
  })

  it('should filter users by role', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Find role filter
    const roleFilter = screen.getByRole('combobox', { name: /role/i })
    await user.click(roleFilter)

    // Select ADMIN role
    const adminOption = screen.getByText('ADMIN')
    await user.click(adminOption)

    await waitFor(() => {
      expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: ['ADMIN']
        })
      )
    })

    // Should only show admin users
    expect(screen.queryByText('john_doe')).not.toBeInTheDocument()
    expect(screen.getByText('jane_smith')).toBeInTheDocument()
    expect(screen.queryByText('bob_wilson')).not.toBeInTheDocument()
  })

  it('should filter users by email verification status', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Find email verification filter
    const emailVerifiedFilter = screen.getByRole('checkbox', { name: /email verified/i })
    await user.click(emailVerifiedFilter)

    await waitFor(() => {
      expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          isEmailVerified: true
        })
      )
    })

    // Should only show email verified users
    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.getByText('jane_smith')).toBeInTheDocument()
    expect(screen.queryByText('bob_wilson')).not.toBeInTheDocument()
  })

  it('should filter users by phone verification status', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Find phone verification filter
    const phoneVerifiedFilter = screen.getByRole('checkbox', { name: /phone verified/i })
    await user.click(phoneVerifiedFilter)

    await waitFor(() => {
      expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          isPhoneVerified: true
        })
      )
    })

    // Should only show phone verified users
    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.queryByText('jane_smith')).not.toBeInTheDocument()
    expect(screen.getByText('bob_wilson')).toBeInTheDocument()
  })

  it('should combine multiple filters', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Apply search text
    const searchInput = screen.getByPlaceholderText(/search users/i)
    await user.type(searchInput, 'doe')

    // Apply status filter
    const statusFilter = screen.getByRole('combobox', { name: /status/i })
    await user.click(statusFilter)
    const activeOption = screen.getByText('Active')
    await user.click(activeOption)

    // Apply email verification filter
    const emailVerifiedFilter = screen.getByRole('checkbox', { name: /email verified/i })
    await user.click(emailVerifiedFilter)

    await waitFor(() => {
      expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'doe',
          status: ['ACTIVE'],
          isEmailVerified: true
        })
      )
    })

    // Should only show John Doe (matches all criteria)
    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.queryByText('jane_smith')).not.toBeInTheDocument()
    expect(screen.queryByText('bob_wilson')).not.toBeInTheDocument()
  })

  it('should clear all filters when clear button is clicked', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Apply filters
    const searchInput = screen.getByPlaceholderText(/search users/i)
    await user.type(searchInput, 'john')

    const statusFilter = screen.getByRole('combobox', { name: /status/i })
    await user.click(statusFilter)
    const activeOption = screen.getByText('Active')
    await user.click(activeOption)

    // Clear filters
    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    await user.click(clearButton)

    await waitFor(() => {
      expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          pageSize: 10
        })
      )
    })

    // Should show all users again
    expect(screen.getByText('john_doe')).toBeInTheDocument()
    expect(screen.getByText('jane_smith')).toBeInTheDocument()
    expect(screen.getByText('bob_wilson')).toBeInTheDocument()
  })

  it('should update pagination when filters are applied', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Apply filter that reduces results
    const searchInput = screen.getByPlaceholderText(/search users/i)
    await user.type(searchInput, 'john')

    await waitFor(() => {
      expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'john',
          page: 1
        })
      )
    })

    // Pagination should reset to page 1 when filters change
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument()
  })

  it('should show no results message when no users match filters', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Search for non-existent user
    const searchInput = screen.getByPlaceholderText(/search users/i)
    await user.type(searchInput, 'nonexistent')

    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument()
    })
  })

  it('should preserve filters when navigating between pages', async () => {
    // Mock response with multiple pages
    mockApiHandlers.searchUsers.mockImplementation((params) => ({
      data: {
        ...mockSearchResponse,
        totalPages: 2,
        currentPage: params.page || 1
      }
    }))

    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    // Apply search filter
    const searchInput = screen.getByPlaceholderText(/search users/i)
    await user.type(searchInput, 'test')

    // Navigate to page 2
    const nextPageButton = screen.getByRole('button', { name: /next page/i })
    await user.click(nextPageButton)

    await waitFor(() => {
      expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'test',
          page: 2
        })
      )
    })
  })

  it('should handle search debouncing correctly', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search users/i)
    
    // Type quickly
    await user.type(searchInput, 'j')
    await user.type(searchInput, 'o')
    await user.type(searchInput, 'h')
    await user.type(searchInput, 'n')

    // Should not call API immediately
    expect(mockApiHandlers.searchUsers).not.toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'j'
      })
    )

    // Should call API after debounce delay
    await waitFor(() => {
      expect(mockApiHandlers.searchUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'john'
        })
      )
    }, { timeout: 1000 })
  })
})