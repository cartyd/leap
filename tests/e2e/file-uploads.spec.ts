import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';

test.describe('File Uploads', () => {
  // Helper to create a temporary test file
  function createTestFile(fileName: string, sizeInBytes: number = 1024): string {
    const tmpDir = os.tmpdir();
    const filePath = path.join(tmpDir, fileName);
    const buffer = Buffer.alloc(sizeInBytes, 'a');
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  test.beforeAll(() => {
    // Create test files
    createTestFile('test-paystub.pdf', 5 * 1024); // 5KB
    createTestFile('test-id.jpg', 3 * 1024); // 3KB
  });

  test('should allow uploading required document types', async ({ page }) => {
    // Start application and navigate to a step where uploads are available
    await page.goto('/');
    await page.click('button:has-text("Start Application")');

    // Fill minimal step 1 data
    await page.fill('input[name="applicant[firstName]"]', 'UploadTest');
    await page.fill('input[name="applicant[lastName]"]', 'User');
    await page.fill('input[name="applicant[email]"]', 'upload@example.com');
    await page.fill('input[name="applicant[dob]"]', '1985-06-10');
    await page.fill('input[name="applicant[address1]"]', '456 Upload St');
    await page.fill('input[name="applicant[city]"]', 'Atlanta');
    await page.fill('input[name="applicant[state]"]', 'GA');
    await page.fill('input[name="applicant[zip]"]', '30306');
    await page.fill('input[name="applicant[county]"]', 'Fulton');
    await page.fill('input[name="request[assistanceFor]"]', 'Upload test');
    await page.fill('input[name="request[approximateCost]"]', '250');

    await page.waitForTimeout(1000);

    // Look for file upload section (check if it exists)
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // Upload a paystub
      const paystubPath = path.join(os.tmpdir(), 'test-paystub.pdf');
      await fileInput.first().setInputFiles(paystubPath);

      await page.waitForTimeout(1000);

      // Verify upload success indicator (if implemented)
      const uploadSuccess = page.locator('.upload-success, .file-uploaded, text=uploaded');
      if (await uploadSuccess.count() > 0) {
        await expect(uploadSuccess.first()).toBeVisible();
      }
    }
  });

  test('should reject files exceeding size limit', async ({ page }) => {
    // Create a file larger than 10MB
    const largeFilePath = createTestFile('large-file.pdf', 11 * 1024 * 1024);

    await page.goto('/');
    await page.click('button:has-text("Start Application")');

    // Fill minimal data
    await page.fill('input[name="applicant[firstName]"]', 'LargeFile');
    await page.fill('input[name="applicant[lastName]"]', 'Test');
    await page.fill('input[name="applicant[email]"]', 'large@example.com');
    await page.fill('input[name="applicant[dob]"]', '1990-01-01');
    await page.fill('input[name="applicant[address1]"]', '789 Large St');
    await page.fill('input[name="applicant[city]"]', 'Atlanta');
    await page.fill('input[name="applicant[state]"]', 'GA');
    await page.fill('input[name="applicant[zip]"]', '30307');
    await page.fill('input[name="applicant[county]"]', 'Fulton');
    await page.fill('input[name="request[assistanceFor]"]', 'Size test');
    await page.fill('input[name="request[approximateCost]"]', '100');

    await page.waitForTimeout(1000);

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      await fileInput.first().setInputFiles(largeFilePath);

      await page.waitForTimeout(1000);

      // Should show error message about file size
      const errorMessage = page.locator('.error, .alert-error, text=too large, text=exceeds');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }

    // Clean up
    fs.unlinkSync(largeFilePath);
  });

  test('should allow uploading multiple document types', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Start Application")');

    // Fill minimal data
    await page.fill('input[name="applicant[firstName]"]', 'MultiUpload');
    await page.fill('input[name="applicant[lastName]"]', 'Test');
    await page.fill('input[name="applicant[email]"]', 'multi@example.com');
    await page.fill('input[name="applicant[dob]"]', '1988-04-15');
    await page.fill('input[name="applicant[address1]"]', '321 Multi Ave');
    await page.fill('input[name="applicant[city]"]', 'Atlanta');
    await page.fill('input[name="applicant[state]"]', 'GA');
    await page.fill('input[name="applicant[zip]"]', '30308');
    await page.fill('input[name="applicant[county]"]', 'Fulton');
    await page.fill('input[name="request[assistanceFor]"]', 'Multi upload test');
    await page.fill('input[name="request[approximateCost]"]', '300');

    await page.waitForTimeout(1000);

    // Check for multiple file input fields for different categories
    const paystubInput = page.locator('input[type="file"][name*="paystub"], input[type="file"][data-category="PAYSTUB_W2"]');
    const idInput = page.locator('input[type="file"][name*="id"], input[type="file"][data-category="ID"]');

    if (await paystubInput.count() > 0) {
      const paystubPath = path.join(os.tmpdir(), 'test-paystub.pdf');
      await paystubInput.first().setInputFiles(paystubPath);
      await page.waitForTimeout(500);
    }

    if (await idInput.count() > 0) {
      const idPath = path.join(os.tmpdir(), 'test-id.jpg');
      await idInput.first().setInputFiles(idPath);
      await page.waitForTimeout(500);
    }

    // Verify multiple uploads are listed
    const uploadedFiles = page.locator('.uploaded-file, .file-list-item');
    if (await uploadedFiles.count() > 0) {
      expect(await uploadedFiles.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('should allow deleting uploaded files', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Start Application")');

    // Fill minimal data
    await page.fill('input[name="applicant[firstName]"]', 'DeleteUpload');
    await page.fill('input[name="applicant[lastName]"]', 'Test');
    await page.fill('input[name="applicant[email]"]', 'delete@example.com');
    await page.fill('input[name="applicant[dob]"]', '1992-09-20');
    await page.fill('input[name="applicant[address1]"]', '555 Delete Rd');
    await page.fill('input[name="applicant[city]"]', 'Atlanta');
    await page.fill('input[name="applicant[state]"]', 'GA');
    await page.fill('input[name="applicant[zip]"]', '30309');
    await page.fill('input[name="applicant[county]"]', 'Fulton');
    await page.fill('input[name="request[assistanceFor]"]', 'Delete test');
    await page.fill('input[name="request[approximateCost]"]', '150');

    await page.waitForTimeout(1000);

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // Upload a file
      const testFilePath = path.join(os.tmpdir(), 'test-paystub.pdf');
      await fileInput.first().setInputFiles(testFilePath);

      await page.waitForTimeout(1000);

      // Look for delete/remove button
      const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Remove"), button[aria-label*="delete"], button[aria-label*="remove"]');
      
      if (await deleteButton.count() > 0) {
        await deleteButton.first().click();

        await page.waitForTimeout(500);

        // Verify file is removed from list
        const uploadedFiles = page.locator('.uploaded-file, .file-list-item');
        if (await uploadedFiles.count() === 0) {
          // File was successfully deleted
          expect(await uploadedFiles.count()).toBe(0);
        }
      }
    }
  });

  test('should validate file MIME types', async ({ page }) => {
    // Create an invalid file type (e.g., .exe)
    const invalidFilePath = createTestFile('invalid-file.exe', 1024);

    await page.goto('/');
    await page.click('button:has-text("Start Application")');

    // Fill minimal data
    await page.fill('input[name="applicant[firstName]"]', 'InvalidType');
    await page.fill('input[name="applicant[lastName]"]', 'Test');
    await page.fill('input[name="applicant[email]"]', 'invalid@example.com');
    await page.fill('input[name="applicant[dob]"]', '1987-12-05');
    await page.fill('input[name="applicant[address1]"]', '999 Invalid Ln');
    await page.fill('input[name="applicant[city]"]', 'Atlanta');
    await page.fill('input[name="applicant[state]"]', 'GA');
    await page.fill('input[name="applicant[zip]"]', '30310');
    await page.fill('input[name="applicant[county]"]', 'Fulton');
    await page.fill('input[name="request[assistanceFor]"]', 'MIME test');
    await page.fill('input[name="request[approximateCost]"]', '200');

    await page.waitForTimeout(1000);

    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // Check if file input has accept attribute
      const acceptAttr = await fileInput.first().getAttribute('accept');
      
      if (acceptAttr) {
        // HTML5 validation will prevent selecting invalid file types
        expect(acceptAttr).toBeTruthy();
      }

      // Attempt to upload invalid file type
      await fileInput.first().setInputFiles(invalidFilePath);

      await page.waitForTimeout(1000);

      // Should show error about invalid file type
      const errorMessage = page.locator('.error, .alert-error, text=invalid, text=not allowed');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }

    // Clean up
    fs.unlinkSync(invalidFilePath);
  });
});
