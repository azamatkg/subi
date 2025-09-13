import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { store } from '@/store';
import { userApi } from '@/store/api/userApi';
import type { UserCreateDto, UserResponse } from '@/types/user';

// Mock server for API contract testing
const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

describe('User Creation API Contract Tests', () => {
  describe('POST /users - Create new user', () => {
    it('should create user with valid data and return complete user object', async () => {
      const createDto: UserCreateDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        enabled: true,
        phone: '+1234567890',
        department: 'Engineering',
        roles: ['USER']
      };

      const mockResponse: UserResponse = {
        success: true,
        data: {
          id: 'user-123',
          username: 'newuser',
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
          phone: '+1234567890',
          department: 'Engineering',
          roles: ['USER'],
          status: 'ACTIVE',
          enabled: true,
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          lastLoginAt: null,
          fullName: 'New User'
        },
        message: 'User created successfully'
      };

      server.use(
        http.post('/api/users', async ({ request }) => {
          const body = await request.json() as UserCreateDto;
          
          // Validate required fields
          expect(body).toMatchObject({
            username: expect.any(String),
            email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
            password: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String)
          });

          // Validate password minimum length
          expect(body.password.length).toBeGreaterThanOrEqual(6);
          
          // Validate username length constraints
          expect(body.username.length).toBeGreaterThanOrEqual(3);
          expect(body.username.length).toBeLessThanOrEqual(50);

          return HttpResponse.json(mockResponse, { status: 201 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.createUser.initiate(createDto)
      );

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(result.data?.data).toEqual({
        id: expect.any(String),
        username: 'newuser',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        phone: '+1234567890',
        department: 'Engineering',
        roles: ['USER'],
        status: 'ACTIVE',
        enabled: true,
        isActive: true,
        createdAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
        updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
        lastLoginAt: null,
        fullName: 'New User'
      });
    });

    it('should create user with minimal required fields', async () => {
      const minimalDto: UserCreateDto = {
        username: 'minimal',
        email: 'minimal@example.com',
        password: 'password123',
        firstName: 'Min',
        lastName: 'User'
      };

      const mockResponse: UserResponse = {
        success: true,
        data: {
          id: 'user-456',
          username: 'minimal',
          email: 'minimal@example.com',
          firstName: 'Min',
          lastName: 'User',
          roles: [],
          status: 'ACTIVE',
          enabled: true,
          isActive: true,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          fullName: 'Min User'
        },
        message: 'User created successfully'
      };

      server.use(
        http.post('/api/users', () => {
          return HttpResponse.json(mockResponse, { status: 201 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.createUser.initiate(minimalDto)
      );

      expect(result.data?.success).toBe(true);
      expect(result.data?.data.username).toBe('minimal');
      expect(result.data?.data.enabled).toBe(true); // Should default to true
    });

    it('should reject user creation with duplicate username', async () => {
      const duplicateDto: UserCreateDto = {
        username: 'existing',
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      server.use(
        http.post('/api/users', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Username already exists',
              errors: ['Username "existing" is already taken']
            },
            { status: 409 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.createUser.initiate(duplicateDto)
      );

      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(409);
    });

    it('should reject user creation with duplicate email', async () => {
      const duplicateEmailDto: UserCreateDto = {
        username: 'newusername',
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      server.use(
        http.post('/api/users', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Email already exists',
              errors: ['Email "existing@example.com" is already registered']
            },
            { status: 409 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.createUser.initiate(duplicateEmailDto)
      );

      expect(result.error?.status).toBe(409);
    });

    it('should reject user creation with invalid email format', async () => {
      const invalidEmailDto: UserCreateDto = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      server.use(
        http.post('/api/users', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: ['Email format is invalid']
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.createUser.initiate(invalidEmailDto)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should reject user creation with weak password', async () => {
      const weakPasswordDto: UserCreateDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User'
      };

      server.use(
        http.post('/api/users', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: ['Password must be at least 6 characters long']
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.createUser.initiate(weakPasswordDto)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should reject user creation with username too short or too long', async () => {
      const shortUsernameDto: UserCreateDto = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      server.use(
        http.post('/api/users', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: ['Username must be between 3 and 50 characters']
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.createUser.initiate(shortUsernameDto)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should handle server errors during user creation', async () => {
      const validDto: UserCreateDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      server.use(
        http.post('/api/users', () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.createUser.initiate(validDto)
      );

      expect(result.error?.status).toBe(500);
    });

    it('should handle unauthorized user creation attempts', async () => {
      const validDto: UserCreateDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      server.use(
        http.post('/api/users', () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.createUser.initiate(validDto)
      );

      expect(result.error?.status).toBe(401);
    });
  });
});