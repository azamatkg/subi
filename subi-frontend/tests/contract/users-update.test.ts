import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { store } from '@/store';
import { userApi } from '@/store/api/userApi';
import type { UserResponse, UserUpdateDto } from '@/types/user';

// Mock server for API contract testing
const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

describe('User Update API Contract Tests', () => {
  describe('PUT /users/{id} - Update existing user', () => {
    const existingUserId = 'user-123';

    it('should update user with valid partial data', async () => {
      const updateDto: UserUpdateDto = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        phone: '+0987654321',
        department: 'Marketing'
      };

      const mockResponse: UserResponse = {
        success: true,
        data: {
          id: existingUserId,
          username: 'existinguser',
          email: 'existing@example.com',
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast',
          phone: '+0987654321',
          department: 'Marketing',
          roles: ['USER'],
          status: 'ACTIVE',
          enabled: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          lastLoginAt: '2024-01-10T14:20:00Z',
          fullName: 'UpdatedFirst UpdatedLast'
        },
        message: 'User updated successfully'
      };

      server.use(
        http.put(`/api/users/${existingUserId}`, async ({ request, params }) => {
          expect(params.id).toBe(existingUserId);
          
          const body = await request.json() as UserUpdateDto;
          expect(body).toMatchObject({
            firstName: 'UpdatedFirst',
            lastName: 'UpdatedLast',
            phone: '+0987654321',
            department: 'Marketing'
          });

          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.updateUser.initiate({
          id: existingUserId,
          data: updateDto
        })
      );

      expect(result.data).toBeDefined();
      expect(result.data?.success).toBe(true);
      expect(result.data?.data).toMatchObject({
        id: existingUserId,
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        phone: '+0987654321',
        department: 'Marketing',
        fullName: 'UpdatedFirst UpdatedLast',
        updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
      });
    });

    it('should update user email with validation', async () => {
      const updateDto: UserUpdateDto = {
        email: 'newemail@example.com'
      };

      const mockResponse: UserResponse = {
        success: true,
        data: {
          id: existingUserId,
          username: 'existinguser',
          email: 'newemail@example.com',
          firstName: 'Existing',
          lastName: 'User',
          roles: ['USER'],
          status: 'ACTIVE',
          enabled: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          fullName: 'Existing User'
        },
        message: 'User updated successfully'
      };

      server.use(
        http.put(`/api/users/${existingUserId}`, async ({ request }) => {
          const body = await request.json() as UserUpdateDto;
          expect(body.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.updateUser.initiate({
          id: existingUserId,
          data: updateDto
        })
      );

      expect(result.data?.data.email).toBe('newemail@example.com');
    });

    it('should update user password with validation', async () => {
      const updateDto: UserUpdateDto = {
        password: 'newpassword123'
      };

      const mockResponse: UserResponse = {
        success: true,
        data: {
          id: existingUserId,
          username: 'existinguser',
          email: 'existing@example.com',
          firstName: 'Existing',
          lastName: 'User',
          roles: ['USER'],
          status: 'ACTIVE',
          enabled: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          fullName: 'Existing User'
        },
        message: 'User updated successfully'
      };

      server.use(
        http.put(`/api/users/${existingUserId}`, async ({ request }) => {
          const body = await request.json() as UserUpdateDto;
          expect(body.password).toBeDefined();
          expect(body.password!.length).toBeGreaterThanOrEqual(6);
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.updateUser.initiate({
          id: existingUserId,
          data: updateDto
        })
      );

      expect(result.data?.success).toBe(true);
    });

    it('should update user roles', async () => {
      const updateDto: UserUpdateDto = {
        roles: ['USER', 'CREDIT_ANALYST']
      };

      const mockResponse: UserResponse = {
        success: true,
        data: {
          id: existingUserId,
          username: 'existinguser',
          email: 'existing@example.com',
          firstName: 'Existing',
          lastName: 'User',
          roles: ['USER', 'CREDIT_ANALYST'],
          status: 'ACTIVE',
          enabled: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          fullName: 'Existing User'
        },
        message: 'User updated successfully'
      };

      server.use(
        http.put(`/api/users/${existingUserId}`, async ({ request }) => {
          const body = await request.json() as UserUpdateDto;
          expect(body.roles).toEqual(['USER', 'CREDIT_ANALYST']);
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.updateUser.initiate({
          id: existingUserId,
          data: updateDto
        })
      );

      expect(result.data?.data.roles).toEqual(['USER', 'CREDIT_ANALYST']);
    });

    it('should update user enabled status', async () => {
      const updateDto: UserUpdateDto = {
        enabled: false
      };

      const mockResponse: UserResponse = {
        success: true,
        data: {
          id: existingUserId,
          username: 'existinguser',
          email: 'existing@example.com',
          firstName: 'Existing',
          lastName: 'User',
          roles: ['USER'],
          status: 'INACTIVE',
          enabled: false,
          isActive: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
          fullName: 'Existing User'
        },
        message: 'User updated successfully'
      };

      server.use(
        http.put(`/api/users/${existingUserId}`, async ({ request }) => {
          const body = await request.json() as UserUpdateDto;
          expect(body.enabled).toBe(false);
          return HttpResponse.json(mockResponse, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.updateUser.initiate({
          id: existingUserId,
          data: updateDto
        })
      );

      expect(result.data?.data.enabled).toBe(false);
      expect(result.data?.data.isActive).toBe(false);
    });

    it('should reject update with invalid email format', async () => {
      const updateDto: UserUpdateDto = {
        email: 'invalid-email-format'
      };

      server.use(
        http.put(`/api/users/${existingUserId}`, () => {
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
        userApi.endpoints.updateUser.initiate({
          id: existingUserId,
          data: updateDto
        })
      );

      expect(result.error?.status).toBe(400);
    });

    it('should reject update with duplicate email', async () => {
      const updateDto: UserUpdateDto = {
        email: 'alreadyexists@example.com'
      };

      server.use(
        http.put(`/api/users/${existingUserId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Email already exists',
              errors: ['Email "alreadyexists@example.com" is already registered']
            },
            { status: 409 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.updateUser.initiate({
          id: existingUserId,
          data: updateDto
        })
      );

      expect(result.error?.status).toBe(409);
    });

    it('should reject update with weak password', async () => {
      const updateDto: UserUpdateDto = {
        password: '123'
      };

      server.use(
        http.put(`/api/users/${existingUserId}`, () => {
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
        userApi.endpoints.updateUser.initiate({
          id: existingUserId,
          data: updateDto
        })
      );

      expect(result.error?.status).toBe(400);
    });

    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 'nonexistent-123';
      const updateDto: UserUpdateDto = {
        firstName: 'Updated'
      };

      server.use(
        http.put(`/api/users/${nonExistentId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'User not found'
            },
            { status: 404 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.updateUser.initiate({
          id: nonExistentId,
          data: updateDto
        })
      );

      expect(result.error?.status).toBe(404);
    });

    it('should handle unauthorized update attempts', async () => {
      const updateDto: UserUpdateDto = {
        firstName: 'Updated'
      };

      server.use(
        http.put(`/api/users/${existingUserId}`, () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.updateUser.initiate({
          id: existingUserId,
          data: updateDto
        })
      );

      expect(result.error?.status).toBe(401);
    });

    it('should handle forbidden update attempts', async () => {
      const updateDto: UserUpdateDto = {
        roles: ['ADMIN']
      };

      server.use(
        http.put(`/api/users/${existingUserId}`, () => {
          return HttpResponse.json(
            { message: 'Forbidden - insufficient permissions' },
            { status: 403 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.updateUser.initiate({
          id: existingUserId,
          data: updateDto
        })
      );

      expect(result.error?.status).toBe(403);
    });
  });
});