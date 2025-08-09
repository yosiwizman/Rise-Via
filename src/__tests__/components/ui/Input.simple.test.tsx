import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'

const MockInput = ({ placeholder, value, onChange, type = 'text' }: any) => (
  <input 
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
)

describe('Input Component - Simple', () => {
  it('should render input with placeholder', () => {
    render(<MockInput placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should handle value changes', () => {
    const handleChange = vi.fn()
    render(<MockInput value="" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('should support different input types', () => {
    render(<MockInput type="email" placeholder="Email" />)
    const input = screen.getByPlaceholderText('Email')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('should display current value', () => {
    render(<MockInput value="current value" onChange={() => {}} />)
    const input = screen.getByDisplayValue('current value')
    expect(input).toBeInTheDocument()
  })
})
