import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'
import { CartSidebar } from '../../../components/cart/CartSidebar'

const mockCartItems = [
  {
    id: '1',
    productId: 'blue-dream',
    name: 'Blue Dream',
    price: 29.99,
    quantity: 2,
    category: 'flower'
  }
]

const mockProps = {
  isOpen: true,
  onClose: vi.fn(),
  items: mockCartItems,
  onUpdateQuantity: vi.fn(),
  onRemoveItem: vi.fn(),
  total: 59.98
}

describe('CartSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render cart sidebar when open', () => {
    render(<CartSidebar {...mockProps} />)
    
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
    expect(screen.getByText(/cart is empty/i)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<CartSidebar {...mockProps} isOpen={false} />)
    
    expect(screen.queryByText('Shopping Cart')).not.toBeInTheDocument()
  })

  it('should display cart items', () => {
    render(<CartSidebar {...mockProps} />)
    
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
  })

  it('should show cart total', () => {
    render(<CartSidebar {...mockProps} />)
    
    expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
  })

  it('should handle close button click', () => {
    render(<CartSidebar {...mockProps} />)
    
    const closeButton = screen.getByText('Close')
    fireEvent.click(closeButton)
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('should handle quantity updates', () => {
    render(<CartSidebar {...mockProps} />)
    
    expect(mockProps.onUpdateQuantity).toBeDefined()
    expect(typeof mockProps.onUpdateQuantity).toBe('function')
  })

  it('should handle item removal', () => {
    render(<CartSidebar {...mockProps} />)
    
    expect(mockProps.onRemoveItem).toBeDefined()
    expect(typeof mockProps.onRemoveItem).toBe('function')
  })

  it('should show empty cart message when no items', () => {
    const emptyProps = { ...mockProps, items: [] }
    render(<CartSidebar {...emptyProps} />)
    
    expect(screen.getByText(/cart is empty/i)).toBeInTheDocument()
  })
})
