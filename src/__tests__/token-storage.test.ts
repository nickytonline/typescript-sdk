import { TokenStorage, InMemoryTokenStorage } from '../token-storage.js';
import { configure, fetchWithAuth } from '../fetch.js';

describe('Token Storage', () => {
  describe('InMemoryTokenStorage', () => {
    let storage: InMemoryTokenStorage;

    beforeEach(() => {
      storage = new InMemoryTokenStorage();
    });

    it('should start with no token', () => {
      expect(storage.getToken()).toBeNull();
    });

    it('should store and retrieve a token', () => {
      const token = 'test-token';
      storage.setToken(token);
      expect(storage.getToken()).toBe(token);
    });

    it('should clear the token', () => {
      storage.setToken('test-token');
      storage.clearToken();
      expect(storage.getToken()).toBeNull();
    });

    it('should update the token', () => {
      storage.setToken('old-token');
      storage.setToken('new-token');
      expect(storage.getToken()).toBe('new-token');
    });
  });

  describe('Custom Token Storage', () => {
    class TestTokenStorage implements TokenStorage {
      private token: string | null = null;
      public getTokenCalls = 0;
      public setTokenCalls = 0;
      public clearTokenCalls = 0;

      getToken(): string | null {
        this.getTokenCalls++;
        return this.token;
      }

      setToken(token: string): void {
        this.setTokenCalls++;
        this.token = token;
      }

      clearToken(): void {
        this.clearTokenCalls++;
        this.token = null;
      }
    }

    let storage: TestTokenStorage;

    beforeEach(() => {
      storage = new TestTokenStorage();
      configure({ tokenStorage: storage });
    });

    it('should use custom storage for token operations', () => {
      const token = 'test-token';
      storage.setToken(token);
      expect(storage.getToken()).toBe(token);
      expect(storage.getTokenCalls).toBe(1);
      expect(storage.setTokenCalls).toBe(1);
    });

    it('should clear token in custom storage', () => {
      storage.setToken('test-token');
      storage.clearToken();
      expect(storage.getToken()).toBeNull();
      expect(storage.clearTokenCalls).toBe(1);
    });
  });

  describe('fetchWithAuth Integration', () => {
    let storage: InMemoryTokenStorage;
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      storage = new InMemoryTokenStorage();
      configure({ tokenStorage: storage });
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should throw when no token is available', async () => {
      await expect(fetchWithAuth('https://api.example.com/protected')).rejects.toThrow('No access token available');
    });

    it('should include token in request headers', async () => {
      const token = 'test-token';
      storage.setToken(token);

      const mockFetch = jest.fn().mockResolvedValue(new Response());
      global.fetch = mockFetch;

      await fetchWithAuth('https://api.example.com/protected');

      const fetchCall = mockFetch.mock.calls[0];
      const headers = fetchCall[1].headers as Headers;

      expect(headers.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('should preserve existing headers', async () => {
      const token = 'test-token';
      storage.setToken(token);

      const mockFetch = jest.fn().mockResolvedValue(new Response());
      global.fetch = mockFetch;

      const customHeaders = new Headers({
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value',
      });

      await fetchWithAuth('https://api.example.com/protected', {
        headers: customHeaders,
      });

      const fetchCall = mockFetch.mock.calls[0];
      const headers = fetchCall[1].headers as Headers;

      expect(headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('X-Custom-Header')).toBe('custom-value');
    });
  });

  describe('Storage Configuration', () => {
    it('should allow switching storage implementations', () => {
      const storage1 = new InMemoryTokenStorage();
      const storage2 = new InMemoryTokenStorage();

      // Configure with first storage
      configure({ tokenStorage: storage1 });
      storage1.setToken('token1');

      // Switch to second storage
      configure({ tokenStorage: storage2 });
      storage2.setToken('token2');

      // Verify tokens are stored separately
      expect(storage1.getToken()).toBe('token1');
      expect(storage2.getToken()).toBe('token2');
    });

    it('should maintain separate storage instances', () => {
      const storage1 = new InMemoryTokenStorage();
      const storage2 = new InMemoryTokenStorage();

      storage1.setToken('token1');
      storage2.setToken('token2');

      expect(storage1.getToken()).toBe('token1');
      expect(storage2.getToken()).toBe('token2');
    });
  });
});