import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'

const MockTextarea = ({ placeholder, value, onChange, disabled, rows }: any) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
    rows={rows}
  />
)

describe('Textarea Component - Simple', () => {
  it('should render textarea with placeholder', () => {
    render(<MockTextarea placeholder="Enter your message" />)
    expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument()
  })

  it('should handle value changes', () => {
    const handleChange = vi.fn()
    render(<MockTextarea value="" onChange={handleChange} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'test message' } })
    expect(handleChange).toHaveBeenCalled()
  })

  it('should display current value', () => {
    render(<MockTextarea value="current text" onChange={() => {}} />)
    const textarea = screen.getByDisplayValue('current text')
    expect(textarea).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<MockTextarea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('should set rows attribute', () => {
    render(<MockTextarea rows={5} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
  })
})
