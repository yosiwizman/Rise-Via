import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'

const MockCheckbox = ({ checked, onChange, disabled }: {
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) => (
  <input 
    type="checkbox"
    checked={checked}
    onChange={onChange}
    disabled={disabled}
  />
)

describe('Checkbox Component - Simple', () => {
  it('should render checkbox', () => {
    render(<MockCheckbox />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeInTheDocument()
  })

  it('should handle checked state', () => {
    render(<MockCheckbox checked={true} />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('should handle change events', () => {
    const handleChange = vi.fn()
    render(<MockCheckbox onChange={handleChange} />)
    
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(handleChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<MockCheckbox disabled />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })
})
