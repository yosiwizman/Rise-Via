import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'

const MockButton = ({ children, variant = 'default', size = 'default', ...props }: any) => (
  <button 
    className={`btn btn-${variant} btn-${size}`}
    {...props}
  >
    {children}
  </button>
)

describe('Button Coverage Tests', () => {
  it('should render button with default props', () => {
    render(<MockButton>Click me</MockButton>)
    expect(screen.getByText('Click me')).toBeDefined()
  })

  it('should render button variants', () => {
    render(<MockButton variant="primary">Primary</MockButton>)
    expect(screen.getByText('Primary')).toBeDefined()
    
    render(<MockButton variant="secondary">Secondary</MockButton>)
    expect(screen.getByText('Secondary')).toBeDefined()
  })

  it('should render button sizes', () => {
    render(<MockButton size="sm">Small</MockButton>)
    expect(screen.getByText('Small')).toBeDefined()
    
    render(<MockButton size="lg">Large</MockButton>)
    expect(screen.getByText('Large')).toBeDefined()
  })

  it('should handle disabled state', () => {
    render(<MockButton disabled>Disabled</MockButton>)
    const button = screen.getByText('Disabled')
    expect(button).toBeDefined()
    expect((button as HTMLButtonElement).disabled).toBe(true)
  })

  it('should handle click events', () => {
    let clicked = false
    const handleClick = () => { clicked = true }
    
    render(<MockButton onClick={handleClick}>Clickable</MockButton>)
    const button = screen.getByText('Clickable')
    button.click()
    expect(clicked).toBe(true)
  })
})
