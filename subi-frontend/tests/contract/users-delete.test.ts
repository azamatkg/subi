import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { store } from '@/store';
import { userApi } from '@/store/api/userApi';

// Mock server for API contract testing
const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

describe('User Deletion API Contract Tests', () => {
  describe('DELETE /users/{id} - Delete existing user', () => {
    const existingUserId = 'user-123';

    it('should successfully delete existing user', async () => {
      server.use(
        http.delete(`/api/users/${existingUserId}`, ({ params }) => {
          expect(params.id).toBe(existingUserId);
          return new HttpResponse(null, { status: 204 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(existingUserId)
      );

      expect(result.data).toBeUndefined(); // No content returned for 204
      expect(result.error).toBeUndefined();
    });

    it('should return 404 when trying to delete non-existent user', async () => {
      const nonExistentId = 'nonexistent-456';

      server.use(
        http.delete(`/api/users/${nonExistentId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'User not found',
              error: `User with id "${nonExistentId}" does not exist`
            },
            { status: 404 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(nonExistentId)
      );

      expect(result.error).toBeDefined();
      expect(result.error?.status).toBe(404);
    });

    it('should handle unauthorized deletion attempts', async () => {
      server.use(
        http.delete(`/api/users/${existingUserId}`, () => {
          return HttpResponse.json(
            { message: 'Unauthorized - authentication required' },
            { status: 401 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(existingUserId)
      );

      expect(result.error?.status).toBe(401);
    });

    it('should handle forbidden deletion attempts (insufficient permissions)', async () => {
      server.use(
        http.delete(`/api/users/${existingUserId}`, () => {
          return HttpResponse.json(
            { 
              message: 'Forbidden - insufficient permissions to delete users',
              requiredRole: 'ADMIN'
            },
            { status: 403 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(existingUserId)
      );

      expect(result.error?.status).toBe(403);
    });

    it('should prevent deletion of user with active dependencies', async () => {
      const userWithDependenciesId = 'user-with-deps-789';

      server.use(
        http.delete(`/api/users/${userWithDependenciesId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot delete user with active dependencies',
              error: 'User has active credit applications and cannot be deleted',
              dependencies: {
                activeCreditApplications: 5,
                assignedDecisions: 12
              }
            },
            { status: 409 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(userWithDependenciesId)
      );

      expect(result.error?.status).toBe(409);
    });

    it('should prevent self-deletion', async () => {
      const currentUserId = 'current-user-123';

      server.use(
        http.delete(`/api/users/${currentUserId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot delete your own account',
              error: 'Users cannot delete their own accounts'
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(currentUserId)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should prevent deletion of system admin users', async () => {
      const systemAdminId = 'system-admin-001';

      server.use(
        http.delete(`/api/users/${systemAdminId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot delete system administrator account',
              error: 'System administrator accounts cannot be deleted'
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(systemAdminId)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should handle soft deletion if configured', async () => {
      const softDeleteUserId = 'soft-delete-user-456';

      server.use(
        http.delete(`/api/users/${softDeleteUserId}`, () => {
          return HttpResponse.json(
            {
              success: true,
              message: 'User soft deleted successfully',
              data: {
                id: softDeleteUserId,
                deleted: true,
                deletedAt: '2024-01-15T10:30:00Z'
              }
            },
            { status: 200 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(softDeleteUserId)
      );

      // Note: This test assumes the API might return data for soft deletes
      // The actual implementation might return 204 as defined in userApi
      expect(result.error).toBeUndefined();
    });

    it('should handle concurrent deletion attempts', async () => {
      const concurrentDeleteId = 'concurrent-delete-789';

      server.use(
        http.delete(`/api/users/${concurrentDeleteId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'User has already been deleted',
              error: 'The user was deleted by another administrator'
            },
            { status: 410 } // Gone
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(concurrentDeleteId)
      );

      expect(result.error?.status).toBe(410);
    });

    it('should handle server errors during deletion', async () => {
      server.use(
        http.delete(`/api/users/${existingUserId}`, () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(existingUserId)
      );

      expect(result.error?.status).toBe(500);
    });

    it('should validate user ID format', async () => {
      const invalidUserId = 'invalid-format-!!!';

      server.use(
        http.delete(`/api/users/${invalidUserId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid user ID format',
              error: 'User ID must be a valid UUID or alphanumeric string'
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(invalidUserId)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should handle deletion with confirmation token if required', async () => {
      const confirmedDeleteId = 'confirmed-delete-123';

      server.use(
        http.delete(`/api/users/${confirmedDeleteId}`, ({ request }) => {
          const confirmationHeader = request.headers.get('X-Confirmation-Token');
          
          if (!confirmationHeader) {
            return HttpResponse.json(
              {
                success: false,
                message: 'Confirmation token required for user deletion',
                confirmationRequired: true
              },
              { status: 428 } // Precondition Required
            );
          }

          return new HttpResponse(null, { status: 204 });
        })
      );

      // Test without confirmation token
      const resultWithoutToken = await store.dispatch(
        userApi.endpoints.deleteUser.initiate(confirmedDeleteId)
      );

      expect(resultWithoutToken.error?.status).toBe(428);
    });
  });
});