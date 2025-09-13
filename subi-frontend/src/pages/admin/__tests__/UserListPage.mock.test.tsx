import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import { UserListPage } from '../UserListPage';
import type { UserListResponseDto } from '@/types/user';
import { UserStatus } from '@/types/user';

// Test data
const mockUsers: UserListResponseDto[] = [
  {
    id: 'user-1',
    username: 'jdoe',
    email: 'jdoe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    roles: ['USER'],
    status: UserStatus.ACTIVE,
    enabled: true,
    isActive: true,
    department: 'IT',
    lastLoginAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    username: 'asmith',
    email: 'asmith@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    fullName: 'Alice Smith',
    roles: ['ADMIN', 'CREDIT_MANAGER'],
    status: UserStatus.ACTIVE,
    enabled: true,
    isActive: true,
    department: 'Finance',
    lastLoginAt: '2024-01-16T14:20:00Z',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'user-3',
    username: 'bjohnson',
    email: 'bjohnson@example.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    fullName: 'Bob Johnson',
    roles: ['USER'],
    status: UserStatus.SUSPENDED,
    enabled: false,
    isActive: false,
    department: 'Operations',
    lastLoginAt: null,
    createdAt: '2024-01-03T00:00:00Z',
  },
];

const mockPaginatedResponse = {
  content: mockUsers,
  page: 0,
  size: 20,
  totalElements: 3,
  totalPages: 1,
  first: true,
  last: true,
  empty: false,
};

const mockEmptyResponse = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  empty: true,
};

// Mock all hooks and components
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'userManagement.users': 'Users',
        'userManagement.searchPlaceholder': 'Search users...',
        'userManagement.advancedFilters': 'Advanced Filters',
        'userManagement.createUser': 'Create User',
        'userManagement.fields.name': 'Name',
        'userManagement.fields.username': 'Username',
        'userManagement.fields.email': 'Email',
        'userManagement.fields.roles': 'Roles',
        'userManagement.fields.status': 'Status',
        'userManagement.fields.lastLogin': 'Last Login',
        'userManagement.fields.department': 'Department',
        'userManagement.messages.noResults': 'No users found',
        'userManagement.messages.noUsersYet': 'No users created yet',
        'userManagement.never': 'Never',
        'userManagement.roles.admin': 'Admin',
        'userManagement.roles.user': 'User',
        'userManagement.roles.credit_manager': 'Credit Manager',
        'common.actions': 'Actions for {item}',
        'common.view': 'View',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.showing': 'Showing',
        'common.of': 'of',
        'common.page': 'Page',
        'common.rowsPerPage': 'Rows per page',
        'common.none': 'None',
      };

      let result = translations[key] || key;
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(`{${paramKey}}`, String(paramValue));
        });
      }
      return result;
    },
  }),
}));

vi.mock('@/hooks/useSetPageTitle', () => ({
  useSetPageTitle: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    hasAnyRole: (roles: string[]) => roles.includes('ADMIN'),
  }),
}));

vi.mock('@/utils/auth', () => ({
  getStoredViewMode: vi.fn(() => 'card'),
  setStoredViewMode: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock API hooks with different scenarios
const mockApiHooks = {
  success: () => ({
    useGetUsersQuery: vi.fn(() => ({
      data: mockPaginatedResponse,
      isLoading: false,
      error: undefined,
    })),
    useSearchAndFilterUsersQuery: vi.fn(() => ({
      data: mockPaginatedResponse,
      isLoading: false,
      error: undefined,
    })),
    useDeleteUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  }),
  loading: () => ({
    useGetUsersQuery: vi.fn(() => ({
      data: undefined,
      isLoading: true,
      error: undefined,
    })),
    useSearchAndFilterUsersQuery: vi.fn(() => ({
      data: undefined,
      isLoading: true,
      error: undefined,
    })),
    useDeleteUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  }),
  empty: () => ({
    useGetUsersQuery: vi.fn(() => ({
      data: mockEmptyResponse,
      isLoading: false,
      error: undefined,
    })),
    useSearchAndFilterUsersQuery: vi.fn(() => ({
      data: mockEmptyResponse,
      isLoading: false,
      error: undefined,
    })),
    useDeleteUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  }),
  error: () => ({
    useGetUsersQuery: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: { message: 'Server error' } },
    })),
    useSearchAndFilterUsersQuery: vi.fn(() => ({
      data: undefined,
      isLoading: false,
      error: { status: 500, data: { message: 'Server error' } },
    })),
    useDeleteUserMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  }),
};

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

