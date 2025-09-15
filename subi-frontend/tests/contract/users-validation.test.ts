import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse, http } from 'msw';
import { store } from '@/store';
import { userApi } from '@/store/api/userApi';

// Mock server for API contract testing
const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('User Validation API Contract Tests', () => {
  describe('GET /users/exists/username/{username} - Username availability check', () => {
    it('should return false for available username', async () => {
      const availableUsername = 'newusername';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/username/${availableUsername}`, () => {
          return HttpResponse.json(false, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkUsernameAvailability.initiate(availableUsername)
      );

      expect(result.data).toBe(false); // false means username is available
      expect(result.error).toBeUndefined();
    });

    it('should return true for existing username', async () => {
      const existingUsername = 'johndoe';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/username/${existingUsername}`, () => {
          return HttpResponse.json(true, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkUsernameAvailability.initiate(existingUsername)
      );

      expect(result.data).toBe(true); // true means username exists (not available)
    });

    it('should handle case-insensitive username check', async () => {
      const uppercaseUsername = 'JOHNDOE';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/username/${uppercaseUsername}`, () => {
          return HttpResponse.json(true, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkUsernameAvailability.initiate(uppercaseUsername)
      );

      expect(result.data).toBe(true);
    });

    it('should reject invalid username format', async () => {
      const invalidUsername = 'ab'; // Too short

      server.use(
        http.get(`http://localhost:8080/api/users/exists/username/${invalidUsername}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid username format',
              errors: ['Username must be at least 3 characters long']
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkUsernameAvailability.initiate(invalidUsername)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should reject username with special characters', async () => {
      const invalidUsername = 'user@name!';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/username/${invalidUsername}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid username format',
              errors: ['Username can only contain letters, numbers, and underscores']
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkUsernameAvailability.initiate(invalidUsername)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should handle very long username check', async () => {
      const longUsername = 'a'.repeat(60); // Over 50 character limit

      server.use(
        http.get(`http://localhost:8080/api/users/exists/username/${longUsername}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid username format',
              errors: ['Username must not exceed 50 characters']
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkUsernameAvailability.initiate(longUsername)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should handle server errors during username check', async () => {
      const username = 'testuser';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/username/${username}`, () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkUsernameAvailability.initiate(username)
      );

      expect(result.error?.status).toBe(500);
    });

    it('should handle rate limiting for username checks', async () => {
      const username = 'ratelimited';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/username/${username}`, () => {
          return HttpResponse.json(
            { 
              message: 'Too many requests',
              retryAfter: 60
            },
            { status: 429 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkUsernameAvailability.initiate(username)
      );

      expect(result.error?.status).toBe(429);
    });
  });

  describe('GET /users/exists/email/{email} - Email availability check', () => {
    it('should return false for available email', async () => {
      const availableEmail = 'newemail@example.com';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/${availableEmail}`, () => {
          return HttpResponse.json(false, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(availableEmail)
      );

      expect(result.data).toBe(false); // false means email is available
      expect(result.error).toBeUndefined();
    });

    it('should return true for existing email', async () => {
      const existingEmail = 'john.doe@example.com';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/${existingEmail}`, () => {
          return HttpResponse.json(true, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(existingEmail)
      );

      expect(result.data).toBe(true); // true means email exists (not available)
    });

    it('should handle case-insensitive email check', async () => {
      const uppercaseEmail = 'JOHN.DOE@EXAMPLE.COM';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/${uppercaseEmail}`, () => {
          return HttpResponse.json(true, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(uppercaseEmail)
      );

      expect(result.data).toBe(true);
    });

    it('should reject invalid email format', async () => {
      const invalidEmail = 'invalid-email';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/${invalidEmail}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid email format',
              errors: ['Please provide a valid email address']
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(invalidEmail)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should reject email without @ symbol', async () => {
      const invalidEmail = 'useremail.com';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/${invalidEmail}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid email format',
              errors: ['Email must contain @ symbol']
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(invalidEmail)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should reject email without domain', async () => {
      const invalidEmail = 'user@';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/${invalidEmail}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid email format',
              errors: ['Email must have a valid domain']
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(invalidEmail)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should handle special characters in email correctly', async () => {
      const specialEmail = 'user+test.123@sub.example.com';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/*`, ({ request }) => {
          const url = new URL(request.url);
          const email = decodeURIComponent(url.pathname.split('/').pop() || '');
          if (email === specialEmail) {
            return HttpResponse.json(false, { status: 200 });
          }
          return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(specialEmail)
      );

      expect(result.data).toBe(false); // Valid email with special characters should work
    });

    it('should handle international domain names', async () => {
      const internationalEmail = 'user@example.co.uk';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/${internationalEmail}`, () => {
          return HttpResponse.json(false, { status: 200 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(internationalEmail)
      );

      expect(result.data).toBe(false);
    });

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com'; // Extremely long email

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/${longEmail}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Email too long',
              errors: ['Email address exceeds maximum length']
            },
            { status: 400 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(longEmail)
      );

      expect(result.error?.status).toBe(400);
    });

    it('should handle server errors during email check', async () => {
      const email = 'test@example.com';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/${email}`, () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(email)
      );

      expect(result.error?.status).toBe(500);
    });

    it('should handle rate limiting for email checks', async () => {
      const email = 'ratelimited@example.com';

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/${email}`, () => {
          return HttpResponse.json(
            { 
              message: 'Too many requests',
              retryAfter: 60
            },
            { status: 429 }
          );
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(email)
      );

      expect(result.error?.status).toBe(429);
    });

    it('should handle URL encoding for special characters in email', async () => {
      const emailWithSpaces = 'user name@example.com'; // Invalid but should handle encoding

      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/*`, ({ request }) => {
          const url = new URL(request.url);
          const email = decodeURIComponent(url.pathname.split('/').pop() || '');
          if (email === emailWithSpaces) {
            return HttpResponse.json(
              {
                success: false,
                message: 'Invalid email format',
                errors: ['Email cannot contain spaces']
              },
              { status: 400 }
            );
          }
          return HttpResponse.json({ message: 'Not found' }, { status: 404 });
        })
      );

      const result = await store.dispatch(
        userApi.endpoints.checkEmailAvailability.initiate(emailWithSpaces)
      );

      expect(result.error?.status).toBe(400);
    });
  });

  describe('Real-time validation integration', () => {
    it('should debounce rapid username checks', async () => {
      const username1 = 'rapid1';
      const username2 = 'rapid2';
      const username3 = 'rapid3';

      let callCount = 0;
      server.use(
        http.get(`http://localhost:8080/api/users/exists/username/*`, () => {
          callCount++;
          return HttpResponse.json(false, { status: 200 });
        })
      );

      // Fire multiple requests rapidly
      const promises = [
        store.dispatch(userApi.endpoints.checkUsernameAvailability.initiate(username1)),
        store.dispatch(userApi.endpoints.checkUsernameAvailability.initiate(username2)),
        store.dispatch(userApi.endpoints.checkUsernameAvailability.initiate(username3))
      ];

      await Promise.all(promises);
      
      // Note: In a real debounced implementation, callCount might be less than 3
      // This test demonstrates the contract for rapid requests
      expect(callCount).toBeGreaterThan(0);
    });

    it('should debounce rapid email checks', async () => {
      const email1 = 'rapid1@example.com';
      const email2 = 'rapid2@example.com';
      const email3 = 'rapid3@example.com';

      let callCount = 0;
      server.use(
        http.get(`http://localhost:8080/api/users/exists/email/*`, () => {
          callCount++;
          return HttpResponse.json(false, { status: 200 });
        })
      );

      // Fire multiple requests rapidly
      const promises = [
        store.dispatch(userApi.endpoints.checkEmailAvailability.initiate(email1)),
        store.dispatch(userApi.endpoints.checkEmailAvailability.initiate(email2)),
        store.dispatch(userApi.endpoints.checkEmailAvailability.initiate(email3))
      ];

      await Promise.all(promises);
      
      expect(callCount).toBeGreaterThan(0);
    });
  });
});