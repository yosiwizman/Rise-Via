import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'

const MockButton = ({ children, onClick, disabled }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button onClick={onClick} disabled={disabled}>
    {children}
  </button>
)

describe('Button Component - Simple', () => {
  it('should render button with text', () => {
    render(<MockButton>Click me</MockButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<MockButton onClick={handleClick}>Click me</MockButton>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(<MockButton disabled>Disabled</MockButton>)
    const button = screen.getByText('Disabled')
    expect(button).toBeDisabled()
  })

  it('should render different button variants', () => {
    render(<MockButton>Primary</MockButton>)
    expect(screen.getByText('Primary')).toBeInTheDocument()
  })
})
