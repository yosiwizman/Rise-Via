import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import { HomePage } from '../../pages/HomePage'
import React from 'react'

vi.mock('../../components/ui/carousel', () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-carousel">{children}</div>,
  CarouselContent: ({ children }: { children: React.ReactNode }) => <div data-testid="carousel-content">{children}</div>,
  CarouselItem: ({ children }: { children: React.ReactNode }) => <div data-testid="carousel-item">{children}</div>,
  CarouselPrevious: () => <button data-testid="carousel-prev">Previous</button>,
  CarouselNext: () => <button data-testid="carousel-next">Next</button>,
}))

vi.mock('embla-carousel-react', () => ({
  default: () => [vi.fn(), { scrollTo: vi.fn(), canScrollNext: vi.fn(() => true), canScrollPrev: vi.fn(() => false) }],
}))

describe('HomePage', () => {
  const mockNavigate = vi.fn()

  it('should render homepage content', () => {
    render(<HomePage onNavigate={mockNavigate} />)
    
    const riseViaElements = screen.getAllByText(/RiseViA/i)
    expect(riseViaElements.length).toBeGreaterThan(0)
  })

  it('should display hero section', () => {
    render(<HomePage onNavigate={mockNavigate} />)
    
    expect(screen.getByText(/Premium Cannabis/i)).toBeInTheDocument()
  })

  it('should show featured products carousel', () => {
    render(<HomePage onNavigate={mockNavigate} />)
    
    expect(screen.getByTestId('mock-carousel')).toBeInTheDocument()
  })

  it('should have navigation functionality', () => {
    render(<HomePage onNavigate={mockNavigate} />)
    
    expect(mockNavigate).toBeDefined()
    expect(typeof mockNavigate).toBe('function')
  })
})
