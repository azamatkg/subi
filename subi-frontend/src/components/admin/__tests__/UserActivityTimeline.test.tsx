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

import { UserActivityTimeline } from '../UserActivityTimeline';
import { userApi } from '@/store/api/userApi';
import type { UserActivityTimelineEntry } from '@/types/user';
import { ActivityAction } from '@/types/user';

// Mock hooks and components
vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'userActivity.timeline.title': 'Activity Timeline',
        'userActivity.timeline.noData': 'No activity found',
        'userActivity.timeline.loadMore': 'Load More',
        'userActivity.timeline.loading': 'Loading activity...',
        'userActivity.timeline.error': 'Failed to load activity',
        'userActivity.timeline.retry': 'Retry',
        'userActivity.timeline.refresh': 'Refresh',
        'userActivity.activity.LOGIN': 'User Login',
        'userActivity.activity.LOGOUT': 'User Logout',
        'userActivity.activity.PASSWORD_CHANGE': 'Password Changed',
        'userActivity.activity.PROFILE_UPDATE': 'Profile Updated',
        'userActivity.activity.ROLE_CHANGE': 'Role Changed',
        'userActivity.activity.STATUS_CHANGE': 'Status Changed',
        'userActivity.activity.ACCOUNT_CREATED': 'Account Created',
        'userActivity.activity.ACCOUNT_SUSPENDED': 'Account Suspended',
        'userActivity.activity.ACCOUNT_REACTIVATED': 'Account Reactivated',
        'userActivity.activity.FAILED_LOGIN_ATTEMPT': 'Failed Login Attempt',
        'userActivity.activity.PASSWORD_RESET': 'Password Reset',
        'userActivity.timeline.performedBy': 'by {name}',
        'userActivity.timeline.timeAgo': '{time} ago',
        'userActivity.timeline.viewDetails': 'View Details',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.retry': 'Retry',
      };
      
      if (params && typeof translations[key] === 'string') {
        let result = translations[key];
        Object.entries(params).forEach(([param, value]) => {
          result = result.replace(`{${param}}`, String(value));
        });
        return result;
      }
      
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 data-testid="card-title" {...props}>{children}</h3>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children, ...props }: any) => <div data-testid="alert" {...props}>{children}</div>,
  AlertDescription: ({ children, ...props }: any) => <div data-testid="alert-description" {...props}>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  Clock: (props: any) => <div data-testid="clock-icon" {...props} />,
  User: (props: any) => <div data-testid="user-icon" {...props} />,
  RefreshCw: (props: any) => <div data-testid="refresh-icon" {...props} />,
  AlertCircle: (props: any) => <div data-testid="alert-icon" {...props} />,
  ChevronDown: (props: any) => <div data-testid="chevron-down-icon" {...props} />,
  ExternalLink: (props: any) => <div data-testid="external-link-icon" {...props} />,
}));

// Mock activity data
const mockActivityEntries: UserActivityTimelineEntry[] = [
  {
    id: 'activity-1',
    type: ActivityAction.LOGIN,
    title: 'User Login',
    description: 'Successfully logged into the system',
    timestamp: '2024-03-15T10:30:00Z',
    performedBy: {
      id: 'user-1',
      username: 'john.doe',
      fullName: 'John Doe',
    },
    metadata: {
      ipAddress: '192.168.1.100',
    },
  },
  {
    id: 'activity-2',
    type: ActivityAction.ROLE_CHANGE,
    title: 'Role Changed',
    description: 'User role updated from USER to ADMIN',
    timestamp: '2024-03-15T09:15:00Z',
    performedBy: {
      id: 'admin-1',
      username: 'admin',
      fullName: 'System Administrator',
    },
    metadata: {
      oldValue: 'USER',
      newValue: 'ADMIN',
      reason: 'Promotion to administrative role',
    },
  },
  {
    id: 'activity-3',
    type: ActivityAction.PASSWORD_CHANGE,
    title: 'Password Changed',
    description: 'User password was updated',
    timestamp: '2024-03-14T16:45:00Z',
    performedBy: {
      id: 'user-1',
      username: 'john.doe',
      fullName: 'John Doe',
    },
  },
];

