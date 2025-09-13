import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { store } from '@/store';
import { userApi } from '@/store/api/userApi';
import type { UserListResponse, UserSearchAndFilterParams } from '@/types/user';

// Mock server for API contract testing
const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

describe('User Search API Contract Tests', () => {
  describe('GET /users/search - Advanced search and filtering', () => {
    it('should search users by search term', async () => {
      const searchParams: UserSearchAndFilterParams = {
        searchTerm: 'john',
        page: 0,
        size: 20
      };

      const mockResponse: UserListResponse = {
        content: [
          {
            id: 'user-1',
            username: 'johndoe',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            roles: ['USER'],
            status: 'ACTIVE',
            enabled: true,
            isActive: true,
            department: 'Engineering',
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 'user-2',
            username: 'johnsmith',
            email: 'john.smith@example.com',
            firstName: 'John',
            lastName: 'Smith',
            fullName: 'John Smith',
            roles: ['CREDIT_ANALYST'],
            status: 'ACTIVE',
            enabled: true,
            isActive: true,
            department: 'Finance',
            createdAt: '2024-01-02T00:00:00Z'
          }
        ],
        page: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
        first: true,
        last: true,
        empty: false
      };

      server.use(
        http.get('/api/users/search', ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('searchTerm')).toBe('john');
          expect(url.searchParams.get('page')).toBe('0');
          expect(url.searchParams.get('size')).toBe('20');
          
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.searchAndFilterUsers.initiate(searchParams)
      );

      expect(result.data?.content).toHaveLength(2);
      expect(result.data?.content[0].firstName).toBe('John');
      expect(result.data?.content[1].firstName).toBe('John');
      expect(result.data?.totalElements).toBe(2);
    });

    it('should filter users by role', async () => {
      const searchParams: UserSearchAndFilterParams = {
        roles: ['CREDIT_ANALYST'],
        page: 0,
        size: 20
      };

      const mockResponse: UserListResponse = {
        content: [
          {
            id: 'user-3',
            username: 'analyst1',
            email: 'analyst1@example.com',
            firstName: 'Jane',
            lastName: 'Analyst',
            fullName: 'Jane Analyst',
            roles: ['CREDIT_ANALYST'],
            status: 'ACTIVE',
            enabled: true,
            isActive: true,
            department: 'Finance',
            createdAt: '2024-01-03T00:00:00Z'
          }
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        empty: false
      };

      server.use(
        http.get('/api/users/search', ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('roles')).toBe('CREDIT_ANALYST');
          
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.searchAndFilterUsers.initiate(searchParams)
      );

      expect(result.data?.content[0].roles).toContain('CREDIT_ANALYST');
    });

    it('should filter users by status', async () => {
      const searchParams: UserSearchAndFilterParams = {
        status: 'SUSPENDED',
        page: 0,
        size: 20
      };

      const mockResponse: UserListResponse = {
        content: [
          {
            id: 'user-4',
            username: 'suspended_user',
            email: 'suspended@example.com',
            firstName: 'Suspended',
            lastName: 'User',
            fullName: 'Suspended User',
            roles: ['USER'],
            status: 'SUSPENDED',
            enabled: false,
            isActive: false,
            department: 'HR',
            createdAt: '2024-01-04T00:00:00Z'
          }
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        empty: false
      };

      server.use(
        http.get('/api/users/search', ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('status')).toBe('SUSPENDED');
          
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.searchAndFilterUsers.initiate(searchParams)
      );

      expect(result.data?.content[0].status).toBe('SUSPENDED');
    });

    it('should filter users by department', async () => {
      const searchParams: UserSearchAndFilterParams = {
        department: 'Engineering',
        page: 0,
        size: 20
      };

      const mockResponse: UserListResponse = {
        content: [
          {
            id: 'user-5',
            username: 'engineer1',
            email: 'engineer@example.com',
            firstName: 'Bob',
            lastName: 'Engineer',
            fullName: 'Bob Engineer',
            roles: ['USER'],
            status: 'ACTIVE',
            enabled: true,
            isActive: true,
            department: 'Engineering',
            createdAt: '2024-01-05T00:00:00Z'
          }
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        empty: false
      };

      server.use(
        http.get('/api/users/search', ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('department')).toBe('Engineering');
          
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.searchAndFilterUsers.initiate(searchParams)
      );

      expect(result.data?.content[0].department).toBe('Engineering');
    });

    it('should filter users by active status', async () => {
      const searchParams: UserSearchAndFilterParams = {
        isActive: true,
        page: 0,
        size: 20
      };

      const mockResponse: UserListResponse = {
        content: [
          {
            id: 'user-6',
            username: 'activeuser',
            email: 'active@example.com',
            firstName: 'Active',
            lastName: 'User',
            fullName: 'Active User',
            roles: ['USER'],
            status: 'ACTIVE',
            enabled: true,
            isActive: true,
            department: 'Sales',
            createdAt: '2024-01-06T00:00:00Z',
            lastLoginAt: '2024-01-15T09:30:00Z'
          }
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        empty: false
      };

      server.use(
        http.get('/api/users/search', ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('isActive')).toBe('true');
          
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.searchAndFilterUsers.initiate(searchParams)
      );

      expect(result.data?.content[0].isActive).toBe(true);
    });

    it('should filter users by date range', async () => {
      const searchParams: UserSearchAndFilterParams = {
        createdDateFrom: '2024-01-01',
        createdDateTo: '2024-01-31',
        page: 0,
        size: 20
      };

      const mockResponse: UserListResponse = {
        content: [
          {
            id: 'user-7',
            username: 'january_user',
            email: 'january@example.com',
            firstName: 'January',
            lastName: 'User',
            fullName: 'January User',
            roles: ['USER'],
            status: 'ACTIVE',
            enabled: true,
            isActive: true,
            department: 'Marketing',
            createdAt: '2024-01-15T00:00:00Z'
          }
        ],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        empty: false
      };

      server.use(
        http.get('/api/users/search', ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('createdDateFrom')).toBe('2024-01-01');
          expect(url.searchParams.get('createdDateTo')).toBe('2024-01-31');
          
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.searchAndFilterUsers.initiate(searchParams)
      );

      expect(result.data?.content[0].createdAt).toBe('2024-01-15T00:00:00Z');
    });

    it('should combine multiple search filters', async () => {
      const searchParams: UserSearchAndFilterParams = {
        searchTerm: 'manager',
        roles: ['CREDIT_MANAGER'],
        status: 'ACTIVE',
        department: 'Finance',
        isActive: true,
        page: 0,
        size: 10,
        sort: 'lastName,desc'
      };

      const mockResponse: UserListResponse = {
        content: [
          {
            id: 'user-8',
            username: 'finance_manager',
            email: 'manager@example.com',
            firstName: 'Finance',
            lastName: 'Manager',
            fullName: 'Finance Manager',
            roles: ['CREDIT_MANAGER'],
            status: 'ACTIVE',
            enabled: true,
            isActive: true,
            department: 'Finance',
            createdAt: '2024-01-08T00:00:00Z'
          }
        ],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        first: true,
        last: true,
        empty: false
      };

      server.use(
        http.get('/api/users/search', ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('searchTerm')).toBe('manager');
          expect(url.searchParams.get('roles')).toBe('CREDIT_MANAGER');
          expect(url.searchParams.get('status')).toBe('ACTIVE');
          expect(url.searchParams.get('department')).toBe('Finance');
          expect(url.searchParams.get('isActive')).toBe('true');
          expect(url.searchParams.get('sort')).toBe('lastName,desc');
          
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.searchAndFilterUsers.initiate(searchParams)
      );

      expect(result.data?.content[0].roles).toContain('CREDIT_MANAGER');
      expect(result.data?.content[0].department).toBe('Finance');
    });

    it('should return empty results for no matches', async () => {
      const searchParams: UserSearchAndFilterParams = {
        searchTerm: 'nonexistent',
        page: 0,
        size: 20
      };

      const mockResponse: UserListResponse = {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
        empty: true
      };

      server.use(
        http.get('/api/users/search', () => {
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.searchAndFilterUsers.initiate(searchParams)
      );

      expect(result.data?.content).toEqual([]);
      expect(result.data?.totalElements).toBe(0);
      expect(result.data?.empty).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      const searchParams: UserSearchAndFilterParams = {
        searchTerm: 'test',
        page: 2,
        size: 5
      };

      const mockResponse: UserListResponse = {
        content: [
          {
            id: 'user-11',
            username: 'test_user_11',
            email: 'test11@example.com',
            firstName: 'Test',
            lastName: 'User11',
            fullName: 'Test User11',
            roles: ['USER'],
            status: 'ACTIVE',
            enabled: true,
            isActive: true,
            department: 'Testing',
            createdAt: '2024-01-11T00:00:00Z'
          }
        ],
        page: 2,
        size: 5,
        totalElements: 11,
        totalPages: 3,
        first: false,
        last: true,
        empty: false
      };

      server.use(
        http.get('/api/users/search', ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('page')).toBe('2');
          expect(url.searchParams.get('size')).toBe('5');
          
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.searchAndFilterUsers.initiate(searchParams)
      );

      expect(result.data?.page).toBe(2);
      expect(result.data?.size).toBe(5);
      expect(result.data?.totalPages).toBe(3);
      expect(result.data?.first).toBe(false);
      expect(result.data?.last).toBe(true);
    });

    it('should handle server errors', async () => {
      const searchParams: UserSearchAndFilterParams = {
        searchTerm: 'error'
      };

      server.use(
        http.get('/api/users/search', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.searchAndFilterUsers.initiate(searchParams)
      );

      expect(result.error?.status).toBe(500);
    });

    it('should handle unauthorized search requests', async () => {
      const searchParams: UserSearchAndFilterParams = {
        searchTerm: 'test'
      };

      server.use(
        http.get('/api/users/search', () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.searchAndFilterUsers.initiate(searchParams)
      );

      expect(result.error?.status).toBe(401);
    });
  });
});