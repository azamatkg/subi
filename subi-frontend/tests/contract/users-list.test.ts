import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { store } from '@/store';
import { userApi } from '@/store/api/userApi';
import type { UserListResponse, UserListResponseDto } from '@/types/user';

// Mock server for API contract testing
const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

describe('User List API Contract Tests', () => {
  describe('GET /users - Basic user list', () => {
    it('should return paginated user list with correct structure', async () => {
      const mockResponse: UserListResponse = {
        content: [
          {
            id: 'user-1',
            username: 'jdoe',
            email: 'jdoe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            roles: ['USER'],
            status: 'ACTIVE',
            enabled: true,
            isActive: true,
            department: 'IT',
            lastLoginAt: '2024-01-15T10:30:00Z',
            createdAt: '2024-01-01T00:00:00Z'
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
        http.get('/api/users', () => {
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.getUsers.initiate({
          page: 0,
          size: 20,
          sort: 'lastName,asc'
        })
      );

      expect(result.data).toBeDefined();
      expect(result.data?.content).toHaveLength(1);
      
      const user = result.data!.content[0];
      expect(user).toEqual({
        id: expect.any(String),
        username: expect.any(String),
        email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
        firstName: expect.any(String),
        lastName: expect.any(String),
        fullName: expect.any(String),
        roles: expect.any(Array),
        status: expect.stringMatching(/^(ACTIVE|INACTIVE|SUSPENDED)$/),
        enabled: expect.any(Boolean),
        isActive: expect.any(Boolean),
        department: expect.any(String),
        lastLoginAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
        createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      });

      // Verify pagination structure
      expect(result.data).toMatchObject({
        page: expect.any(Number),
        size: expect.any(Number),
        totalElements: expect.any(Number),
        totalPages: expect.any(Number),
        first: expect.any(Boolean),
        last: expect.any(Boolean),
        empty: expect.any(Boolean)
      });
    });

    it('should handle empty user list correctly', async () => {
      const emptyResponse: UserListResponse = {
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
        http.get('/api/users', () => {
          return HttpResponse.json(emptyResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.getUsers.initiate({})
      );

      expect(result.data?.content).toEqual([]);
      expect(result.data?.empty).toBe(true);
      expect(result.data?.totalElements).toBe(0);
    });

    it('should handle pagination parameters correctly', async () => {
      server.use(
        http.get('/api/users', ({ request }) => {
          const url = new URL(request.url);
          const page = url.searchParams.get('page');
          const size = url.searchParams.get('size');
          const sort = url.searchParams.get('sort');

          expect(page).toBe('1');
          expect(size).toBe('10');
          expect(sort).toBe('firstName,desc');

          return HttpResponse.json({
            content: [],
            page: 1,
            size: 10,
            totalElements: 0,
            totalPages: 0,
            first: false,
            last: true,
            empty: true
          }, { status: 200 });
        })
      );

      await store.dispatch(
        userApi.endpoints.getUsers.initiate({
          page: 1,
          size: 10,
          sort: 'firstName,desc'
        })
      );
    });

    it('should handle API errors appropriately', async () => {
      server.use(
        http.get('/api/users', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.getUsers.initiate({})
      );

      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(500);
    });

    it('should handle unauthorized access', async () => {
      server.use(
        http.get('/api/users', () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.getUsers.initiate({})
      );

      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(401);
    });
  });
});