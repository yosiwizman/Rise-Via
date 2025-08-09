import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test-utils'
import { ShopPage } from '../../pages/ShopPage'

describe('ShopPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render shop page', () => {
    render(<ShopPage />)
    
    expect(screen.getByText(/Shop Cannabis/i)).toBeInTheDocument()
  })

  it('should display product filters', () => {
    render(<ShopPage />)
    
    expect(screen.getByText('All Products')).toBeInTheDocument()
    expect(screen.getByText('Sativa')).toBeInTheDocument()
    expect(screen.getByText('Indica')).toBeInTheDocument()
    expect(screen.getByText('Hybrid')).toBeInTheDocument()
  })

  it('should filter products by strain type', () => {
    render(<ShopPage />)
    
    const sativaFilter = screen.getByText('Sativa')
    fireEvent.click(sativaFilter)
    
    expect(screen.getByText(/Green Crack/i)).toBeInTheDocument()
  })

  it('should display product grid', () => {
    render(<ShopPage />)
    
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
  })

  it('should show product information', () => {
    render(<ShopPage />)
    
    expect(screen.getByText(/Blue Dream/i)).toBeInTheDocument()
    expect(screen.getByText(/\$29\.99/)).toBeInTheDocument()
  })
})
