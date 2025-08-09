import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test-utils'
import { ShopPage } from '../../pages/ShopPage'

describe('ShopPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render shop page', () => {
    render(<ShopPage />)
    
    expect(screen.getByText(/Shop Premium THCA/i)).toBeInTheDocument()
  })

  it('should display product filters', () => {
    render(<ShopPage />)
    
    expect(screen.getByText(/All Products \(\d+\)/)).toBeInTheDocument()
    expect(screen.getByText(/Sativa \(\d+\)/)).toBeInTheDocument()
    expect(screen.getByText(/Indica \(\d+\)/)).toBeInTheDocument()
    expect(screen.getByText(/Hybrid \(\d+\)/)).toBeInTheDocument()
  })

  it('should filter products by strain type', () => {
    render(<ShopPage />)
    
    expect(screen.getByText(/Sativa \(\d+\)/)).toBeInTheDocument()
    expect(screen.getByText(/Blue Dream/i)).toBeInTheDocument()
  })

  it('should display product grid', () => {
    render(<ShopPage />)
    
    const container = screen.getByText(/Shop Premium THCA/i).closest('div')
    expect(container).toBeInTheDocument()
  })

  it('should show product information', () => {
    render(<ShopPage />)
    
    expect(screen.getByText(/Blue Dream/i)).toBeInTheDocument()
    expect(screen.getByText(/Shop Premium THCA/i)).toBeInTheDocument()
  })
})
