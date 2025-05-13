import { getAuthorizationUrl, exchangeCodeForToken, fetchWithAuth, configure, TokenStorage, generateCodeVerifier, generateCodeChallenge } from '../src/index.js';

// Example of a custom token storage implementation using a file
class FileTokenStorage implements TokenStorage {
  private readonly filePath: string;
  private token: string | null = null;

  constructor(filePath: string) {
    this.filePath = filePath;
    // In a real implementation, you would load the token from the file here
  }

  getToken(): string | null {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    // In a real implementation, you would save the token to the file here
    console.log(`Token saved to ${this.filePath}`);
  }

  clearToken(): void {
    this.token = null;
    // In a real implementation, you would delete the token file here
    console.log(`Token cleared from ${this.filePath}`);
  }
}

// Create and configure the SDK to use our custom storage
const tokenStorage = new FileTokenStorage('./token.json');
configure({
  tokenStorage,
});

async function main() {
  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store code verifier for later use (in a real app, you might want to use a more secure storage)
  console.log('Code verifier (store this securely):', codeVerifier);

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
  const tokenResponse = await exchangeCodeForToken({
    code,
    client_id: 'your-client-id',
    redirect_uri: 'http://localhost:3000/callback',
    code_verifier: codeVerifier, // In a real app, you would retrieve this from secure storage
  });

  // Store the token (now using file storage)
  tokenStorage.setToken(tokenResponse.access_token);

  // Step 3: Make an authenticated request
  const response = await fetchWithAuth('https://api.example.com/protected', {
    method: 'GET',
  });

  console.log('Authenticated Response:', await response.json());
}

main().catch(console.error);