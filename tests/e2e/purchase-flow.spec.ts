import { test, expect } from '@playwright/test';

test.describe('Complete Purchase Flow', () => {
  test('should complete full purchase journey', async ({ page }) => {
    await page.goto('/');
    
    const birthYear = new Date().getFullYear() - 25;
    await page.fill('input[name="birthYear"]', birthYear.toString());
    await page.fill('input[name="birthMonth"]', '01');
    await page.fill('input[name="birthDay"]', '01');
    
    await page.click('button[type="submit"]');
    
    await page.selectOption('select', 'CA');
    
    await page.click('a[href="/shop"]');
    
    await page.click('button:has-text("Add to Cart")').first();
    
    await page.click('[data-testid="cart-button"]');
    
    await page.click('button:has-text("Checkout")');
    
    await expect(page.getByText('Checkout')).toBeVisible();
    
    await page.fill('input[name="email"]', 'customer@example.com');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="address"]', '123 Main St');
    await page.fill('input[name="city"]', 'Los Angeles');
    await page.selectOption('select[name="state"]', 'CA');
    await page.fill('input[name="zipCode"]', '90210');
    await page.fill('input[name="phone"]', '555-1234');
    
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('Payment')).toBeVisible();
  });

  test('should validate required checkout fields', async ({ page }) => {
    await page.goto('/');
    
    const birthYear = new Date().getFullYear() - 25;
    await page.fill('input[name="birthYear"]', birthYear.toString());
    await page.fill('input[name="birthMonth"]', '01');
    await page.fill('input[name="birthDay"]', '01');
    
    await page.click('button[type="submit"]');
    
    await page.selectOption('select', 'CA');
    
    await page.click('a[href="/shop"]');
    
    await page.click('button:has-text("Add to Cart")').first();
    
    await page.click('[data-testid="cart-button"]');
    
    await page.click('button:has-text("Checkout")');
    
    await page.click('button[type="submit"]');
    
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('First name is required')).toBeVisible();
  });

  test('should block checkout for restricted states', async ({ page }) => {
    await page.goto('/');
    
    const birthYear = new Date().getFullYear() - 25;
    await page.fill('input[name="birthYear"]', birthYear.toString());
    await page.fill('input[name="birthMonth"]', '01');
    await page.fill('input[name="birthDay"]', '01');
    
    await page.click('button[type="submit"]');
    
    await page.selectOption('select', 'ID');
    
    await page.click('button:has-text("Continue Browsing")');
    
    await page.click('a[href="/shop"]');
    
    await expect(page.getByText('Add to Cart')).not.toBeVisible();
    await expect(page.getByText('Not available in your state')).toBeVisible();
  });
});
