import {
  generateCsrfToken,
  createCsrfSignature,
  verifyCsrfToken,
} from '../../../src/middleware/csrf';

describe('CSRF Token Generation', () => {
  it('should generate a token of correct length', () => {
    const token = generateCsrfToken();
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64); // 32 bytes = 64 hex characters
  });

  it('should generate unique tokens', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(token1).not.toBe(token2);
  });

  it('should generate tokens with only hex characters', () => {
    const token = generateCsrfToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('CSRF Signature Creation', () => {
  it('should create a valid signature for a token', () => {
    const token = 'test-token-123';
    const signature = createCsrfSignature(token);
    
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
    expect(signature.length).toBeGreaterThan(0);
  });

  it('should create consistent signatures for the same token', () => {
    const token = 'test-token-456';
    const signature1 = createCsrfSignature(token);
    const signature2 = createCsrfSignature(token);
    
    expect(signature1).toBe(signature2);
  });

  it('should create different signatures for different tokens', () => {
    const token1 = 'test-token-1';
    const token2 = 'test-token-2';
    const signature1 = createCsrfSignature(token1);
    const signature2 = createCsrfSignature(token2);
    
    expect(signature1).not.toBe(signature2);
  });

  it('should handle empty string token', () => {
    const token = '';
    const signature = createCsrfSignature(token);
    
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
  });

  it('should handle special characters in token', () => {
    const token = 'test!@#$%^&*()';
    const signature = createCsrfSignature(token);
    
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
  });
});

describe('CSRF Token Verification', () => {
  interface VerificationTestCase {
    name: string;
    token: string;
    getSignature: (token: string) => string;
    expected: boolean;
  }

  const testCases: VerificationTestCase[] = [
    {
      name: 'should verify valid token and signature',
      token: 'valid-token-123',
      getSignature: (token) => createCsrfSignature(token),
      expected: true,
    },
    {
      name: 'should reject invalid signature',
      token: 'valid-token-123',
      getSignature: () => 'invalid-signature',
      expected: false,
    },
    {
      name: 'should reject empty signature',
      token: 'valid-token-123',
      getSignature: () => '',
      expected: false,
    },
    {
      name: 'should reject signature from different token',
      token: 'token-1',
      getSignature: () => createCsrfSignature('token-2'),
      expected: false,
    },
    {
      name: 'should handle empty token with valid signature',
      token: '',
      getSignature: (token) => createCsrfSignature(token),
      expected: true,
    },
  ];

  testCases.forEach(({ name, token, getSignature, expected }) => {
    it(name, () => {
      const signature = getSignature(token);
      const result = verifyCsrfToken(token, signature);
      expect(result).toBe(expected);
    });
  });

  it('should be case sensitive', () => {
    const token = 'TestToken';
    const signature = createCsrfSignature(token);
    const result = verifyCsrfToken('testtoken', signature);
    expect(result).toBe(false);
  });

  it('should detect modified signatures', () => {
    const token = 'test-token';
    const signature = createCsrfSignature(token);
    const modifiedSignature = signature.slice(0, -1) + 'x';
    const result = verifyCsrfToken(token, modifiedSignature);
    expect(result).toBe(false);
  });
});

describe('CSRF Token Integration', () => {
  it('should complete full token lifecycle', () => {
    // Generate token
    const token = generateCsrfToken();
    expect(token).toBeDefined();

    // Create signature
    const signature = createCsrfSignature(token);
    expect(signature).toBeDefined();

    // Verify token
    const isValid = verifyCsrfToken(token, signature);
    expect(isValid).toBe(true);
  });

  it('should fail verification with tampered token', () => {
    const token = generateCsrfToken();
    const signature = createCsrfSignature(token);
    
    const tamperedToken = token.slice(0, -1) + 'x';
    const isValid = verifyCsrfToken(tamperedToken, signature);
    expect(isValid).toBe(false);
  });

  it('should work with multiple tokens independently', () => {
    const token1 = generateCsrfToken();
    const signature1 = createCsrfSignature(token1);
    
    const token2 = generateCsrfToken();
    const signature2 = createCsrfSignature(token2);

    expect(verifyCsrfToken(token1, signature1)).toBe(true);
    expect(verifyCsrfToken(token2, signature2)).toBe(true);
    expect(verifyCsrfToken(token1, signature2)).toBe(false);
    expect(verifyCsrfToken(token2, signature1)).toBe(false);
  });
});
