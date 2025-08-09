import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test-utils'
import { Navigation } from '../../components/Navigation'

describe('Navigation', () => {
  const mockProps = {
    currentPage: '/',
    onNavigate: vi.fn(),
    onSearch: vi.fn(),
    onUserClick: vi.fn(),
    onCartClick: vi.fn(),
    onDarkModeToggle: vi.fn(),
    isDarkMode: false,
    cartCount: 0,
    isSearchOpen: false,
    isUserMenuOpen: false,
    userMenuOpen: false,
    setUserMenuOpen: vi.fn(),
    setSearchOpen: vi.fn(),
    isCartOpen: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render navigation menu', () => {
    render(<Navigation {...mockProps} />)
    
    expect(screen.getByText('RiseViA')).toBeInTheDocument()
    expect(screen.getByText('Shop')).toBeInTheDocument()
    expect(screen.getByText('Learn')).toBeInTheDocument()
  })

  it('should handle navigation clicks', () => {
    render(<Navigation {...mockProps} />)
    
    const shopLink = screen.getByText('Shop')
    fireEvent.click(shopLink)
    
    expect(mockProps.onNavigate).toHaveBeenCalledWith('/shop')
  })

  it('should display cart count', () => {
    const propsWithCart = { ...mockProps, cartCount: 3 }
    render(<Navigation {...propsWithCart} />)
    
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should toggle dark mode', () => {
    render(<Navigation {...mockProps} />)
    
    const darkModeButton = screen.getByRole('button', { name: /dark mode/i })
    fireEvent.click(darkModeButton)
    
    expect(mockProps.onDarkModeToggle).toHaveBeenCalled()
  })

  it('should handle search functionality', () => {
    render(<Navigation {...mockProps} />)
    
    const searchButton = screen.getByRole('button', { name: /search/i })
    fireEvent.click(searchButton)
    
    expect(mockProps.onSearch).toHaveBeenCalled()
  })
})