describe('UserListPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window properties
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();

    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true,
    });
  });

  describe('Successful Data Loading', () => {
    beforeEach(() => {
      vi.doMock('@/store/api/userApi', () => mockApiHooks.success());
    });

    it('renders user list with correct data in card view', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      });
    });

    it('displays usernames and emails correctly', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('@jdoe')).toBeInTheDocument();
        expect(screen.getByText('@asmith')).toBeInTheDocument();
        expect(screen.getByText('@bjohnson')).toBeInTheDocument();

        expect(screen.getByText('jdoe@example.com')).toBeInTheDocument();
        expect(screen.getByText('asmith@example.com')).toBeInTheDocument();
        expect(screen.getByText('bjohnson@example.com')).toBeInTheDocument();
      });
    });

    it('displays user roles correctly', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('User')).toBeInTheDocument(); // John and Bob's role
        expect(screen.getByText('Admin +1')).toBeInTheDocument(); // Alice's roles
      });
    });

    it('displays departments', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('IT')).toBeInTheDocument();
        expect(screen.getByText('Finance')).toBeInTheDocument();
        expect(screen.getByText('Operations')).toBeInTheDocument();
      });
    });

    it('displays last login information', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show "Never" for users without last login
        expect(screen.getByText('Never')).toBeInTheDocument();

        // Should show formatted dates for users with last login
        expect(screen.getAllByText(/1\/15\/2024|1\/16\/2024/)).toHaveLength(2);
      });
    });

    it('displays pagination information', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 users')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    beforeEach(() => {
      vi.doMock('@/store/api/userApi', () => mockApiHooks.loading());
    });

    it('displays loading skeleton when fetching data', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      // Should show loading skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    beforeEach(() => {
      vi.doMock('@/store/api/userApi', () => mockApiHooks.empty());
    });

    it('displays empty state when no users exist', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument();
        expect(screen.getByText('No users created yet')).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    beforeEach(() => {
      vi.doMock('@/store/api/userApi', () => mockApiHooks.error());
    });

    it('displays error fallback when API fails', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interface Elements', () => {
    beforeEach(() => {
      vi.doMock('@/store/api/userApi', () => mockApiHooks.success());
    });

    it('renders search input', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Search users...')
        ).toBeInTheDocument();
      });
    });

    it('renders advanced filters button', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
      });
    });

    it('renders create user button for admin users', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
        // The create button should be present since hasAnyRole(['ADMIN']) returns true
      });
    });

    it('renders action menus for each user', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const actionButtons = screen.getAllByLabelText(/actions for/i);
        expect(actionButtons).toHaveLength(3); // One for each user
      });
    });
  });

  describe('Interactive Elements', () => {
    beforeEach(() => {
      vi.doMock('@/store/api/userApi', () => mockApiHooks.success());
    });

    it('allows typing in search input', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search users...');
        expect(searchInput).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search users...');
      await user.type(searchInput, 'john');

      expect(searchInput).toHaveValue('john');
    });

    it('opens advanced filters when clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      const filterButton = screen.getByText('Advanced Filters');
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Department')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      vi.doMock('@/store/api/userApi', () => mockApiHooks.success());
    });

    it('has proper ARIA labels', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Search users...')).toBeInTheDocument();
        expect(screen.getAllByLabelText(/actions for/i)).toHaveLength(3);
      });
    });

    it('has proper article roles for user cards', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const userCards = screen.getAllByRole('article');
        expect(userCards).toHaveLength(3);
      });
    });
  });
});
