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

import { BulkActionsToolbar } from '../BulkActionsToolbar';
import { userApi } from '@/store/api/userApi';
import type { UserListResponseDto } from '@/types/user';
import { UserStatus } from '@/types/user';

// Mock hooks and components
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'userManagement.bulkActions.title': 'Bulk Actions',
        'userManagement.bulkActions.selected': '{count} users selected',
        'userManagement.bulkActions.activate': 'Activate Selected',
        'userManagement.bulkActions.deactivate': 'Deactivate Selected',
        'userManagement.bulkActions.suspend': 'Suspend Selected',
        'userManagement.bulkActions.delete': 'Delete Selected',
        'userManagement.bulkActions.assignRole': 'Assign Role',
        'userManagement.bulkActions.changeStatus': 'Change Status',
        'userManagement.bulkActions.clearSelection': 'Clear Selection',
        'userManagement.bulkActions.confirmDelete': 'Delete {count} users?',
        'userManagement.bulkActions.confirmDeleteMessage': 'This action cannot be undone. Are you sure you want to delete {count} selected users?',
        'userManagement.bulkActions.confirmStatusChange': 'Change status for {count} users?',
        'userManagement.bulkActions.confirmStatusChangeMessage': 'Are you sure you want to change the status of {count} selected users to {status}?',
        'userManagement.bulkActions.progressDeleting': 'Deleting {current} of {total} users...',
        'userManagement.bulkActions.progressUpdating': 'Updating {current} of {total} users...',
        'userManagement.bulkActions.successDeleted': 'Successfully deleted {count} users',
        'userManagement.bulkActions.successUpdated': 'Successfully updated {count} users',
        'userManagement.bulkActions.errorPartialFailure': '{failed} of {total} operations failed',
        'userManagement.bulkActions.errorAllFailed': 'All operations failed. Please try again.',
        'userManagement.status.active': 'Active',
        'userManagement.status.inactive': 'Inactive',
        'userManagement.status.suspended': 'Suspended',
        'userManagement.roles.admin': 'Admin',
        'userManagement.roles.user': 'User',
        'userManagement.roles.credit_manager': 'Credit Manager',
        'userManagement.roles.credit_analyst': 'Credit Analyst',
        'userManagement.roles.decision_maker': 'Decision Maker',
        'userManagement.roles.commission_member': 'Commission Member',
        'common.confirm': 'Confirm',
        'common.cancel': 'Cancel',
        'common.close': 'Close',
        'common.loading': 'Loading...',
        'common.selectStatus': 'Select Status',
        'common.selectRole': 'Select Role',
        'common.actions': 'Actions',
        'common.more': 'More',
        'common.retry': 'Retry',
        'common.error': 'Error',
        'common.success': 'Success',
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

