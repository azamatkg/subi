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
import { render, screen, waitFor } from '@testing-library/react';
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

// Mock hooks
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'userManagement.users': 'Users',
        'userManagement.searchPlaceholder': 'Search users...',
        'userManagement.messages.noResults': 'No users found',
        'userManagement.messages.noUsersYet': 'No users created yet',
        'userManagement.never': 'Never',
        'userManagement.roles.user': 'User',
        'userManagement.roles.admin': 'Admin',
        'common.showing': 'Showing',
        'common.of': 'of',
        'common.page': 'Page',
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
    hasAnyRole: () => true,
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
    roles: ['USER'],
    status: UserStatus.ACTIVE,
    enabled: true,
    isActive: true,
    department: 'IT',
    lastLoginAt: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const mockPaginatedResponse: UserListResponse = {
  content: mockUsers,
  page: 0,
  size: 20,
  totalElements: 1,
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

// MSW server
const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json(mockPaginatedResponse, { status: 200 });
  })
);

// Create test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      userApi: userApi.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            'persist/PERSIST',
            'userApi/executeQuery/pending',
            'userApi/executeQuery/fulfilled',
            'userApi/executeQuery/rejected',
          ],
        },
      }).concat(userApi.middleware),
  });
};

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = createTestStore();

  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );
};

describe('UserListPage - Basic Tests', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' });
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

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('renders the page without crashing', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    );

    // Should render the main title
    await waitFor(
      () => {
        expect(screen.getByText('Users')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('displays users when data is loaded', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    );

    // Wait for data to load and check if user is displayed
    await waitFor(
      () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('@jdoe')).toBeInTheDocument();
        expect(screen.getByText('jdoe@example.com')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

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

    await waitFor(
      () => {
        expect(screen.getByText('No users found')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('has search functionality', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    );

    // Find and interact with search input
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search users...');
      expect(searchInput).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search users...');
    await user.type(searchInput, 'john');

    expect(searchInput).toHaveValue('john');
  });

  it('displays pagination information', async () => {
    render(
      <TestWrapper>
        <UserListPage />
      </TestWrapper>
    );

    await waitFor(
      () => {
        expect(screen.getByText('Showing 1 of 1 users')).toBeInTheDocument();
        expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
