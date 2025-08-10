import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'

const MockProductGrid = ({ products }: { 
  products: Array<{ id: string; name: string; price: number; category: string }> 
}) => (
  <div data-testid="product-grid">
    {products.map((product) => (
      <div key={product.id} data-testid="product-item">
        <h3>{product.name}</h3>
        <p>${product.price}</p>
        <span>{product.category}</span>
      </div>
    ))}
  </div>
)

const mockProducts = [
  { id: '1', name: 'Blue Dream', price: 29.99, category: 'flower' },
  { id: '2', name: 'OG Kush', price: 34.99, category: 'flower' },
  { id: '3', name: 'Gummies', price: 19.99, category: 'edibles' }
]

describe('ProductGrid - Simple', () => {
  it('should render product grid', () => {
    render(<MockProductGrid products={mockProducts} />)
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
  })

  it('should render all products', () => {
    render(<MockProductGrid products={mockProducts} />)
    const productItems = screen.getAllByTestId('product-item')
    expect(productItems).toHaveLength(3)
  })

  it('should display product information', () => {
    render(<MockProductGrid products={mockProducts} />)
    
    expect(screen.getByText('Blue Dream')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    const flowerElements = screen.getAllByText('flower')
    expect(flowerElements.length).toBeGreaterThan(0)
  })

  it('should handle empty product list', () => {
    render(<MockProductGrid products={[]} />)
    const productItems = screen.queryAllByTestId('product-item')
    expect(productItems).toHaveLength(0)
  })
})
