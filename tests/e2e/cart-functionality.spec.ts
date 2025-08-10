import { test, expect } from '@playwright/test';

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    const birthYear = new Date().getFullYear() - 25;
    await page.fill('input[name="birthYear"]', birthYear.toString());
    await page.fill('input[name="birthMonth"]', '01');
    await page.fill('input[name="birthDay"]', '01');
    
    await page.click('button[type="submit"]');
    
    await page.selectOption('select', 'CA');
  });

  test('should add products to cart', async ({ page }) => {
    await page.click('a[href="/shop"]');
    
    await page.click('button:has-text("Add to Cart")').first();
    
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  });

  test('should show cart sidebar when cart button clicked', async ({ page }) => {
    await page.click('a[href="/shop"]');
    
    await page.click('button:has-text("Add to Cart")').first();
    await page.click('[data-testid="cart-button"]');
    
    await expect(page.locator('[data-testid="cart-sidebar"]')).toBeVisible();
  });

  test('should update quantity in cart', async ({ page }) => {
    await page.click('a[href="/shop"]');
    
    await page.click('button:has-text("Add to Cart")').first();
    await page.click('[data-testid="cart-button"]');
    
    await page.click('[data-testid="increase-quantity"]');
    
    await expect(page.locator('[data-testid="item-quantity"]')).toContainText('2');
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('2');
  });

  test('should remove items from cart', async ({ page }) => {
    await page.click('a[href="/shop"]');
    
    await page.click('button:has-text("Add to Cart")').first();
    await page.click('[data-testid="cart-button"]');
    
    await page.click('[data-testid="remove-item"]');
    
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('0');
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });

  test('should persist cart across page reloads', async ({ page }) => {
    await page.click('a[href="/shop"]');
    
    await page.click('button:has-text("Add to Cart")').first();
    
    await page.reload();
    
    await expect(page.locator('[data-testid="cart-count"]')).toContainText('1');
  });

  test('should calculate correct totals', async ({ page }) => {
    await page.click('a[href="/shop"]');
    
    await page.click('button:has-text("Add to Cart")').first();
    await page.click('[data-testid="cart-button"]');
    
    const itemPrice = await page.locator('[data-testid="item-price"]').textContent();
    const cartTotal = await page.locator('[data-testid="cart-total"]').textContent();
    
    expect(itemPrice).toBe(cartTotal);
  });
});