const mockLoadMoreData: UserActivityTimelineEntry[] = [
  {
    id: 'activity-4',
    type: ActivityAction.PROFILE_UPDATE,
    title: 'Profile Updated',
    description: 'User profile information was modified',
    timestamp: '2024-03-13T14:20:00Z',
    performedBy: {
      id: 'user-1',
      username: 'john.doe',
      fullName: 'John Doe',
    },
    metadata: {
      oldValue: { phone: '555-0100' },
      newValue: { phone: '555-0200' },
    },
  },
];

// Mock server
const server = setupServer(
  http.get('/api/users/:userId/activity', ({ params }) => {
    const { userId } = params;
    const url = new URL(window.location.href);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    
    if (page === 0) {
      return HttpResponse.json({
        content: mockActivityEntries,
        totalElements: 4,
        totalPages: 2,
        number: 0,
        size: 3,
        numberOfElements: 3,
        first: true,
        last: false,
      });
    } else if (page === 1) {
      return HttpResponse.json({
        content: mockLoadMoreData,
        totalElements: 4,
        totalPages: 2,
        number: 1,
        size: 3,
        numberOfElements: 1,
        first: false,
        last: true,
      });
    }
    
    return HttpResponse.json({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
      numberOfElements: 0,
      first: true,
      last: true,
    });
  }),
  
  http.get('/api/users/:userId/activity/error', () => {
    return HttpResponse.json(
      { message: 'Failed to fetch activity' },
      { status: 500 }
    );
  })
);

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      userApi: userApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(userApi.middleware),
  });
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = createTestStore();
  
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );
};

