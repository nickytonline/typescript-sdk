import {
  getAuthorizationUrl,
  exchangeCodeForToken,
  fetchWithAuth,
  configure,
  TokenStorage,
  generateCodeVerifier,
  generateCodeChallenge
} from '../src/index.js';

// Example of a custom token storage implementation using localStorage
class LocalStorageTokenStorage implements TokenStorage {
  private readonly key = 'mcp_access_token';

  getToken(): string | null {
    return localStorage.getItem(this.key);
  }

  setToken(token: string): void {
    localStorage.setItem(this.key, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.key);
  }
}

// Create and configure the SDK to use our custom storage
const tokenStorage = new LocalStorageTokenStorage();
configure({
  tokenStorage,
});

async function main() {
  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier for later use (in a real app, you might want to use a more secure storage)
  sessionStorage.setItem('code_verifier', codeVerifier);

  // Step 1: Generate the authorization URL with PKCE
  const authUrl = getAuthorizationUrl({
    client_id: 'your-client-id',
    redirect_uri: 'http://localhost:3000/callback',
    state: 'random-state',
    scope: 'openid profile',
    code_challenge: codeChallenge,
  });

  console.log('Authorization URL:', authUrl);

  // Step 2: Simulate code exchange (in a real app, this would be triggered by the redirect)
  const code = 'received-auth-code';
  const storedCodeVerifier = sessionStorage.getItem('code_verifier');
  if (!storedCodeVerifier) {
    throw new Error('Code verifier not found in session storage');
  }

  const tokenResponse = await exchangeCodeForToken({
    code,
    client_id: 'your-client-id',
    redirect_uri: 'http://localhost:3000/callback',
    code_verifier: storedCodeVerifier,
  });

  // Store the token (now using localStorage)
  tokenStorage.setToken(tokenResponse.access_token);

  // Step 3: Make an authenticated request
  const response = await fetchWithAuth('https://api.example.com/protected', {
    method: 'GET',
  });

  console.log('Authenticated Response:', await response.json());
}

main().catch(console.error);