# End-to-End Tests

This directory contains Playwright-based end-to-end tests for the Emergency Assistance Fund application.

## Running Tests

### Prerequisites
- Ensure the database is set up: `npm run db:migrate`
- Make sure all dependencies are installed: `npm install`

### Test Commands

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test application-flow.spec.ts

# Run tests matching a pattern
npx playwright test --grep "complete application flow"
```

## Test Structure

### application-flow.spec.ts
Tests the main user journey through the application:
- **Complete application flow**: Full 6-step form submission process
- **Validation**: Required field validation on each step
- **Auto-save**: Draft saving functionality
- **Conditional validation**: Private insurance requirements
- **Data persistence**: Navigation back/forward preserves data

### admin-panel.spec.ts
Tests administrative functionality:
- **Authentication**: Basic auth protection
- **Application listing**: View all applications
- **Application details**: View individual application data
- **Application reset**: Reset submitted applications to draft
- **Filtering**: Filter applications by status (if implemented)
- **Search**: Search applications by name (if implemented)

## Test Configuration

The test configuration is defined in `playwright.config.ts` at the project root:
- **Base URL**: http://localhost:3000
- **Auto-start server**: Runs `npm run dev` before tests
- **Browser**: Chromium only (can be extended to Firefox/Safari)
- **Reporters**: HTML report generated in `playwright-report/`

## Writing New Tests

When adding new tests:
1. Follow the table-driven test pattern for multiple scenarios
2. Use meaningful test names describing the behavior
3. Add proper waits for HTMX responses (auto-save, partials)
4. Clean up test data if necessary (consider using test-specific data)
5. Keep tests focused on user behavior, not implementation details

### Example Test Structure

```typescript
test('should handle specific scenario', async ({ page }) => {
  // Navigate to page
  await page.goto('/');
  
  // Perform actions
  await page.fill('input[name="field"]', 'value');
  await page.click('button:has-text("Submit")');
  
  // Assert outcomes
  await expect(page.locator('h2')).toContainText('Success');
});
```

## Debugging Tests

### Using Playwright Inspector
```bash
npm run test:e2e:debug
```

### Using UI Mode (Recommended)
```bash
npm run test:e2e:ui
```
- Step through tests
- View DOM snapshots
- See network requests
- Time-travel debugging

### View Test Report
After running tests, view the HTML report:
```bash
npx playwright show-report
```

## CI/CD Integration

In CI environments:
- Tests run in headless mode
- Retry failed tests 2 times
- Single worker (no parallelization)
- Environment detection via `process.env.CI`

## Known Considerations

1. **HTMX Delays**: Tests include `waitForTimeout()` to account for HTMX auto-save delays (500ms)
2. **CSRF Tokens**: Handled automatically by form submissions
3. **File Uploads**: Not currently tested (requires multipart form handling)
4. **Database State**: Tests use the same database - consider using unique data per test
5. **Admin Auth**: Uses default credentials (`admin:changeme`) - update if changed

## Troubleshooting

### Test Timeouts
- Increase timeout in test: `test.setTimeout(60000)`
- Check if dev server is starting properly
- Verify database migrations are applied

### Element Not Found
- Add explicit waits: `await page.waitForSelector('selector')`
- Use more specific selectors
- Check if HTMX is replacing elements

### Flaky Tests
- Add proper waits instead of fixed timeouts
- Use `waitForLoadState('networkidle')` for page loads
- Ensure test data doesn't conflict between tests
