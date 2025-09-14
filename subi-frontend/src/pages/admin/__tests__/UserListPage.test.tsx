import React from 'react';
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

import { UserListPage } from '../UserListPage';
import { userApi } from '@/store/api/userApi';
import type { UserListResponse, UserListResponseDto } from '@/types/user';
import { UserStatus } from '@/types/user';

// Mock hooks and components
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
        'userManagement.fields.activeStatus': 'Active Status',
        'userManagement.messages.noResults': 'No users found',
        'userManagement.messages.noUsersYet': 'No users created yet',
        'userManagement.messages.confirmDelete':
          'Are you sure you want to delete {item}?',
        'userManagement.never': 'Never',
        'userManagement.active': 'Active',
        'userManagement.inactive': 'Inactive',
        'userManagement.enterDepartment': 'Enter department',
        'userManagement.roles.admin': 'Admin',
        'userManagement.roles.user': 'User',
        'userManagement.roles.credit_manager': 'Credit Manager',
        'userManagement.status.active': 'Active',
        'userManagement.status.inactive': 'Inactive',
        'userManagement.status.suspended': 'Suspended',
        'common.actions': 'Actions for {item}',
        'common.view': 'View',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
        'common.deleting': 'Deleting...',
        'common.clear': 'Clear',
        'common.clearFilters': 'Clear Filters',
        'common.refresh': 'Refresh',
        'common.all': 'All',
        'common.selectStatus': 'Select Status',
        'common.showing': 'Showing',
        'common.of': 'of',
        'common.page': 'Page',
        'common.rowsPerPage': 'Rows per page',
        'common.first': 'First',
        'common.previous': 'Previous',
        'common.next': 'Next',
        'common.last': 'Last',
        'common.cardView': 'Card View',
        'common.tableView': 'Table View',
        'common.sortBy': 'Sort by {field}',
        'common.tryAdjustingFilters': 'Try adjusting your filters',
        'common.none': 'None',
        'common.created': 'Created',
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
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

// Test data
const mockUsers: UserListResponseDto[] = [
  {
    id: 'user-1',
    username: 'jdoe',
    email: 'jdoe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    roles: [{ id: 'role-2', name: 'USER', description: 'Regular User', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }],
    status: UserStatus.ACTIVE,
    enabled: true,
    isActive: true,
    department: 'IT',
    lastLoginAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    username: 'asmith',
    email: 'asmith@example.com',
    firstName: 'Alice',
    lastName: 'Smith',
    fullName: 'Alice Smith',
    roles: [{ id: 'role-1', name: 'ADMIN', description: 'Administrator', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }, { id: 'role-3', name: 'CREDIT_MANAGER', description: 'Credit Manager', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }],
    status: UserStatus.ACTIVE,
    enabled: true,
    isActive: true,
    department: 'Finance',
    lastLoginAt: '2024-01-16T14:20:00Z',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 'user-3',
    username: 'bjohnson',
    email: 'bjohnson@example.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    fullName: 'Bob Johnson',
    roles: [{ id: 'role-2', name: 'USER', description: 'Regular User', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' }],
    status: UserStatus.SUSPENDED,
    enabled: false,
    isActive: false,
    department: 'Operations',
    lastLoginAt: undefined,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

const mockPaginatedResponse: UserListResponse = {
  content: mockUsers,
  page: 0,
  size: 20,
  totalElements: 3,
  totalPages: 1,
  first: true,
  last: true,
  empty: false,
};

const mockEmptyResponse: UserListResponse = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  empty: true,
};

// MSW server setup
const server = setupServer();

// Create test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      [userApi.reducerPath]: userApi.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
          ignoredPaths: ['register'],
        },
      }).concat(userApi.middleware),
  });
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = createTestStore();

  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
};

