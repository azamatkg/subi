import React from 'react';
import {
  type Mock,
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';

import { DataTable } from '../DataTable';
import { userApi } from '@/store/api/userApi';
import type { UserListResponse, UserListResponseDto } from '@/types/user';
import { UserStatus } from '@/types/user';

// Mock hooks and components
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'common.loading': 'Loading...',
        'common.noResults': 'No results found',
        'common.actions': 'Actions for {item}',
        'common.view': 'View',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.selectAll': 'Select all',
        'common.deselectAll': 'Deselect all',
        'common.page': 'Page',
        'common.of': 'of',
        'common.rowsPerPage': 'Rows per page',
        'common.first': 'First',
        'common.previous': 'Previous',
        'common.next': 'Next',
        'common.last': 'Last',
        'common.showing': 'Showing',
        'common.sortBy': 'Sort by {field}',
        'common.filterBy': 'Filter by {field}',
        'userManagement.fields.name': 'Name',
        'userManagement.fields.username': 'Username',
        'userManagement.fields.email': 'Email',
        'userManagement.fields.roles': 'Roles',
        'userManagement.fields.status': 'Status',
        'userManagement.fields.lastLogin': 'Last Login',
        'userManagement.fields.department': 'Department',
        'userManagement.never': 'Never',
        'userManagement.status.active': 'Active',
        'userManagement.status.inactive': 'Inactive',
        'userManagement.status.suspended': 'Suspended',
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

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    hasAnyRole: (roles: string[]) => roles.includes('ADMIN'),
  }),
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

// Column definitions for the DataTable
const mockColumns = [
  {
    id: 'fullName',
    key: 'fullName',
    label: 'Name',
    sortable: true,
    filterable: true,
    render: (user: UserListResponseDto) => user.fullName,
  },
  {
    id: 'username',
    key: 'username',
    label: 'Username',
    sortable: true,
    filterable: true,
    render: (user: UserListResponseDto) => `@${user.username}`,
  },
  {
    id: 'email',
    key: 'email',
    label: 'Email',
    sortable: true,
    filterable: true,
    render: (user: UserListResponseDto) => user.email,
  },
  {
    id: 'roles',
    key: 'roles',
    label: 'Roles',
    sortable: false,
    filterable: true,
    render: (user: UserListResponseDto) => user.roles.join(', '),
  },
  {
    id: 'status',
    key: 'status',
    label: 'Status',
    sortable: true,
    filterable: true,
    render: (user: UserListResponseDto) => user.status,
  },
];

// Mock props for DataTable
const mockDataTableProps = {
  data: mockUsers,
  columns: mockColumns,
  loading: false,
  pagination: {
    page: 0,
    size: 20,
    totalElements: 3,
    totalPages: 1,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  },
  sorting: {
    field: 'lastName',
    direction: 'asc' as const,
    onSortChange: vi.fn(),
  },
  selection: {
    selectedIds: [],
    onSelectionChange: vi.fn(),
    bulkActions: [
      { id: 'delete', label: 'Delete', action: vi.fn() },
      { id: 'activate', label: 'Activate', action: vi.fn() },
    ],
  },
  onRowClick: vi.fn(),
  onRowAction: vi.fn(),
};

// MSW server setup
const server = setupServer();

// Create test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      userApi: userApi.reducer,
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

