import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'
import { Toggle } from '../../../components/ui/toggle'

describe('Toggle', () => {
  it('should render toggle button', () => {
    render(<Toggle>Toggle Me</Toggle>)
    expect(screen.getByText('Toggle Me')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    render(<Toggle>Clickable Toggle</Toggle>)
    const toggle = screen.getByText('Clickable Toggle')
    
    fireEvent.click(toggle)
    expect(toggle).toBeInTheDocument()
  })

  it('should support pressed state', () => {
    render(<Toggle pressed>Pressed Toggle</Toggle>)
    expect(screen.getByText('Pressed Toggle')).toBeInTheDocument()
  })

  it('should support different variants', () => {
    render(<Toggle variant="outline">Outline Toggle</Toggle>)
    expect(screen.getByText('Outline Toggle')).toBeInTheDocument()
  })

  it('should support different sizes', () => {
    render(<Toggle size="sm">Small Toggle</Toggle>)
    expect(screen.getByText('Small Toggle')).toBeInTheDocument()
  })

  it('should handle disabled state', () => {
    render(<Toggle disabled>Disabled Toggle</Toggle>)
    const toggle = screen.getByText('Disabled Toggle')
    expect(toggle).toBeDisabled()
  })

  it('should support custom className', () => {
    render(<Toggle className="custom-class">Custom Toggle</Toggle>)
    expect(screen.getByText('Custom Toggle')).toBeInTheDocument()
  })
})
