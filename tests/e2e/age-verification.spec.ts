import { test, expect } from '@playwright/test';

test.describe('Age Verification', () => {
  test('should show age gate on first visit', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Age Verification Required')).toBeVisible();
    await expect(page.getByText('You must be 21 years or older to access this website')).toBeVisible();
  });

  test('should allow access for users 21+', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Age Verification Required')).toBeVisible();
    await page.click('button:has-text("I am 21 or older")');
    
    await expect(page.getByText('Premium THCA Cannabis Products')).toBeVisible();
  });

  test('should block users under 21', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Age Verification Required')).toBeVisible();
    await page.click('button:has-text("I am under 21")');
    
    await expect(page.getByText('Age Verification Required')).toBeVisible();
  });

  test('should persist age verification across sessions', async ({ page, context }) => {
    await page.goto('/');
    
    await page.click('button:has-text("I am 21 or older")');
    await expect(page.getByText('Premium THCA Cannabis Products')).toBeVisible();
    
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    await expect(newPage.getByText('Premium THCA Cannabis Products')).toBeVisible();
  });
});
