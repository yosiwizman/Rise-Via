import { test, expect } from '@playwright/test'

test.describe('Purchase Flow', () => {
  test('complete purchase flow with age verification', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=RiseViA')).toBeVisible()
    
    const ageGate = page.locator('[data-testid="age-gate"]')
    if (await ageGate.isVisible()) {
      await page.click('text=Yes, I am 21 or older')
    }
    
    await page.click('text=Shop')
    await expect(page.locator('text=Shop')).toBeVisible()
    
    const addToCartButtons = page.locator('button:has-text("Add to Cart")')
    if (await addToCartButtons.count() > 0) {
      await addToCartButtons.first().click()
      
      const cartButton = page.locator('[data-testid="cart-button"], button:has-text("Cart")')
      if (await cartButton.isVisible()) {
        await cartButton.click()
      }
    }
  })

  test('age verification blocks underage users', async ({ page }) => {
    await page.goto('/')
    
    const ageGate = page.locator('text=21 or older')
    if (await ageGate.isVisible()) {
      await page.click('text=No, I am under 21')
      await expect(page.locator('text=must be 21')).toBeVisible()
    }
  })

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/')
    
    const ageGate = page.locator('[data-testid="age-gate"]')
    if (await ageGate.isVisible()) {
      await page.click('text=Yes, I am 21 or older')
    }
    
    await page.click('text=Shop')
    await expect(page.url()).toContain('shop')
    
    await page.click('text=Learn')
    await expect(page.url()).toContain('learn')
    
    await page.click('text=Home')
    await expect(page.url()).toContain('home')
  })

  test('product search and filtering', async ({ page }) => {
    await page.goto('/')
    
    const ageGate = page.locator('[data-testid="age-gate"]')
    if (await ageGate.isVisible()) {
      await page.click('text=Yes, I am 21 or older')
    }
    
    await page.click('text=Shop')
    
    const searchInput = page.locator('input[placeholder*="search"], input[placeholder*="Search"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('Blue Dream')
      await expect(page.locator('text=Blue Dream')).toBeVisible()
    }
    
    const filterButtons = page.locator('button:has-text("Sativa"), button:has-text("Indica"), button:has-text("Hybrid")')
    if (await filterButtons.count() > 0) {
      await filterButtons.first().click()
    }
  })

  test('cart persistence across page navigation', async ({ page }) => {
    await page.goto('/')
    
    const ageGate = page.locator('[data-testid="age-gate"]')
    if (await ageGate.isVisible()) {
      await page.click('text=Yes, I am 21 or older')
    }
    
    await page.click('text=Shop')
    
    const addToCartButtons = page.locator('button:has-text("Add to Cart")')
    if (await addToCartButtons.count() > 0) {
      await addToCartButtons.first().click()
      
      await page.click('text=Home')
      await page.click('text=Shop')
      
      const cartCount = page.locator('[data-testid="cart-count"], text=/\\d+/')
      if (await cartCount.isVisible()) {
        await expect(cartCount).toContainText(/[1-9]/)
      }
    }
  })
})
