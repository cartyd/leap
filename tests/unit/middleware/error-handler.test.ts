import { maskPII } from '../../../src/middleware/error-handler';

describe('PII Masking Utility', () => {
  interface MaskTestCase {
    name: string;
    input: any;
    expected: any;
  }

  const testCases: MaskTestCase[] = [
    {
      name: 'should mask email field',
      input: {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      },
      expected: {
        name: 'John Doe',
        email: '***REDACTED***',
        age: 30,
      },
    },
    {
      name: 'should mask multiple PII fields',
      input: {
        email: 'test@example.com',
        phoneHome: '404-555-0100',
        phoneCell: '404-555-0101',
        address: '123 Main St',
      },
      expected: {
        email: '***REDACTED***',
        phoneHome: '***REDACTED***',
        phoneCell: '***REDACTED***',
        address: '123 Main St',
      },
    },
    {
      name: 'should mask SSN field',
      input: {
        name: 'Jane Doe',
        ssn: '123-45-6789',
      },
      expected: {
        name: 'Jane Doe',
        ssn: '***REDACTED***',
      },
    },
    {
      name: 'should mask DOB field',
      input: {
        name: 'John Smith',
        dob: '1980-01-01',
      },
      expected: {
        name: 'John Smith',
        dob: '***REDACTED***',
      },
    },
    {
      name: 'should handle object without PII fields',
      input: {
        id: '123',
        status: 'active',
        count: 5,
      },
      expected: {
        id: '123',
        status: 'active',
        count: 5,
      },
    },
    {
      name: 'should handle empty object',
      input: {},
      expected: {},
    },
    {
      name: 'should handle null input',
      input: null,
      expected: null,
    },
    {
      name: 'should handle undefined input',
      input: undefined,
      expected: undefined,
    },
    {
      name: 'should handle string input',
      input: 'test string',
      expected: 'test string',
    },
    {
      name: 'should handle number input',
      input: 123,
      expected: 123,
    },
    {
      name: 'should handle boolean input',
      input: true,
      expected: true,
    },
    {
      name: 'should handle array input',
      input: [1, 2, 3],
      expected: [1, 2, 3],
    },
    {
      name: 'should preserve non-PII nested data',
      input: {
        user: {
          name: 'Test User',
          preferences: {
            theme: 'dark',
          },
        },
      },
      expected: {
        user: {
          name: 'Test User',
          preferences: {
            theme: 'dark',
          },
        },
      },
    },
    {
      name: 'should handle object with only PII fields',
      input: {
        email: 'test@example.com',
        phoneHome: '555-1234',
        phoneCell: '555-5678',
        ssn: '123-45-6789',
        dob: '1990-01-01',
      },
      expected: {
        email: '***REDACTED***',
        phoneHome: '***REDACTED***',
        phoneCell: '***REDACTED***',
        ssn: '***REDACTED***',
        dob: '***REDACTED***',
      },
    },
    {
      name: 'should handle mixed data types with PII',
      input: {
        id: 1,
        email: 'user@example.com',
        active: true,
        phoneCell: '555-9999',
        metadata: null,
      },
      expected: {
        id: 1,
        email: '***REDACTED***',
        active: true,
        phoneCell: '***REDACTED***',
        metadata: null,
      },
    },
  ];

  testCases.forEach(({ name, input, expected }) => {
    it(name, () => {
      const result = maskPII(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Edge Cases', () => {
    it('should not modify original object', () => {
      const original = {
        name: 'Test',
        email: 'test@example.com',
      };
      const originalCopy = { ...original };
      
      maskPII(original);
      
      expect(original).toEqual(originalCopy);
    });

    it('should handle empty string values for PII fields', () => {
      const input = {
        email: '',
        phoneHome: '',
      };
      const result = maskPII(input);
      
      expect(result.email).toBe('***REDACTED***');
      expect(result.phoneHome).toBe('***REDACTED***');
    });

    it('should handle whitespace-only values for PII fields', () => {
      const input = {
        email: '   ',
        phoneCell: '\t\n',
      };
      const result = maskPII(input);
      
      expect(result.email).toBe('***REDACTED***');
      expect(result.phoneCell).toBe('***REDACTED***');
    });

    it('should handle very long email values', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const input = {
        email: longEmail,
      };
      const result = maskPII(input);
      
      expect(result.email).toBe('***REDACTED***');
    });

    it('should handle special characters in PII fields', () => {
      const input = {
        email: 'test+tag@example.com',
        phoneHome: '+1 (404) 555-0100',
      };
      const result = maskPII(input);
      
      expect(result.email).toBe('***REDACTED***');
      expect(result.phoneHome).toBe('***REDACTED***');
    });

    it('should handle case variations of field names', () => {
      const input = {
        Email: 'test@example.com',
        email: 'another@example.com',
        EMAIL: 'caps@example.com',
      };
      const result = maskPII(input);
      
      // Only exact lowercase matches should be masked
      expect(result.email).toBe('***REDACTED***');
      expect(result.Email).toBe('test@example.com');
      expect(result.EMAIL).toBe('caps@example.com');
    });
  });

  describe('Type Safety', () => {
    it('should handle Date objects', () => {
      const date = new Date('2024-01-01');
      const input = {
        createdAt: date,
        email: 'test@example.com',
      };
      const result = maskPII(input);
      
      expect(result.createdAt).toBe(date);
      expect(result.email).toBe('***REDACTED***');
    });

    it('should handle RegExp objects', () => {
      const regex = /test/;
      const input = {
        pattern: regex,
        email: 'test@example.com',
      };
      const result = maskPII(input);
      
      expect(result.pattern).toBe(regex);
      expect(result.email).toBe('***REDACTED***');
    });
  });
});