describe('UserListPage', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' });
    vi.clearAllMocks();

    // Setup default successful response
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json(mockPaginatedResponse, { status: 200 });
      })
    );

    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Mock addEventListener/removeEventListener
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();

    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: vi.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('Loading States', () => {
    it('displays loading skeleton when users are being fetched', async () => {
      // Setup delayed response to catch loading state
      server.use(
        http.get('/api/users', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json(mockPaginatedResponse, { status: 200 });
        })
      );

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      // The component shows PageSkeleton when loading
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('displays error fallback when API request fails', async () => {
      server.use(
        http.get('/api/users', () => {
          return HttpResponse.json(
            { message: 'Network error' },
            { status: 500 }
          );
        })
      );

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

  describe('Empty States', () => {
    it('displays empty state when no users exist', async () => {
      server.use(
        http.get('/api/users', () => {
          return HttpResponse.json(mockEmptyResponse, { status: 200 });
        })
      );

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

    it('displays filtered empty state when filters applied but no results', async () => {
      const user = userEvent.setup();

      server.use(
        http.get('/api/users', () => {
          return HttpResponse.json(mockEmptyResponse, { status: 200 });
        }),
        http.get('/api/users/search', () => {
          return HttpResponse.json(mockEmptyResponse, { status: 200 });
        })
      );

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      // Apply a search filter
      const searchInput = screen.getByPlaceholderText('Search users...');
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeInTheDocument();
        expect(
          screen.getByText('Try adjusting your filters')
        ).toBeInTheDocument();
        expect(screen.getByText('Clear Filters')).toBeInTheDocument();
      });
    });
  });

  describe('User List Display', () => {
    it('renders user list with correct data in card view', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check that users are displayed
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Alice Smith')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();

        // Check usernames
        expect(screen.getByText('@jdoe')).toBeInTheDocument();
        expect(screen.getByText('@asmith')).toBeInTheDocument();
        expect(screen.getByText('@bjohnson')).toBeInTheDocument();

        // Check emails
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
        expect(screen.getByText('User')).toBeInTheDocument(); // John Doe role
        expect(screen.getByText('Admin +1')).toBeInTheDocument(); // Alice Smith roles (Admin + 1 more)
      });
    });

    it('displays user status badges correctly', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const statusBadges = screen.getAllByText(/active|suspended/i);
        expect(statusBadges.length).toBeGreaterThan(0);
      });
    });

    it('displays departments for users who have them', async () => {
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

    it('displays last login information correctly', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show formatted dates for users with last login
        expect(screen.getAllByText(/1\/15\/2024|1\/16\/2024/)).toHaveLength(2);

        // Should show "Never" for users without last login
        expect(screen.getByText('Never')).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filtering', () => {
    it('updates search input and triggers filtering', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search users...');
      await user.type(searchInput, 'john');

      await waitFor(() => {
        expect(searchInput).toHaveValue('john');
      });
    });

    it('opens and closes advanced filters', async () => {
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
        expect(screen.getByText('Active Status')).toBeInTheDocument();
        expect(screen.getByText('Department')).toBeInTheDocument();
      });

      // Close filters
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
      });
    });

    it('applies status filter', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      // Open advanced filters
      await user.click(screen.getByText('Advanced Filters'));

      // Select status filter
      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      await user.click(statusSelect);

      await waitFor(() => {
        const activeOption = screen.getByText('Active');
        user.click(activeOption);
      });
    });

    it('applies department filter', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      // Open advanced filters
      await user.click(screen.getByText('Advanced Filters'));

      // Enter department filter
      const departmentInput = screen.getByPlaceholderText('Enter department');
      await user.type(departmentInput, 'IT');

      await waitFor(() => {
        expect(departmentInput).toHaveValue('IT');
      });
    });

    it('clears all filters', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      // Apply a search filter first
      const searchInput = screen.getByPlaceholderText('Search users...');
      await user.type(searchInput, 'test search');

      // Open advanced filters and apply department filter
      await user.click(screen.getByText('Advanced Filters'));
      const departmentInput = screen.getByPlaceholderText('Enter department');
      await user.type(departmentInput, 'IT');

      await waitFor(() => {
        // Should show filter count badge
        expect(screen.getByText('2')).toBeInTheDocument(); // Filter count badge
      });

      // Clear filters
      const clearButton = screen.getByLabelText(/clear filters/i);
      await user.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
        expect(departmentInput).toHaveValue('');
      });
    });
  });

  describe('View Mode Switching', () => {
    it('switches between card and table view on desktop', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const cardViewButton = screen.getByLabelText('Card View');
        const tableViewButton = screen.getByLabelText('Table View');

        expect(cardViewButton).toBeInTheDocument();
        expect(tableViewButton).toBeInTheDocument();
      });

      // Switch to table view
      const tableViewButton = screen.getByLabelText('Table View');
      await user.click(tableViewButton);

      await waitFor(() => {
        // Should see table headers
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    it('provides sorting options in card view', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should show sort dropdown in card view
        const sortButton = screen.getByRole('button', { name: /lastName/i });
        expect(sortButton).toBeInTheDocument();
      });

      // Click sort button to open dropdown
      const sortButton = screen.getByRole('button', { name: /lastName/i });
      await user.click(sortButton);

      await waitFor(() => {
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('displays pagination controls with correct information', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 users')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
        expect(screen.getByText('Rows per page')).toBeInTheDocument();
      });
    });

    it('handles page size changes', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const pageSizeSelect = screen.getByRole('combobox', {
          name: /rows per page/i,
        });
        expect(pageSizeSelect).toBeInTheDocument();
      });
    });
  });

  describe('Actions Menu', () => {
    it('displays action menu for each user', async () => {
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

    it('shows appropriate actions for admin users', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        const firstActionButton = screen.getAllByLabelText(/actions for/i)[0];
        user.click(firstActionButton);
      });

      await waitFor(() => {
        expect(screen.getByText('View')).toBeInTheDocument();
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });
    });

    it('opens delete confirmation dialog', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      // Click first action button
      const firstActionButton = screen.getAllByLabelText(/actions for/i)[0];
      await user.click(firstActionButton);

      // Click delete option
      const deleteButton = screen.getByText('Delete');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Confirm')).toBeInTheDocument();
        expect(
          screen.getByText(/are you sure you want to delete/i)
        ).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('handles mobile view correctly', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // View toggle buttons should not be visible on mobile
        expect(screen.queryByLabelText('Table View')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Card View')).not.toBeInTheDocument();
      });
    });
  });

  describe('Admin Role Permissions', () => {
    it('shows create user button for admin users', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create user/i })
        ).toBeInTheDocument();
      });
    });

    it('shows edit and delete actions for admin users', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      const firstActionButton = screen.getAllByLabelText(/actions for/i)[0];
      await user.click(firstActionButton);

      await waitFor(() => {
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check search input has proper label
        expect(screen.getByLabelText('Search users...')).toBeInTheDocument();

        // Check filter button has proper ARIA
        const filterButton = screen.getByText('Advanced Filters');
        expect(filterButton).toHaveAttribute('aria-expanded');

        // Check action buttons have proper labels
        const actionButtons = screen.getAllByLabelText(/actions for/i);
        expect(actionButtons.length).toBeGreaterThan(0);

        // Check user cards have proper article role
        const userCards = screen.getAllByRole('article');
        expect(userCards.length).toBe(3);
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserListPage />
        </TestWrapper>
      );

      // Tab through elements
      await user.tab();

      // Should focus on search input first
      expect(screen.getByPlaceholderText('Search users...')).toHaveFocus();

      await user.tab();

      // Should focus on filter button next
      expect(screen.getByText('Advanced Filters')).toHaveFocus();
    });
  });
});