describe('DataTable', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' });
    vi.clearAllMocks();

    // Mock window.innerWidth for responsive behavior
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Mock addEventListener/removeEventListener
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('Basic Rendering', () => {
    it('renders table with data correctly', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      // Check table structure
      expect(screen.getByRole('table')).toBeInTheDocument();
      
      // Check column headers
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Roles')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();

      // Check data rows
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('@jdoe')).toBeInTheDocument();
      expect(screen.getByText('jdoe@example.com')).toBeInTheDocument();
    });

    it('displays loading skeleton when loading is true', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} loading={true} />
        </TestWrapper>
      );

      // Should show loading skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('displays empty state when no data provided', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} data={[]} />
        </TestWrapper>
      );

      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('displays sort indicators for sortable columns', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      // Sortable columns should have sort buttons
      const nameHeader = screen.getByText('Name').closest('th');
      const usernameHeader = screen.getByText('Username').closest('th');
      
      expect(nameHeader?.querySelector('button')).toBeInTheDocument();
      expect(usernameHeader?.querySelector('button')).toBeInTheDocument();
      
      // Non-sortable column should not have sort button
      const rolesHeader = screen.getByText('Roles').closest('th');
      expect(rolesHeader?.querySelector('button')).not.toBeInTheDocument();
    });

    it('calls onSortChange when clicking sortable column header', async () => {
      const user = userEvent.setup();
      const mockOnSortChange = vi.fn();

      render(
        <TestWrapper>
          <DataTable 
            {...mockDataTableProps} 
            sorting={{
              ...mockDataTableProps.sorting,
              onSortChange: mockOnSortChange,
            }}
          />
        </TestWrapper>
      );

      const nameHeader = screen.getByText('Name').closest('th');
      const sortButton = nameHeader?.querySelector('button');
      
      expect(sortButton).toBeInTheDocument();
      await user.click(sortButton!);

      expect(mockOnSortChange).toHaveBeenCalledWith('fullName', 'desc');
    });

    it('shows current sort direction indicator', async () => {
      render(
        <TestWrapper>
          <DataTable 
            {...mockDataTableProps}
            sorting={{
              field: 'fullName',
              direction: 'desc',
              onSortChange: vi.fn(),
            }}
          />
        </TestWrapper>
      );

      // Should show descending indicator on Name column
      const nameHeader = screen.getByText('Name').closest('th');
      expect(nameHeader).toHaveClass('bg-muted/50'); // Indicates active sort
    });
  });

  describe('Selection Functionality', () => {
    it('renders select all checkbox in header', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      const selectAllCheckbox = screen.getByLabelText('Select all');
      expect(selectAllCheckbox).toBeInTheDocument();
      expect(selectAllCheckbox).toHaveAttribute('type', 'checkbox');
    });

    it('renders selection checkboxes for each row', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      const checkboxes = screen.getAllByRole('checkbox');
      // Should have 1 header checkbox + 3 row checkboxes
      expect(checkboxes).toHaveLength(4);
    });

    it('calls onSelectionChange when selecting individual rows', async () => {
      const user = userEvent.setup();
      const mockOnSelectionChange = vi.fn();

      render(
        <TestWrapper>
          <DataTable 
            {...mockDataTableProps}
            selection={{
              ...mockDataTableProps.selection,
              onSelectionChange: mockOnSelectionChange,
            }}
          />
        </TestWrapper>
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const firstRowCheckbox = checkboxes[1]; // First row (skip header)
      
      await user.click(firstRowCheckbox);

      expect(mockOnSelectionChange).toHaveBeenCalledWith(['user-1']);
    });

    it('calls onSelectionChange when clicking select all', async () => {
      const user = userEvent.setup();
      const mockOnSelectionChange = vi.fn();

      render(
        <TestWrapper>
          <DataTable 
            {...mockDataTableProps}
            selection={{
              ...mockDataTableProps.selection,
              onSelectionChange: mockOnSelectionChange,
            }}
          />
        </TestWrapper>
      );

      const selectAllCheckbox = screen.getByLabelText('Select all');
      await user.click(selectAllCheckbox);

      expect(mockOnSelectionChange).toHaveBeenCalledWith(['user-1', 'user-2', 'user-3']);
    });

    it('displays bulk action toolbar when items are selected', async () => {
      render(
        <TestWrapper>
          <DataTable 
            {...mockDataTableProps}
            selection={{
              ...mockDataTableProps.selection,
              selectedIds: ['user-1', 'user-2'],
            }}
          />
        </TestWrapper>
      );

      expect(screen.getByText('2 items selected')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Activate')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('displays pagination information correctly', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Showing 3 of 3')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    });

    it('displays page size selector', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Rows per page')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('calls onPageChange when navigation buttons are clicked', async () => {
      const user = userEvent.setup();
      const mockOnPageChange = vi.fn();

      render(
        <TestWrapper>
          <DataTable 
            {...mockDataTableProps}
            pagination={{
              ...mockDataTableProps.pagination,
              page: 1,
              totalPages: 3,
              onPageChange: mockOnPageChange,
            }}
          />
        </TestWrapper>
      );

      const nextButton = screen.getByLabelText('Next');
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageSizeChange when page size is changed', async () => {
      const user = userEvent.setup();
      const mockOnPageSizeChange = vi.fn();

      render(
        <TestWrapper>
          <DataTable 
            {...mockDataTableProps}
            pagination={{
              ...mockDataTableProps.pagination,
              onPageSizeChange: mockOnPageSizeChange,
            }}
          />
        </TestWrapper>
      );

      const pageSizeSelect = screen.getByRole('combobox');
      await user.click(pageSizeSelect);
      
      const option50 = screen.getByText('50');
      await user.click(option50);

      expect(mockOnPageSizeChange).toHaveBeenCalledWith(50);
    });
  });

  describe('Row Actions', () => {
    it('displays action menu for each row', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      const actionButtons = screen.getAllByLabelText(/actions for/i);
      expect(actionButtons).toHaveLength(3); // One for each user
    });

    it('calls onRowAction when action is selected', async () => {
      const user = userEvent.setup();
      const mockOnRowAction = vi.fn();

      render(
        <TestWrapper>
          <DataTable 
            {...mockDataTableProps}
            onRowAction={mockOnRowAction}
          />
        </TestWrapper>
      );

      const firstActionButton = screen.getAllByLabelText(/actions for/i)[0];
      await user.click(firstActionButton);

      const viewAction = screen.getByText('View');
      await user.click(viewAction);

      expect(mockOnRowAction).toHaveBeenCalledWith('view', mockUsers[0]);
    });

    it('calls onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const mockOnRowClick = vi.fn();

      render(
        <TestWrapper>
          <DataTable 
            {...mockDataTableProps}
            onRowClick={mockOnRowClick}
          />
        </TestWrapper>
      );

      const firstRow = screen.getByText('John Doe').closest('tr');
      await user.click(firstRow!);

      expect(mockOnRowClick).toHaveBeenCalledWith(mockUsers[0]);
    });
  });

  describe('Responsive Behavior', () => {
    it('adapts to mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });

      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      // Should still render table but with different styling
      expect(screen.getByRole('table')).toBeInTheDocument();
      
      // Mobile-specific behavior can be tested here
      const table = screen.getByRole('table');
      expect(table.closest('div')).toHaveClass('overflow-auto');
    });

    it('handles horizontal scrolling on small screens', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      const tableContainer = screen.getByRole('table').closest('div');
      expect(tableContainer).toHaveClass('overflow-auto');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      // Table should have proper role
      expect(screen.getByRole('table')).toBeInTheDocument();
      
      // Column headers should have proper role
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders.length).toBeGreaterThan(0);
      
      // Rows should have proper role
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(4); // Header + 3 data rows
      
      // Checkboxes should have proper labels
      expect(screen.getByLabelText('Select all')).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      // Tab through interactive elements
      await user.tab();
      
      // First focusable element should be select all checkbox
      expect(screen.getByLabelText('Select all')).toHaveFocus();
      
      await user.tab();
      
      // Should focus on first sortable column header
      const nameHeaderButton = screen.getByText('Name').closest('button');
      expect(nameHeaderButton).toHaveFocus();
    });

    it('provides screen reader friendly content', async () => {
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} />
        </TestWrapper>
      );

      // Should have accessible table caption or description
      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label');
      
      // Sort buttons should have accessible descriptions
      const sortButtons = screen.getAllByRole('button', { name: /sort by/i });
      expect(sortButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('handles invalid data gracefully', async () => {
      const invalidData = [
        { id: 'invalid', fullName: null, email: undefined },
      ] as any;

      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} data={invalidData} />
        </TestWrapper>
      );

      // Should not crash and should render table structure
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('handles missing required props gracefully', async () => {
      const minimalProps = {
        data: mockUsers,
        columns: mockColumns,
      };

      render(
        <TestWrapper>
          <DataTable {...minimalProps} />
        </TestWrapper>
      );

      // Should render basic table without crashing
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, index) => ({
        id: `user-${index}`,
        username: `user${index}`,
        email: `user${index}@example.com`,
        firstName: `First${index}`,
        lastName: `Last${index}`,
        fullName: `First${index} Last${index}`,
        roles: ['USER'],
        status: UserStatus.ACTIVE,
        enabled: true,
        isActive: true,
        department: 'IT',
        lastLoginAt: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-01T00:00:00Z',
      }));

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <DataTable {...mockDataTableProps} data={largeDataset} />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1 second)
      expect(renderTime).toBeLessThan(1000);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});