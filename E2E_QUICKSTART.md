# E2E Testing Quick Start

## 🚀 Quick Commands

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with visual UI (best for debugging)
npm run test:e2e:ui

# Run with visible browser
npm run test:e2e:headed

# Run specific test file
npx playwright test application-flow.spec.ts

# Run tests matching a name pattern
npx playwright test --grep "complete application flow"
```

## 📋 Test Coverage

### ✅ Application Flow (`application-flow.spec.ts`)
- Complete 6-step form submission
- Required field validation
- Auto-save functionality
- Conditional validation (e.g., private insurance)
- Data persistence across navigation

### 🔐 Admin Panel (`admin-panel.spec.ts`)
- Authentication protection
- Application listing
- View application details
- Reset submitted applications
- Search and filtering (if implemented)

### 📎 File Uploads (`file-uploads.spec.ts`)
- Upload different document types
- File size limit validation (10MB)
- MIME type validation
- Multiple file uploads
- Delete uploaded files

## 🛠 First Time Setup

1. Install Playwright:
   ```bash
   npm install
   ```

2. Install browsers (if not already done):
   ```bash
   npx playwright install chromium
   ```

3. Run the database migrations:
   ```bash
   npm run db:migrate
   ```

4. Run your first test:
   ```bash
   npm run test:e2e:ui
   ```

## 📊 Viewing Results

### HTML Report
After tests run, view the report:
```bash
npx playwright show-report
```

### Test Results Location
- Test artifacts: `test-results/`
- HTML report: `playwright-report/`
- Screenshots/videos of failures (if configured)

## 🐛 Debugging Tips

### Use UI Mode (Recommended)
```bash
npm run test:e2e:ui
```
- Time-travel through test execution
- See DOM snapshots at each step
- View network requests
- Inspect locators

### Use Debug Mode
```bash
npm run test:e2e:debug
```
- Playwright Inspector opens
- Step through tests line by line
- Inspect elements interactively

### Add Breakpoints in Code
```typescript
await page.pause(); // Pauses execution
```

## 📝 Common Issues

### "Timeout 30000ms exceeded"
**Solution**: Increase timeout or add explicit waits
```typescript
test.setTimeout(60000); // Increase test timeout
await page.waitForSelector('.my-element'); // Wait for specific element
```

### "Element not found"
**Solution**: Use more specific selectors or add waits
```typescript
// Instead of
await page.click('button');

// Try
await page.click('button:has-text("Submit")');
// Or
await page.waitForSelector('button.submit-btn');
await page.click('button.submit-btn');
```

### "Test is flaky"
**Solution**: Replace `waitForTimeout` with proper waits
```typescript
// Bad
await page.waitForTimeout(2000);

// Good
await page.waitForLoadState('networkidle');
await page.waitForSelector('.success-message');
```

## 🔄 CI/CD Usage

Tests are configured for CI environments:
- Automatically detects CI via `process.env.CI`
- Runs in headless mode
- Retries failed tests 2 times
- Single worker to avoid race conditions

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Locator Guide](https://playwright.dev/docs/locators)
- [Project README](tests/e2e/README.md) - Detailed documentation

## 💡 Pro Tips

1. **Always use UI mode for development**: `npm run test:e2e:ui`
2. **Write tests from user perspective**: Focus on what users do, not implementation
3. **Use data-testid attributes**: Add `data-testid` to important elements for stable selectors
4. **Keep tests independent**: Each test should work in isolation
5. **Use fixtures for common setup**: Reduce code duplication with Playwright fixtures
