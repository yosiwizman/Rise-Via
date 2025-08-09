import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test-utils'
import { CheckoutPage } from '../../pages/CheckoutPage'

const mockNavigate = vi.fn()
const mockProps = {
  onNavigate: mockNavigate,
  isStateBlocked: false
}

vi.mock('../../hooks/useCart', () => ({
  useCart: () => ({
    items: [
      {
        id: '1',
        productId: 'blue-dream',
        name: 'Blue Dream',
        price: 29.99,
        quantity: 2,
        category: 'flower'
      }
    ],
    getCartTotal: () => 59.98,
    getCartCount: () => 2,
    clearCart: vi.fn()
  })
}))

describe('CheckoutPage', () => {
  it('should render checkout form', () => {
    render(<CheckoutPage {...mockProps} />)
    
    expect(screen.getByText(/Secure Checkout/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Shipping Information/i)).toHaveLength(2)
  })

  it('should show state blocked message when blocked', () => {
    const blockedProps = {
      ...mockProps,
      isStateBlocked: true
    }
    
    render(<CheckoutPage {...blockedProps} />)
    
    expect(screen.getByText(/Checkout Not Available/i)).toBeInTheDocument()
    expect(screen.getByText(/cannot process orders/i)).toBeInTheDocument()
    expect(screen.getByText(/Return Home/i)).toBeInTheDocument()
  })

  it('should handle return home when blocked', () => {
    const blockedProps = {
      ...mockProps,
      isStateBlocked: true
    }
    
    render(<CheckoutPage {...blockedProps} />)
    
    const returnButton = screen.getByText(/Return Home/i)
    fireEvent.click(returnButton)
    
    expect(mockProps.onNavigate).toHaveBeenCalledWith('home')
  })

  it('should validate required fields', () => {
    render(<CheckoutPage {...mockProps} />)
    
    const continueButton = screen.getByText(/Continue to Payment/i)
    expect(continueButton).toBeDisabled()
    
    expect(screen.getByText(/complete all required fields/i)).toBeInTheDocument()
  })

  it('should handle form completion', () => {
    render(<CheckoutPage {...mockProps} />)
    
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'John' }
    })
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: 'Doe' }
    })
    fireEvent.change(screen.getByLabelText(/Street Address/i), {
      target: { value: '123 Main St' }
    })
    fireEvent.change(screen.getByLabelText(/City/i), {
      target: { value: 'Denver' }
    })
    fireEvent.change(screen.getByRole('textbox', { name: /state/i }), {
      target: { value: 'CO' }
    })
    fireEvent.change(screen.getByLabelText(/ZIP Code/i), {
      target: { value: '80202' }
    })
    fireEvent.change(screen.getByLabelText(/Phone/i), {
      target: { value: '555-1234' }
    })
    
    fireEvent.click(screen.getByLabelText(/21 years of age/i))
    fireEvent.click(screen.getByLabelText(/signature.*required/i))
    fireEvent.click(screen.getByLabelText(/Terms and Conditions/i))
    
    const continueButton = screen.getByText(/Continue to Payment/i)
    expect(continueButton).not.toBeDisabled()
  })
})
