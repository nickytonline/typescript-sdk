/**
 * Generates a random code verifier for PKCE.
 * @param length The length of the code verifier (default: 43)
 * @returns A random code verifier string
 */
export function generateCodeVerifier(length: number = 43): string {
  const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let codeVerifier = '';

  // Generate random bytes and convert to valid characters
  const randomBytes = new Uint8Array(length);

  // Universal crypto implementation that works across runtimes
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Works in browsers, Cloudflare Workers, Deno, and Bun
    crypto.getRandomValues(randomBytes);
  } else {
    // Fallback for Node.js < 15
    const nodeCrypto = require('crypto');
    const bytes = nodeCrypto.randomBytes(length);
    randomBytes.set(bytes);
  }

  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % validChars.length;
    codeVerifier += validChars[index];
  }

  return codeVerifier;
}

/**
 * Generates a code challenge from a code verifier using SHA-256.
 * @param codeVerifier The code verifier to generate the challenge from
 * @returns A base64url-encoded code challenge
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  // Universal crypto implementation that works across runtimes
  let hash: Uint8Array;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // Modern Web Crypto API (browsers, Cloudflare Workers, Deno, Bun)
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    hash = new Uint8Array(digest);
  } else {
    // Fallback for Node.js
    const nodeCrypto = require('crypto');
    hash = nodeCrypto.createHash('sha256')
      .update(codeVerifier)
      .digest();
  }

  // Convert to base64url format
  return btoa(String.fromCharCode(...hash))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Validates a code verifier against a code challenge.
 * @param codeVerifier The code verifier to validate
 * @param codeChallenge The code challenge to validate against
 * @returns True if the code verifier is valid for the challenge
 */
export async function validateCodeVerifier(codeVerifier: string, codeChallenge: string): Promise<boolean> {
  const calculatedChallenge = await generateCodeChallenge(codeVerifier);
  return calculatedChallenge === codeChallenge;
}