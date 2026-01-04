# Test Suite Documentation

This directory contains the test suite for the Emergency Assistance Fund Application.

## Structure

```
tests/
├── unit/                    # Unit tests for individual functions and modules
│   ├── schemas/            # Validation schema tests
│   └── middleware/         # Middleware function tests
├── integration/            # Integration tests (to be implemented)
└── e2e/                    # End-to-end tests (to be implemented)
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run with coverage
```bash
npm test -- --coverage
```

### Run specific test file
```bash
npm test tests/unit/schemas/application.schema.test.ts
```

### Run specific test suite
```bash
npm test -- --testNamePattern="Applicant Schema Validation"
```

## Unit Tests

### Validation Schema Tests (`tests/unit/schemas/application.schema.test.ts`)

Comprehensive data-driven tests for Zod validation schemas covering:

- **Applicant Schema**: 8 test cases including valid/invalid data, edge cases
  - Valid complete data
  - Valid without optional fields
  - Missing required fields
  - Invalid formats (email, ZIP)
  - Valid ZIP+4 format
  - Empty strings for optional fields

- **Medical Coverage Schema**: 8 test cases for conditional validation
  - Valid scenarios for each coverage type
  - Private insurance requiring name
  - Copay requiring amount
  - Negative amount validation

- **Income Schema**: 9 test cases for complex conditional logic
  - SSDI/SSI with monthly amounts
  - Unemployment with amounts
  - Combined benefits
  - Missing required conditional fields

- **Submit Application Schema**: 7 test cases for final submission
  - Complete valid application
  - Missing vendor information
  - Missing certification
  - Invalid residency

### CSRF Middleware Tests (`tests/unit/middleware/csrf.test.ts`)

Tests for CSRF protection covering:

- **Token Generation**: 3 test cases
  - Correct length (64 hex characters)
  - Uniqueness
  - Format validation

- **Signature Creation**: 5 test cases
  - Consistent signatures
  - Different signatures for different tokens
  - Edge cases (empty strings, special characters)

- **Token Verification**: 7 test cases
  - Valid token/signature pairs
  - Invalid signatures
  - Case sensitivity
  - Modified signature detection

- **Integration**: 3 test cases
  - Full lifecycle
  - Tampered token detection
  - Multiple token independence

### Error Handler Tests (`tests/unit/middleware/error-handler.test.ts`)

Tests for PII masking utility covering:

- **Basic Masking**: 15 test cases
  - Single and multiple PII fields
  - Non-PII field preservation
  - Various input types (null, undefined, primitives, arrays)
  - Nested objects

- **Edge Cases**: 6 test cases
  - Original object immutability
  - Empty and whitespace values
  - Long values
  - Special characters
  - Case sensitivity

- **Type Safety**: 2 test cases
  - Date objects
  - RegExp objects

## Test Principles

All tests follow these principles:

1. **Data-Driven**: Tests use arrays of test cases with clear inputs and expected outputs
2. **Explicit Types**: All test cases use TypeScript interfaces for type safety
3. **Descriptive Names**: Test names clearly describe what is being tested
4. **Edge Cases**: Tests cover boundary conditions and error scenarios
5. **Public Behavior**: Tests focus on public API, not internal implementation
6. **No Performance Tests**: Unit tests focus on correctness, not performance

## Coverage Goals

Target coverage metrics:
- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%

## Adding New Tests

When adding new tests:

1. Place in appropriate directory (unit/integration/e2e)
2. Use descriptive file names matching source files
3. Follow existing patterns for data-driven tests
4. Include edge cases and error scenarios
5. Add type definitions for test cases
6. Group related tests using `describe` blocks

### Example Test Structure

```typescript
describe('Feature Name', () => {
  interface TestCase {
    name: string;
    input: InputType;
    expected: OutputType;
    shouldPass?: boolean;
  }

  const testCases: TestCase[] = [
    {
      name: 'descriptive test name',
      input: { /* test data */ },
      expected: { /* expected result */ },
    },
    // More test cases...
  ];

  testCases.forEach(({ name, input, expected }) => {
    it(name, () => {
      const result = functionUnderTest(input);
      expect(result).toEqual(expected);
    });
  });

  describe('Edge Cases', () => {
    // Additional edge case tests
  });
});
```

## Future Test Plans

### Integration Tests (Not Yet Implemented)
- API endpoint tests with test database
- Multi-step form flow
- File upload/download
- CSRF protection integration
- Session management

### E2E Tests (Not Yet Implemented)
- Complete user workflows
- Browser automation with Playwright
- Form submission end-to-end
- Admin panel operations
- Error handling scenarios

## Continuous Integration

Tests should be run in CI/CD pipeline:
- On every commit
- Before merging pull requests
- Before deployment to production

## Troubleshooting

### Common Issues

**Tests failing with module resolution errors:**
```bash
npm run db:generate
```

**TypeScript compilation errors:**
```bash
npm run build
```

**Database connection errors:**
- Ensure `.env` file exists
- Check `DATABASE_URL` configuration
- Run migrations: `npm run db:migrate`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
