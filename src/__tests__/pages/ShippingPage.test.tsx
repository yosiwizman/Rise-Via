import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import { ShippingPage } from '../../pages/ShippingPage'

describe('ShippingPage', () => {
  it('should render shipping page', () => {
    render(<ShippingPage />)
    
    expect(screen.getByText('Shipping Information')).toBeInTheDocument()
  })

  it('should display shipping information', () => {
    render(<ShippingPage />)
    
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should have proper page structure', () => {
    render(<ShippingPage />)
    
    expect(screen.getByText('Fast & Discreet Shipping')).toBeInTheDocument()
    expect(screen.getByText('• Free shipping on orders over $100')).toBeInTheDocument()
  })

  it('should render without errors', () => {
    expect(() => {
      render(<ShippingPage />)
    }).not.toThrow()
  })
})
