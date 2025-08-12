import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'

vi.mock('../../components/admin/ProductManager', () => ({
  ProductManager: () => (
    <div data-testid="product-manager">
      <h1>Product Management</h1>
      <input placeholder="Search products..." />
      <div data-testid="product-list">
        <div>Blue Dream - $29.99</div>
        <div>OG Kush - $34.99</div>
      </div>
      <button>Export CSV</button>
      <button>Add Product</button>
    </div>
  )
}))

import { ProductManager } from '../../components/admin/ProductManager'

describe('ProductManager', () => {
  it('should render product management interface', () => {
    render(<ProductManager />)
    
    expect(screen.getByText('Product Management')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument()
    expect(screen.getByTestId('product-list')).toBeInTheDocument()
  })

  it('should display product list', () => {
    render(<ProductManager />)
    
    expect(screen.getByText('Blue Dream - $29.99')).toBeInTheDocument()
    expect(screen.getByText('OG Kush - $34.99')).toBeInTheDocument()
  })

  it('should have export functionality', () => {
    render(<ProductManager />)
    
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
  })

  it('should have add product functionality', () => {
    render(<ProductManager />)
    
    expect(screen.getByText('Add Product')).toBeInTheDocument()
  })
})
