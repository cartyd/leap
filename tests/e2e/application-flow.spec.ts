import { test, expect } from '@playwright/test';

test.describe('Emergency Assistance Fund Application', () => {
  test('complete application flow from start to submission', async ({ page }) => {
    // Start application
    await page.goto('/');
    await expect(page.locator('h2')).toContainText('Welcome to the Emergency Assistance Fund Application');
    await page.click('button:has-text("Start Application")');

    // Step 1: Applicant Information
    await expect(page.locator('h2')).toContainText('Step 1');
    await expect(page.locator('.progress-step.active')).toContainText('1. Applicant Info');

    // Fill guardian name (optional)
    await page.fill('input[name="guardianName"]', 'Jane Guardian');

    // Fill applicant information
    await page.fill('input[name="applicant[firstName]"]', 'John');
    await page.fill('input[name="applicant[middleInitial]"]', 'D');
    await page.fill('input[name="applicant[lastName]"]', 'Doe');
    await page.fill('input[name="applicant[email]"]', 'john.doe@example.com');
    await page.fill('input[name="applicant[dob]"]', '1980-05-15');
    await page.fill('input[name="applicant[address1]"]', '123 Main Street');
    await page.fill('input[name="applicant[city]"]', 'Atlanta');
    await page.fill('input[name="applicant[state]"]', 'GA');
    await page.fill('input[name="applicant[zip]"]', '30301');
    await page.fill('input[name="applicant[county]"]', 'Fulton');
    await page.fill('input[name="applicant[phoneHome]"]', '404-555-1234');
    await page.fill('input[name="applicant[phoneCell]"]', '404-555-5678');

    // Fill request information
    await page.fill('input[name="request[assistanceFor]"]', 'Medical bills and prescription medications');
    await page.fill('input[name="request[approximateCost]"]', '2500.00');

    // Wait for auto-save (optional, but good practice)
    await page.waitForTimeout(1000);

    // Continue to Step 2
    await page.click('button:has-text("Continue to Step 2")');

    // Step 2: Medical Information
    await expect(page.locator('h2')).toContainText('Step 2');

    // Fill medical history
    await page.fill('input[name="medicalHistory[diagnosisYear]"]', '2015');
    await page.check('input[name="medicalHistory[lupusType]"][value="Systemic"]');
    await page.fill('input[name="medicalHistory[physicianName]"]', 'Dr. Sarah Smith');
    await page.fill('input[name="medicalHistory[physicianPhone]"]', '404-555-9999');

    // Fill medical coverage
    await page.check('input[name="medicalCoverage[hasInsurance]"][value="true"]');
    await page.check('input[name="medicalCoverage[coverageType]"][value="Private"]');
    await page.fill('input[name="medicalCoverage[privateInsuranceName]"]', 'Blue Cross Blue Shield');
    await page.check('input[name="medicalCoverage[rxCoverage]"][value="Yes"]');
    await page.fill('input[name="medicalCoverage[copayAmount]"]', '25.50');

    await page.waitForTimeout(1000);
    await page.click('button:has-text("Continue to Step 3")');

    // Step 3: Income & Employment
    await expect(page.locator('h2')).toContainText('Step 3');

    // Income information
    await page.check('input[name="income[appliedDisability]"][value="true"]');
    await page.check('input[name="income[receives][type]"][value="SSDI"]');
    await page.fill('input[name="income[receives][monthlyAmount]"]', '1200');
    // Leave currentlyEmployed and unemployment.receiving unchecked (default state)

    // Employment applicant
    await page.fill('input[name="employmentApplicant[employerName]"]', '');
    await page.check('input[name="employmentApplicant[status]"][value="Unemployed"]');

    // Spouse employment status (optional)
    await page.check('input[name="spouse[status]"][value="Unemployed"]');

    await page.waitForTimeout(1000);
    await page.click('button:has-text("Continue to Step 4")');

    // Step 4: Residency & Resources
    await expect(page.locator('h2')).toContainText('Step 4');

    // Dependents
    await page.fill('input[name="dependents[count]"]', '2');
    await page.fill('input[name="dependents[agesText]"]', '8, 12');

    // Residency
    await page.check('input[name="residencyGA"][value="true"]');

    // Resources contacted
    await page.fill('input[name="resourcesContacted[0][nameOrAgency]"]', 'United Way');
    await page.fill('textarea[name="resourcesContacted[0][outcome]"]', 'Referred to other programs');

    await page.waitForTimeout(1000);
    await page.click('button:has-text("Continue to Step 5")');

    // Step 5: Nature of Request & Vendors
    await expect(page.locator('h2')).toContainText('Step 5');

    // Nature of request
    await page.fill('textarea[name="natureOfRequest"]', 'I am requesting assistance to cover outstanding medical bills from recent hospitalization and ongoing prescription medication costs. I am currently unemployed and receiving disability benefits which are insufficient to cover these expenses.');

    // Vendor 1
    await page.fill('input[name="vendors[0][vendorName]"]', 'Atlanta Medical Center');
    await page.fill('input[name="vendors[0][contactPerson]"]', 'Billing Department');
    await page.fill('input[name="vendors[0][address]"]', '100 Hospital Drive');
    await page.fill('input[name="vendors[0][city]"]', 'Atlanta');
    await page.fill('input[name="vendors[0][state]"]', 'GA');
    await page.fill('input[name="vendors[0][zip]"]', '30303');
    await page.fill('input[name="vendors[0][telephone]"]', '404-555-2000');
    await page.fill('input[name="vendors[0][email]"]', 'billing@atlantamedical.com');
    await page.fill('input[name="vendors[0][totalAmountOwed]"]', '1800.00');
    await page.fill('input[name="vendors[0][amountRequesting]"]', '1800.00');

    // Vendor 2
    await page.fill('input[name="vendors[1][vendorName]"]', 'CVS Pharmacy');
    await page.fill('input[name="vendors[1][totalAmountOwed]"]', '700.00');
    await page.fill('input[name="vendors[1][amountRequesting]"]', '700.00');

    await page.waitForTimeout(1000);
    await page.click('button:has-text("Continue to Step 6")');

    // Step 6: Certification
    await expect(page.locator('h2')).toContainText('Step 6');

    await page.fill('input[name="certification[applicantSignatureTyped]"]', 'John D Doe');
    
    // Get today's date for date signed
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[name="certification[dateSigned]"]', today);

    await page.waitForTimeout(1000);
    await page.click('button:has-text("Review Application")');

    // Review page
    await expect(page.locator('h2')).toContainText('Review');
    
    // Verify some key information is displayed
    await expect(page.locator('body')).toContainText('John D Doe');
    await expect(page.locator('body')).toContainText('john.doe@example.com');
    await expect(page.locator('body')).toContainText('Atlanta Medical Center');

    // Submit the application
    await page.click('button:has-text("Submit Application")');

    // Confirmation page
    await expect(page.locator('h2')).toContainText('Application Submitted');
    await expect(page.locator('body')).toContainText('Thank you');
  });

  test('should validate required fields on step 1', async ({ page }) => {
    // Start application
    await page.goto('/');
    await page.click('button:has-text("Start Application")');

    // Try to continue without filling required fields
    await page.click('button:has-text("Continue to Step 2")');

    // Should stay on step 1 and show validation errors
    await expect(page.locator('h2')).toContainText('Step 1');
    
    // Browser's HTML5 validation should prevent submission
    // We can verify by checking if we're still on the same page
    await expect(page.url()).toContain('/step/1');
  });

  test('should auto-save draft as user fills form', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Start Application")');

    // Fill some fields
    await page.fill('input[name="applicant[firstName]"]', 'Test');
    await page.fill('input[name="applicant[lastName]"]', 'User');

    // Wait for auto-save to trigger (500ms delay)
    await page.waitForTimeout(1000);

    // Check for auto-save indicator (if visible in UI)
    const autosaveIndicator = page.locator('#autosave-indicator');
    await expect(autosaveIndicator).toBeVisible();
  });

  test('should handle private insurance requirement', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Start Application")');

    // Fill minimal step 1
    await page.fill('input[name="applicant[firstName]"]', 'John');
    await page.fill('input[name="applicant[lastName]"]', 'Doe');
    await page.fill('input[name="applicant[email]"]', 'john@example.com');
    await page.fill('input[name="applicant[dob]"]', '1980-01-01');
    await page.fill('input[name="applicant[address1]"]', '123 Main St');
    await page.fill('input[name="applicant[city]"]', 'Atlanta');
    await page.fill('input[name="applicant[state]"]', 'GA');
    await page.fill('input[name="applicant[zip]"]', '30301');
    await page.fill('input[name="applicant[county]"]', 'Fulton');
    await page.fill('input[name="request[assistanceFor]"]', 'Medical');
    await page.fill('input[name="request[approximateCost]"]', '1000');

    await page.click('button:has-text("Continue to Step 2")');

    // Select private insurance without providing name
    await page.check('input[name="medicalCoverage[hasInsurance]"][value="true"]');
    await page.check('input[name="medicalCoverage[coverageType]"][value="Private"]');
    await page.check('input[name="medicalCoverage[rxCoverage]"][value="Yes"]');

    // Try to continue - validation should fail at submission time
    await page.click('button:has-text("Continue to Step 3")');

    // Should show validation error (if inline validation is implemented)
    // Or stay on the same page
    await expect(page.url()).toContain('/step/2');
  });

  test('should navigate back and preserve data', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Start Application")');

    // Fill step 1
    const firstName = 'PreserveTest';
    await page.fill('input[name="applicant[firstName]"]', firstName);
    await page.fill('input[name="applicant[lastName]"]', 'User');
    await page.fill('input[name="applicant[email]"]', 'preserve@example.com');
    await page.fill('input[name="applicant[dob]"]', '1990-01-01');
    await page.fill('input[name="applicant[address1]"]', '456 Test Ave');
    await page.fill('input[name="applicant[city]"]', 'Atlanta');
    await page.fill('input[name="applicant[state]"]', 'GA');
    await page.fill('input[name="applicant[zip]"]', '30302');
    await page.fill('input[name="applicant[county]"]', 'DeKalb');
    await page.fill('input[name="request[assistanceFor]"]', 'Test request');
    await page.fill('input[name="request[approximateCost]"]', '500');

    await page.waitForTimeout(1000);
    await page.click('button:has-text("Continue to Step 2")');

    // Navigate back
    await page.goBack();

    // Verify data is preserved
    const firstNameValue = await page.inputValue('input[name="applicant[firstName]"]');
    expect(firstNameValue).toBe(firstName);
  });
});
