import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test-utils'
import { HomePage } from '../pages/HomePage'
import { ShopPage } from '../pages/ShopPage'
import { AdminPage } from '../pages/AdminPage'

vi.mock('../utils/imageOptimization', () => ({
  ImageOptimizer: {
    getOptimizedImageSources: vi.fn(() => ({ webp: [], fallback: [] })),
    generateSrcSet: vi.fn(() => ''),
    generateBlurPlaceholder: vi.fn(() => 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='),
    supportsWebP: vi.fn(() => Promise.resolve(true)),
    createLazyLoadObserver: vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  },
}))

describe('Critical Routes', () => {
  const mockNavigate = vi.fn()

  it('renders HomePage without crashing', () => {
    render(<HomePage onNavigate={mockNavigate} />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders ShopPage without crashing', () => {
    render(<ShopPage />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders AdminPage without crashing', () => {
    render(<AdminPage />)
    expect(document.body).toBeInTheDocument()
  })

  it('HomePage contains expected content', () => {
    render(<HomePage onNavigate={mockNavigate} />)
    expect(screen.getByText(/RiseViA/i)).toBeInTheDocument()
  })

  it('ShopPage contains shop-related content', () => {
    render(<ShopPage />)
    const shopElements = screen.queryAllByText(/shop|product|strain/i)
    expect(shopElements.length).toBeGreaterThan(0)
  })

  it('AdminPage contains admin-related content', () => {
    render(<AdminPage />)
    const adminElements = screen.queryAllByText(/admin|dashboard|manage/i)
    expect(adminElements.length).toBeGreaterThan(0)
  })
})
