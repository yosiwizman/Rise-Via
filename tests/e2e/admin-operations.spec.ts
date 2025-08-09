import { test, expect } from '@playwright/test';

test.describe('Admin Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('should require admin login', async ({ page }) => {
    await expect(page.getByText('Admin Login')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('should login with admin credentials', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('RiseViA Admin')).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.fill('#username', 'invalid');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('Admin Login')).toBeVisible();
  });

  test('should show customer management tab', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.click('button:has-text("Customers")');
    
    await expect(page.getByText('Customer Management')).toBeVisible();
    await expect(page.locator('[data-testid="customer-list"]')).toBeVisible();
  });

  test('should show order management tab', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.click('button:has-text("Orders")');
    
    await expect(page.getByText('Order Management')).toBeVisible();
    await expect(page.locator('[data-testid="order-list"]')).toBeVisible();
  });

  test('should show activity logs tab', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.click('button:has-text("Activity")');
    
    await expect(page.getByText('Activity Logs')).toBeVisible();
    await expect(page.locator('[data-testid="activity-logs"]')).toBeVisible();
  });

  test('should allow customer search', async ({ page }) => {
    await page.fill('#username', 'admin');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.click('button:has-text("Customers")');
    await page.fill('[data-testid="customer-search"]', 'john@example.com');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should logout admin user', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.click('button:has-text("Logout")');
    
    await expect(page.getByText('Admin Login')).toBeVisible();
  });
});
