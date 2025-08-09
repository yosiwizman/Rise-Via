import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    const birthYear = new Date().getFullYear() - 25;
    await page.fill('input[name="birthYear"]', birthYear.toString());
    await page.fill('input[name="birthMonth"]', '01');
    await page.fill('input[name="birthDay"]', '01');
    
    await page.click('button[type="submit"]');
    
    await page.selectOption('select', 'CA');
    
    await page.click('a[href="/shop"]');
  });

  test('should search products by name', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'Purple');
    
    await expect(page.locator('[data-testid="product-card"]')).toBeVisible();
    await expect(page.getByText('Purple')).toBeVisible();
  });

  test('should filter by strain type', async ({ page }) => {
    await page.selectOption('[data-testid="strain-filter"]', 'indica');
    
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();
    
    const strainTypes = await products.locator('[data-testid="strain-type"]').allTextContents();
    strainTypes.forEach(type => {
      expect(type.toLowerCase()).toContain('indica');
    });
  });

  test('should filter by price range', async ({ page }) => {
    await page.fill('[data-testid="min-price"]', '20');
    await page.fill('[data-testid="max-price"]', '50');
    
    const products = page.locator('[data-testid="product-card"]');
    await expect(products.first()).toBeVisible();
    
    const prices = await products.locator('[data-testid="product-price"]').allTextContents();
    prices.forEach(priceText => {
      const price = parseFloat(priceText.replace('$', ''));
      expect(price).toBeGreaterThanOrEqual(20);
      expect(price).toBeLessThanOrEqual(50);
    });
  });

  test('should sort products by price', async ({ page }) => {
    await page.selectOption('[data-testid="sort-select"]', 'price-low');
    
    const prices = await page.locator('[data-testid="product-price"]').allTextContents();
    const numericPrices = prices.map(p => parseFloat(p.replace('$', '')));
    
    for (let i = 1; i < numericPrices.length; i++) {
      expect(numericPrices[i]).toBeGreaterThanOrEqual(numericPrices[i - 1]);
    }
  });

  test('should show no results message for invalid search', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'nonexistentproduct123');
    
    await expect(page.getByText('No products found')).toBeVisible();
  });

  test('should clear search filters', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'Purple');
    await page.selectOption('[data-testid="strain-filter"]', 'indica');
    
    await page.click('[data-testid="clear-filters"]');
    
    await expect(page.locator('[data-testid="search-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="strain-filter"]')).toHaveValue('');
  });
});
