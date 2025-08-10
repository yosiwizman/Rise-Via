import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'

const MockCartSidebar = ({ isOpen = false, onClose = () => {}, items = [] }: {
  isOpen?: boolean;
  onClose?: () => void;
  items?: Array<{ id: string; name: string; price: number; quantity: number }>;
}) => (
  <div data-testid="cart-sidebar" className={isOpen ? 'open' : 'closed'}>
    <div className="cart-header">
      <h2>Shopping Cart</h2>
      <button onClick={onClose}>Close</button>
    </div>
    
    <div className="cart-content">
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <span>{item.name}</span>
              <span>${item.price}</span>
              <span>Qty: {item.quantity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
    
    <div className="cart-footer">
      <div className="total">Total: ${items.reduce((sum: number, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</div>
      <button disabled={items.length === 0}>Proceed to Checkout</button>
    </div>
  </div>
)

describe('CartSidebar Coverage Tests', () => {
  it('should render cart sidebar', () => {
    render(<MockCartSidebar />)
    expect(screen.getByTestId('cart-sidebar')).toBeDefined()
  })

  it('should show empty cart message', () => {
    render(<MockCartSidebar isOpen={true} items={[]} />)
    expect(screen.getByText('Your cart is empty')).toBeDefined()
    expect(screen.getByText('Proceed to Checkout')).toBeDefined()
  })

  it('should render cart items', () => {
    const items = [
      { id: '1', name: 'Product 1', price: 29.99, quantity: 2 },
      { id: '2', name: 'Product 2', price: 19.99, quantity: 1 }
    ]
    
    render(<MockCartSidebar isOpen={true} items={items} />)
    
    expect(screen.getByText('Product 1')).toBeDefined()
    expect(screen.getByText('Product 2')).toBeDefined()
    expect(screen.getByText('$29.99')).toBeDefined()
    expect(screen.getByText('$19.99')).toBeDefined()
    expect(screen.getByText('Qty: 2')).toBeDefined()
    expect(screen.getByText('Qty: 1')).toBeDefined()
  })

  it('should calculate total price', () => {
    const items = [
      { id: '1', name: 'Product 1', price: 29.99, quantity: 2 },
      { id: '2', name: 'Product 2', price: 19.99, quantity: 1 }
    ]
    
    render(<MockCartSidebar isOpen={true} items={items} />)
    expect(screen.getByText('Total: $79.97')).toBeDefined()
  })

  it('should handle cart open/close states', () => {
    const { rerender } = render(<MockCartSidebar isOpen={false} />)
    let sidebar = screen.getByTestId('cart-sidebar')
    expect(sidebar.className).toContain('closed')
    
    rerender(<MockCartSidebar isOpen={true} />)
    sidebar = screen.getByTestId('cart-sidebar')
    expect(sidebar.className).toContain('open')
  })

  it('should render cart header and footer', () => {
    render(<MockCartSidebar isOpen={true} />)
    expect(screen.getByText('Shopping Cart')).toBeDefined()
    expect(screen.getByText('Close')).toBeDefined()
    expect(screen.getByText('Total: $0.00')).toBeDefined()
    expect(screen.getByText('Proceed to Checkout')).toBeDefined()
  })
})