const mockRoles = [
  { id: 'role-1', name: 'ADMIN', description: 'Administrator', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'role-2', name: 'USER', description: 'Regular User', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  { id: 'role-3', name: 'CREDIT_MANAGER', description: 'Credit Manager', permissions: [], createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
];

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

// Default props for testing
const defaultProps = {
  selectedUserIds: [],
  selectedUsers: [],
  onClearSelection: vi.fn(),
  onBulkOperation: vi.fn(),
  availableRoles: mockRoles,
  isLoading: false,
};

describe('BulkActionsToolbar', () => {
  let mockOnClearSelection: Mock;
  let mockOnBulkOperation: Mock;

  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' });
    vi.clearAllMocks();

    mockOnClearSelection = vi.fn();
    mockOnBulkOperation = vi.fn();

    // Setup successful API responses
    server.use(
      http.delete('/api/users/bulk', () => {
        return HttpResponse.json({ success: true, deletedCount: 2 }, { status: 200 });
      }),
      http.put('/api/users/bulk/status', () => {
        return HttpResponse.json({ success: true, updatedCount: 2 }, { status: 200 });
      }),
      http.put('/api/users/bulk/roles', () => {
        return HttpResponse.json({ success: true, updatedCount: 2 }, { status: 200 });
      })
    );
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('Visibility and Basic Rendering', () => {
    it('is hidden when no users are selected', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={[]}
            selectedUsers={[]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      expect(screen.queryByText('Bulk Actions')).not.toBeInTheDocument();
    });

    it('shows when users are selected', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
      expect(screen.getByText('2 users selected')).toBeInTheDocument();
    });

    it('displays correct selection count', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1']}
            selectedUsers={[mockUsers[0]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      expect(screen.getByText('1 users selected')).toBeInTheDocument();
    });

    it('shows all available bulk action buttons', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /activate selected/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /deactivate selected/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /suspend selected/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete selected/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /assign role/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear selection/i })).toBeInTheDocument();
    });
  });

  describe('Clear Selection', () => {
    it('calls onClearSelection when clear button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const clearButton = screen.getByRole('button', { name: /clear selection/i });
      await user.click(clearButton);

      expect(mockOnClearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('Status Change Operations', () => {
    it('opens confirmation dialog for activate operation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const activateButton = screen.getByRole('button', { name: /activate selected/i });
      await user.click(activateButton);

      await waitFor(() => {
        expect(screen.getByText('Change status for 2 users?')).toBeInTheDocument();
        expect(screen.getByText(/are you sure you want to change the status of 2 selected users to active/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });

    it('executes activate operation when confirmed', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const activateButton = screen.getByRole('button', { name: /activate selected/i });
      await user.click(activateButton);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnBulkOperation).toHaveBeenCalledWith(
          'status-change',
          { status: UserStatus.ACTIVE }
        );
      });
    });

    it('opens confirmation dialog for deactivate operation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const deactivateButton = screen.getByRole('button', { name: /deactivate selected/i });
      await user.click(deactivateButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure you want to change the status of 2 selected users to inactive/i)).toBeInTheDocument();
      });
    });

    it('opens confirmation dialog for suspend operation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const suspendButton = screen.getByRole('button', { name: /suspend selected/i });
      await user.click(suspendButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure you want to change the status of 2 selected users to suspended/i)).toBeInTheDocument();
      });
    });

    it('cancels status change operation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const activateButton = screen.getByRole('button', { name: /activate selected/i });
      await user.click(activateButton);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Change status for 2 users?')).not.toBeInTheDocument();
      });

      expect(mockOnBulkOperation).not.toHaveBeenCalled();
    });
  });

  describe('Delete Operation', () => {
    it('opens confirmation dialog for delete operation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const deleteButton = screen.getByRole('button', { name: /delete selected/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete 2 users?')).toBeInTheDocument();
        expect(screen.getByText(/this action cannot be undone.*are you sure you want to delete 2 selected users/i)).toBeInTheDocument();
      });
    });

    it('executes delete operation when confirmed', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const deleteButton = screen.getByRole('button', { name: /delete selected/i });
      await user.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnBulkOperation).toHaveBeenCalledWith('delete', {});
      });
    });

    it('shows dangerous styling for delete button', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const deleteButton = screen.getByRole('button', { name: /delete selected/i });
      expect(deleteButton).toHaveClass('bg-destructive', 'text-destructive-foreground');
    });
  });

  describe('Role Assignment', () => {
    it('opens role selection dropdown', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const assignRoleButton = screen.getByRole('button', { name: /assign role/i });
      await user.click(assignRoleButton);

      await waitFor(() => {
        expect(screen.getByText('Select Role')).toBeInTheDocument();
        expect(screen.getByText('Admin')).toBeInTheDocument();
        expect(screen.getByText('Regular User')).toBeInTheDocument();
        expect(screen.getByText('Credit Manager')).toBeInTheDocument();
      });
    });

    it('executes role assignment', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const assignRoleButton = screen.getByRole('button', { name: /assign role/i });
      await user.click(assignRoleButton);

      const adminRole = screen.getByText('Admin');
      await user.click(adminRole);

      await waitFor(() => {
        expect(mockOnBulkOperation).toHaveBeenCalledWith(
          'role-assignment',
          { roleId: 'role-1' }
        );
      });
    });
  });

  describe('Progress Indicators', () => {
    it('shows loading state during bulk operations', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
            isLoading={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      // All action buttons should be disabled during loading
      const actionButtons = screen.getAllByRole('button');
      actionButtons.forEach(button => {
        if (!button.textContent?.includes('Close')) { // Ignore dialog close buttons
          expect(button).toBeDisabled();
        }
      });
    });

    it('shows progress message during operations', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
            isLoading={true}
            progressMessage="Updating 1 of 2 users..."
          />
        </TestWrapper>
      );

      expect(screen.getByText('Updating 1 of 2 users...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when bulk operation fails', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
            error="All operations failed. Please try again."
          />
        </TestWrapper>
      );

      expect(screen.getByText('All operations failed. Please try again.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('shows partial failure message', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
            error="1 of 2 operations failed"
          />
        </TestWrapper>
      );

      expect(screen.getByText('1 of 2 operations failed')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels and roles', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      // Check toolbar has proper role
      expect(screen.getByRole('toolbar')).toBeInTheDocument();

      // Check buttons have proper labels
      expect(screen.getByRole('button', { name: /activate selected/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /delete selected/i })).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /clear selection/i })).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      // Tab through buttons
      await user.tab();
      expect(screen.getByRole('button', { name: /activate selected/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /deactivate selected/i })).toHaveFocus();

      // Test Enter key activation
      await user.keyboard('{Enter}');
      await waitFor(() => {
        expect(screen.getByText('Change status for 2 users?')).toBeInTheDocument();
      });
    });

    it('announces selection count to screen readers', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      const selectionStatus = screen.getByText('2 users selected');
      expect(selectionStatus).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Responsiveness', () => {
    it('adapts layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      // Should show collapsed view with "More" button on mobile
      expect(screen.getByRole('button', { name: /more/i })).toBeInTheDocument();
    });

    it('shows full button layout on desktop', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={[mockUsers[0], mockUsers[1]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      // All buttons should be visible on desktop
      expect(screen.getByRole('button', { name: /activate selected/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /deactivate selected/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /suspend selected/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete selected/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles single user selection correctly', () => {
      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1']}
            selectedUsers={[mockUsers[0]]}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      expect(screen.getByText('1 users selected')).toBeInTheDocument();
    });

    it('handles maximum selection limit', () => {
      const manyUsers = Array.from({ length: 100 }, (_, i) => ({
        ...mockUsers[0],
        id: `user-${i}`,
      }));

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={manyUsers.map(u => u.id)}
            selectedUsers={manyUsers}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      expect(screen.getByText('100 users selected')).toBeInTheDocument();
    });

    it('disables actions for invalid selections', () => {
      // Test with mixed user statuses where some operations might not be valid
      const mixedUsers = [
        { ...mockUsers[0], status: UserStatus.ACTIVE },
        { ...mockUsers[1], status: UserStatus.SUSPENDED },
      ];

      render(
        <TestWrapper>
          <BulkActionsToolbar
            {...defaultProps}
            selectedUserIds={['user-1', 'user-2']}
            selectedUsers={mixedUsers}
            onClearSelection={mockOnClearSelection}
            onBulkOperation={mockOnBulkOperation}
          />
        </TestWrapper>
      );

      // All actions should still be enabled - validation happens in the backend
      expect(screen.getByRole('button', { name: /activate selected/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /suspend selected/i })).not.toBeDisabled();
    });
  });
});