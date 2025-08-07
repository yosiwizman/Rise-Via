import { test, expect } from '@playwright/test';

test.describe('RiseViA Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    const ageGateButton = page.locator('button:has-text("I am 21 or older")');
    if (await ageGateButton.isVisible()) {
      await ageGateButton.click();
    }
    
    const stateSelect = page.locator('select');
    if (await stateSelect.isVisible()) {
      await stateSelect.selectOption('CA');
      await page.locator('button:has-text("Continue")').click();
    }
  });

  test('should load homepage and display hero content', async ({ page }) => {
    await expect(page.locator('h1:has-text("RiseViA")')).toBeVisible();
    await expect(page.locator('text=Premium THCA Cannabis Products')).toBeVisible();
    
    const video = page.locator('video');
    await expect(video).toBeVisible();
  });

  test('should navigate to shop page and display products', async ({ page }) => {
    await page.locator('a:has-text("Shop")').click();
    await expect(page.locator('h1:has-text("Premium Cannabis Products")')).toBeVisible();
    
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
    
    await page.locator('button:has-text("Sativa")').click();
    await expect(page.locator('text=Sativa products')).toBeVisible();
  });

  test('should add product to cart and verify cart functionality', async ({ page }) => {
    await page.locator('a:has-text("Shop")').click();
    
    const addToCartButton = page.locator('button:has-text("Add to Cart")').first();
    await addToCartButton.click();
    
    const cartBadge = page.locator('[data-testid="cart-count"]');
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText('1');
    
    await page.locator('[data-testid="cart-button"]').click();
    
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    
    await page.locator('[data-testid="increase-quantity"]').first().click();
    await expect(cartBadge).toHaveText('2');
    
    await page.locator('[data-testid="remove-item"]').first().click();
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should persist cart across page refreshes', async ({ page }) => {
    await page.locator('a:has-text("Shop")').click();
    
    await page.locator('button:has-text("Add to Cart")').first().click();
    
    const cartBadge = page.locator('[data-testid="cart-count"]');
    await expect(cartBadge).toHaveText('1');
    
    await page.reload();
    
    const ageGateButton = page.locator('button:has-text("I am 21 or older")');
    if (await ageGateButton.isVisible()) {
      await ageGateButton.click();
    }
    
    const stateSelect = page.locator('select');
    if (await stateSelect.isVisible()) {
      await stateSelect.selectOption('CA');
      await page.locator('button:has-text("Continue")').click();
    }
    
    await expect(cartBadge).toHaveText('1');
  });

  test('should open product detail modal and add to cart', async ({ page }) => {
    await page.locator('a:has-text("Shop")').click();
    
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.click();
    
    await expect(page.locator('[data-testid="product-modal"]')).toBeVisible();
    
    await page.locator('button:has-text("Add to Cart")').click();
    
    const cartBadge = page.locator('[data-testid="cart-count"]');
    await expect(cartBadge).toHaveText('1');
    
    await page.locator('[data-testid="close-modal"]').click();
    await expect(page.locator('[data-testid="product-modal"]')).not.toBeVisible();
  });

  test('should handle wishlist functionality', async ({ page }) => {
    await page.locator('a:has-text("Shop")').click();
    
    const wishlistButton = page.locator('[data-testid="wishlist-button"]').first();
    await wishlistButton.click();
    
    await page.locator('a:has-text("Wishlist")').click();
    await expect(page.locator('h1:has-text("Your Wishlist")')).toBeVisible();
    
    await expect(page.locator('[data-testid="wishlist-item"]')).toBeVisible();
  });

  test('should test admin login functionality', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page.locator('h1:has-text("Admin Login")')).toBeVisible();
    
    await page.locator('input[type="text"]').fill('admin');
    await page.locator('input[type="password"]').fill('admin123');
    
    await page.locator('button:has-text("Login")').click();
    
    await expect(page.locator('h1:has-text("RiseViA Admin")')).toBeVisible();
    await expect(page.locator('text=Total Products')).toBeVisible();
  });

  test('should test responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(mobileMenuButton).toBeVisible();
    
    await mobileMenuButton.click();
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    await page.locator('a:has-text("Shop")').click();
    await page.locator('button:has-text("Add to Cart")').first().click();
    
    const cartButton = page.locator('[data-testid="cart-button"]');
    await cartButton.click();
    
    await expect(page.locator('text=Shopping Cart')).toBeVisible();
  });

  test('should test PWA installation prompt', async ({ page }) => {
    const response = await page.goto('/manifest.json');
    expect(response?.status()).toBe(200);
    
    const manifest = await response?.json();
    expect(manifest.name).toBe('RiseViA - Premium THCA Cannabis');
    expect(manifest.short_name).toBe('RiseViA');
    expect(manifest.display).toBe('standalone');
  });
});
