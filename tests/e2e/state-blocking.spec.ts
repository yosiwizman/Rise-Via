import { test, expect } from '@playwright/test';

test.describe('State Blocking', () => {
  test('should show state selector for new users', async ({ page }) => {
    await page.goto('/');
    
    const birthYear = new Date().getFullYear() - 25;
    await page.fill('input[name="birthYear"]', birthYear.toString());
    await page.fill('input[name="birthMonth"]', '01');
    await page.fill('input[name="birthDay"]', '01');
    
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('Select Your State')).toBeVisible();
  });

  test('should allow access for permitted states', async ({ page }) => {
    await page.goto('/');
    
    const birthYear = new Date().getFullYear() - 25;
    await page.fill('input[name="birthYear"]', birthYear.toString());
    await page.fill('input[name="birthMonth"]', '01');
    await page.fill('input[name="birthDay"]', '01');
    
    await page.click('button[type="submit"]');
    
    await page.selectOption('select', 'CA');
    
    await expect(page.getByText('Premium THCA Cannabis Products')).toBeVisible();
  });

  test('should block restricted states', async ({ page }) => {
    await page.goto('/');
    
    const birthYear = new Date().getFullYear() - 25;
    await page.fill('input[name="birthYear"]', birthYear.toString());
    await page.fill('input[name="birthMonth"]', '01');
    await page.fill('input[name="birthDay"]', '01');
    
    await page.click('button[type="submit"]');
    
    await page.selectOption('select', 'ID');
    
    await expect(page.getByText('We cannot ship THCA products to ID')).toBeVisible();
    await expect(page.getByText('Continue Browsing')).toBeVisible();
  });

  test('should allow browsing educational content in blocked states', async ({ page }) => {
    await page.goto('/');
    
    const birthYear = new Date().getFullYear() - 25;
    await page.fill('input[name="birthYear"]', birthYear.toString());
    await page.fill('input[name="birthMonth"]', '01');
    await page.fill('input[name="birthDay"]', '01');
    
    await page.click('button[type="submit"]');
    
    await page.selectOption('select', 'ID');
    await page.click('button:has-text("Continue Browsing")');
    
    await page.click('a[href="/learn"]');
    await expect(page.getByText('Understanding THCA')).toBeVisible();
  });
});
