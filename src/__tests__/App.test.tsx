import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../test-utils'
import App from '../App'

vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }: { element: React.ReactNode }) => <div data-testid="route">{element}</div>
}))

vi.mock('../pages/HomePage', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}))

vi.mock('../pages/ShopPage', () => ({
  default: () => <div data-testid="shop-page">Shop Page</div>
}))

vi.mock('../pages/CheckoutPage', () => ({
  default: () => <div data-testid="checkout-page">Checkout Page</div>
}))

vi.mock('../pages/AccountPage', () => ({
  default: () => <div data-testid="account-page">Account Page</div>
}))

vi.mock('../pages/AdminPage', () => ({
  default: () => <div data-testid="admin-page">Admin Page</div>
}))

vi.mock('../pages/ShippingPage', () => ({
  default: () => <div data-testid="shipping-page">Shipping Page</div>
}))

vi.mock('../components/Navigation', () => ({
  default: () => <div data-testid="navigation">Navigation</div>
}))

vi.mock('../components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}))

vi.mock('../components/AgeVerification', () => ({
  default: () => <div data-testid="age-verification">Age Verification</div>
}))

vi.mock('../components/cart/CartSidebar', () => ({
  default: () => <div data-testid="cart-sidebar">Cart Sidebar</div>
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    render(<App />)
    
    expect(document.body).toBeInTheDocument()
  })

  it('should show age verification modal', () => {
    render(<App />)
    
    expect(screen.getByText('Age Verification Required')).toBeInTheDocument()
    expect(screen.getByText('I am 21 or older')).toBeInTheDocument()
    expect(screen.getByText('I am under 21')).toBeInTheDocument()
  })

  it('should show state selection modal', () => {
    render(<App />)
    
    expect(screen.getByText('Select Your State')).toBeInTheDocument()
    expect(screen.getByText('Choose your state...')).toBeInTheDocument()
  })

  it('should wrap content in providers', () => {
    render(<App />)
    
    expect(screen.getByTestId('mock-customer-provider')).toBeInTheDocument()
  })
})
