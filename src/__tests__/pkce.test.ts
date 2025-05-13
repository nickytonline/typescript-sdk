import { generateCodeVerifier, generateCodeChallenge, validateCodeVerifier } from '../pkce.js';

describe('PKCE Implementation', () => {
  describe('generateCodeVerifier', () => {
    it('should generate a code verifier of the correct length', () => {
      const verifier = generateCodeVerifier();
      expect(verifier.length).toBe(43);
    });

    it('should generate a code verifier with valid characters', () => {
      const verifier = generateCodeVerifier();
      const validChars = /^[A-Za-z0-9\-._~]+$/;
      expect(verifier).toMatch(validChars);
    });

    it('should generate different verifiers on each call', () => {
      const verifier1 = generateCodeVerifier();
      const verifier2 = generateCodeVerifier();
      expect(verifier1).not.toBe(verifier2);
    });

    it('should generate verifiers of custom length', () => {
      const length = 64;
      const verifier = generateCodeVerifier(length);
      expect(verifier.length).toBe(length);
    });
  });

  describe('generateCodeChallenge', () => {
    it('should generate a valid code challenge from a verifier', async () => {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);

      // Challenge should be base64url encoded
      expect(challenge).toMatch(/^[A-Za-z0-9\-._~]+$/);
      expect(challenge.length).toBeGreaterThan(0);
    });

    it('should generate different challenges for different verifiers', async () => {
      const verifier1 = generateCodeVerifier();
      const verifier2 = generateCodeVerifier();
      const challenge1 = await generateCodeChallenge(verifier1);
      const challenge2 = await generateCodeChallenge(verifier2);
      expect(challenge1).not.toBe(challenge2);
    });

    it('should generate the same challenge for the same verifier', async () => {
      const verifier = generateCodeVerifier();
      const challenge1 = await generateCodeChallenge(verifier);
      const challenge2 = await generateCodeChallenge(verifier);
      expect(challenge1).toBe(challenge2);
    });
  });

  describe('validateCodeVerifier', () => {
    it('should validate a correct code verifier', async () => {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const isValid = await validateCodeVerifier(verifier, challenge);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect code verifier', async () => {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const wrongVerifier = generateCodeVerifier();
      const isValid = await validateCodeVerifier(wrongVerifier, challenge);
      expect(isValid).toBe(false);
    });

    it('should handle invalid challenge format', async () => {
      const verifier = generateCodeVerifier();
      const invalidChallenge = 'invalid-challenge';
      const isValid = await validateCodeVerifier(verifier, invalidChallenge);
      expect(isValid).toBe(false);
    });
  });

  describe('End-to-End Flow', () => {
    it('should complete a full PKCE flow', async () => {
      // Step 1: Generate code verifier
      const verifier = generateCodeVerifier();
      expect(verifier).toBeDefined();
      expect(verifier.length).toBe(43);

      // Step 2: Generate code challenge
      const challenge = await generateCodeChallenge(verifier);
      expect(challenge).toBeDefined();
      expect(challenge.length).toBeGreaterThan(0);

      // Step 3: Validate the verifier against the challenge
      const isValid = await validateCodeVerifier(verifier, challenge);
      expect(isValid).toBe(true);

      // Step 4: Verify that a different verifier is invalid
      const differentVerifier = generateCodeVerifier();
      const isInvalid = await validateCodeVerifier(differentVerifier, challenge);
      expect(isInvalid).toBe(false);
    });
  });
});