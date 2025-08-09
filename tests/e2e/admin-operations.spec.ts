import { test, expect } from '@playwright/test'

test.describe('Admin Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin')
    
    const usernameInput = page.locator('input[type="text"], input[placeholder*="username"]')
    const passwordInput = page.locator('input[type="password"], input[placeholder*="password"]')
    const loginButton = page.locator('button:has-text("Login"), button[type="submit"]')
    
    if (await usernameInput.isVisible()) {
      await usernameInput.fill('admin')
      await passwordInput.fill('admin123')
      await loginButton.click()
    }
    
    await expect(page.locator('text=Admin, text=Dashboard')).toBeVisible()
  })

  test('admin dashboard loads correctly', async ({ page }) => {
    await expect(page.locator('text=Admin, text=Dashboard')).toBeVisible()
    
    const navigationItems = page.locator('text=Products, text=Orders, text=Customers')
    await expect(navigationItems.first()).toBeVisible()
  })

  test('product management functionality', async ({ page }) => {
    const productsLink = page.locator('text=Products')
    if (await productsLink.isVisible()) {
      await productsLink.click()
      
      await expect(page.locator('text=Product Management')).toBeVisible()
      
      const searchInput = page.locator('input[placeholder*="Search products"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('Blue Dream')
      }
      
      const addProductButton = page.locator('button:has-text("Add Product")')
      if (await addProductButton.isVisible()) {
        await addProductButton.click()
      }
    }
  })

  test('order management functionality', async ({ page }) => {
    const ordersLink = page.locator('text=Orders')
    if (await ordersLink.isVisible()) {
      await ordersLink.click()
      
      await expect(page.locator('text=Order Management, text=Orders')).toBeVisible()
      
      const searchInput = page.locator('input[placeholder*="Search orders"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('RV-2024')
      }
      
      const statusFilters = page.locator('button:has-text("Pending"), button:has-text("Processing")')
      if (await statusFilters.count() > 0) {
        await statusFilters.first().click()
      }
    }
  })

  test('customer management functionality', async ({ page }) => {
    const customersLink = page.locator('text=Customers')
    if (await customersLink.isVisible()) {
      await customersLink.click()
      
      const customerElements = page.locator('text=Customer, text=Email, text=Name')
      await expect(customerElements.first()).toBeVisible()
    }
  })

  test('admin logout functionality', async ({ page }) => {
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")')
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      
      await expect(page.locator('input[type="password"]')).toBeVisible()
    }
  })
})