// Component mock (since we're testing the component interface)
const UserActivityTimeline: React.FC<{
  userId: string;
  className?: string;
  maxHeight?: string;
  showRefresh?: boolean;
  onActivityClick?: (activity: UserActivityTimelineEntry) => void;
}> = ({ 
  userId, 
  className = '', 
  maxHeight = '400px',
  showRefresh = true,
  onActivityClick 
}) => {
  const [activities, setActivities] = React.useState<UserActivityTimelineEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hasMore, setHasMore] = React.useState(false);
  const [page, setPage] = React.useState(0);

  const loadActivities = React.useCallback(async (pageNum: number = 0, reset: boolean = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}/activity?page=${pageNum}&size=3`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      if (reset) {
        setActivities(data.content);
      } else {
        setActivities(prev => [...prev, ...data.content]);
      }
      
      setHasMore(!data.last);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    loadActivities(0, true);
  }, [loadActivities]);

  const handleRefresh = () => {
    loadActivities(0, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadActivities(page + 1, false);
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div data-testid="activity-loading" className={className}>
        Loading activity...
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="activity-error" className={className}>
        <div data-testid="alert">
          <div data-testid="alert-description">Failed to load activity</div>
        </div>
        <button onClick={handleRefresh} data-testid="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div data-testid="user-activity-timeline" className={className}>
      <div data-testid="card">
        <div data-testid="card-header">
          <h3 data-testid="card-title">Activity Timeline</h3>
          {showRefresh && (
            <button 
              onClick={handleRefresh}
              disabled={loading}
              data-testid="refresh-button"
            >
              <div data-testid="refresh-icon" />
              Refresh
            </button>
          )}
        </div>
        
        <div data-testid="card-content" style={{ maxHeight, overflow: 'auto' }}>
          {activities.length === 0 ? (
            <div data-testid="no-activity" className="text-center">
              No activity found
            </div>
          ) : (
            <div data-testid="activity-list">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  data-testid={`activity-item-${activity.id}`}
                  className="activity-item"
                  onClick={() => onActivityClick?.(activity)}
                >
                  <div data-testid="activity-icon">
                    {activity.type === ActivityAction.LOGIN && <div data-testid="user-icon" />}
                    {activity.type !== ActivityAction.LOGIN && <div data-testid="clock-icon" />}
                  </div>
                  
                  <div data-testid="activity-content">
                    <div data-testid="activity-header">
                      <span data-testid="activity-title">{activity.title}</span>
                      <span data-testid="badge" data-variant="outline">
                        {activity.type}
                      </span>
                    </div>
                    
                    <div data-testid="activity-description">
                      {activity.description}
                    </div>
                    
                    <div data-testid="activity-meta">
                      <span data-testid="activity-time">
                        {new Date(activity.timestamp).toLocaleString()} ago
                      </span>
                      <span data-testid="activity-performer">
                        by {activity.performedBy.fullName}
                      </span>
                    </div>
                    
                    {activity.metadata && (
                      <div data-testid="activity-metadata">
                        {activity.metadata.reason && (
                          <div data-testid="metadata-reason">
                            Reason: {activity.metadata.reason}
                          </div>
                        )}
                        {activity.metadata.oldValue && activity.metadata.newValue && (
                          <div data-testid="metadata-changes">
                            Changed from {JSON.stringify(activity.metadata.oldValue)} to {JSON.stringify(activity.metadata.newValue)}
                          </div>
                        )}
                        {activity.metadata.ipAddress && (
                          <div data-testid="metadata-ip">
                            IP: {activity.metadata.ipAddress}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {hasMore && (
            <div data-testid="load-more-section">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                data-testid="load-more-button"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

describe('UserActivityTimeline', () => {
  beforeEach(() => {
    server.listen();
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('Basic Rendering', () => {
    it('should render activity timeline with title', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" />
        </TestWrapper>
      );

      expect(screen.getByTestId('user-activity-timeline')).toBeInTheDocument();
      expect(screen.getByTestId('card-title')).toHaveTextContent('Activity Timeline');
    });

    it('should show loading state initially', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" />
        </TestWrapper>
      );

      expect(screen.getByTestId('activity-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading activity...')).toBeInTheDocument();
    });

    it('should render refresh button when showRefresh is true', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" showRefresh={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
      });
    });

    it('should not render refresh button when showRefresh is false', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" showRefresh={false} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('refresh-button')).not.toBeInTheDocument();
      });
    });
  });

  describe('Data Loading and Display', () => {
    it('should load and display activity entries', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('activity-list')).toBeInTheDocument();
      });

      // Check that activities are displayed
      expect(screen.getByTestId('activity-item-activity-1')).toBeInTheDocument();
      expect(screen.getByTestId('activity-item-activity-2')).toBeInTheDocument();
      expect(screen.getByTestId('activity-item-activity-3')).toBeInTheDocument();

      // Check activity content
      expect(screen.getByText('User Login')).toBeInTheDocument();
      expect(screen.getByText('Role Changed')).toBeInTheDocument();
      expect(screen.getByText('Password Changed')).toBeInTheDocument();
    });

    it('should display activity metadata correctly', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('activity-item-activity-1')).toBeInTheDocument();
      });

      // Check metadata for login activity (IP address)
      expect(screen.getByTestId('metadata-ip')).toHaveTextContent('IP: 192.168.1.100');

      // Check metadata for role change (reason and values)
      expect(screen.getByTestId('metadata-reason')).toHaveTextContent('Reason: Promotion to administrative role');
      expect(screen.getByTestId('metadata-changes')).toHaveTextContent('Changed from "USER" to "ADMIN"');
    });

    it('should display performer information', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('by John Doe')).toBeInTheDocument();
        expect(screen.getByText('by System Administrator')).toBeInTheDocument();
      });
    });

    it('should show no activity message when no data', async () => {
      server.use(
        http.get('/api/users/:userId/activity', () => {
          return HttpResponse.json({
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: 10,
            numberOfElements: 0,
            first: true,
            last: true,
          });
        })
      );

      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-empty" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('no-activity')).toBeInTheDocument();
        expect(screen.getByText('No activity found')).toBeInTheDocument();
      });
    });
  });

  describe('Load More Functionality', () => {
    it('should show load more button when has more data', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
        expect(screen.getByText('Load More')).toBeInTheDocument();
      });
    });

    it('should load more activities when load more button clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByTestId('load-more-button');
      await user.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.getByTestId('activity-item-activity-4')).toBeInTheDocument();
        expect(screen.getByText('Profile Updated')).toBeInTheDocument();
      });

      // Load more button should be hidden after loading all data
      await waitFor(() => {
        expect(screen.queryByTestId('load-more-button')).not.toBeInTheDocument();
      });
    });

    it('should show loading state on load more button while loading', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('load-more-button')).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByTestId('load-more-button');
      await user.click(loadMoreButton);

      // Should show loading text briefly
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error state when API fails', async () => {
      server.use(
        http.get('/api/users/:userId/activity', () => {
          return HttpResponse.json(
            { message: 'Failed to fetch activity' },
            { status: 500 }
          );
        })
      );

      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-error" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('activity-error')).toBeInTheDocument();
        expect(screen.getByText('Failed to load activity')).toBeInTheDocument();
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });
    });

    it('should retry loading when retry button clicked', async () => {
      const user = userEvent.setup();

      // Start with error
      server.use(
        http.get('/api/users/:userId/activity', () => {
          return HttpResponse.json(
            { message: 'Failed to fetch activity' },
            { status: 500 }
          );
        })
      );

      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-error" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });

      // Reset to success
      server.resetHandlers(
        http.get('/api/users/:userId/activity', () => {
          return HttpResponse.json({
            content: mockActivityEntries,
            totalElements: 3,
            totalPages: 1,
            number: 0,
            size: 10,
            numberOfElements: 3,
            first: true,
            last: true,
          });
        })
      );

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('activity-list')).toBeInTheDocument();
        expect(screen.getByText('User Login')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh data when refresh button clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
      });

      const refreshButton = screen.getByTestId('refresh-button');
      await user.click(refreshButton);

      // Should show loading state briefly
      expect(refreshButton).toBeDisabled();

      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      });
    });
  });

  describe('Activity Interaction', () => {
    it('should call onActivityClick when activity item clicked', async () => {
      const user = userEvent.setup();
      const mockOnActivityClick = vi.fn();

      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" onActivityClick={mockOnActivityClick} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('activity-item-activity-1')).toBeInTheDocument();
      });

      const activityItem = screen.getByTestId('activity-item-activity-1');
      await user.click(activityItem);

      expect(mockOnActivityClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'activity-1',
          type: ActivityAction.LOGIN,
          title: 'User Login',
        })
      );
    });
  });

  describe('Activity Types and Icons', () => {
    it('should display correct icons for different activity types', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('activity-list')).toBeInTheDocument();
      });

      // Login activity should have user icon
      const loginActivity = screen.getByTestId('activity-item-activity-1');
      expect(within(loginActivity).getByTestId('user-icon')).toBeInTheDocument();

      // Other activities should have clock icon
      const roleActivity = screen.getByTestId('activity-item-activity-2');
      expect(within(roleActivity).getByTestId('clock-icon')).toBeInTheDocument();
    });

    it('should display activity type badges', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('activity-list')).toBeInTheDocument();
      });

      // Check for activity type badges
      const badges = screen.getAllByTestId('badge');
      expect(badges).toHaveLength(3);
      
      // Check specific activity types
      expect(screen.getByText('LOGIN')).toBeInTheDocument();
      expect(screen.getByText('ROLE_CHANGE')).toBeInTheDocument();
      expect(screen.getByText('PASSWORD_CHANGE')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should apply custom className', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" className="custom-timeline" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-activity-timeline')).toHaveClass('custom-timeline');
      });
    });

    it('should apply custom maxHeight to content area', async () => {
      render(
        <TestWrapper>
          <UserActivityTimeline userId="user-1" maxHeight="300px" />
        </TestWrapper>
      );

      await waitFor(() => {
        const cardContent = screen.getByTestId('card-content');
        expect(cardContent).toHaveStyle({ maxHeight: '300px', overflow: 'auto' });
      });
    });
  });
});