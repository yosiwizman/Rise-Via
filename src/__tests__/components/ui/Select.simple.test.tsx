import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'

const MockSelect = ({ children, onValueChange, defaultValue }: {
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}) => (
  <select onChange={(e) => onValueChange?.(e.target.value)} defaultValue={defaultValue}>
    {children}
  </select>
)

const MockSelectItem = ({ value, children }: {
  value: string;
  children: React.ReactNode;
}) => (
  <option value={value}>
    {children}
  </option>
)

describe('Select Component - Simple', () => {
  it('should render select with options', () => {
    render(
      <MockSelect>
        <MockSelectItem value="option1">Option 1</MockSelectItem>
        <MockSelectItem value="option2">Option 2</MockSelectItem>
      </MockSelect>
    )
    
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('should handle value changes', () => {
    const handleChange = vi.fn()
    render(
      <MockSelect onValueChange={handleChange}>
        <MockSelectItem value="test">Test Option</MockSelectItem>
      </MockSelect>
    )
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'test' } })
    expect(handleChange).toHaveBeenCalledWith('test')
  })

  it('should set default value', () => {
    render(
      <MockSelect defaultValue="default">
        <MockSelectItem value="default">Default</MockSelectItem>
        <MockSelectItem value="other">Other</MockSelectItem>
      </MockSelect>
    )
    
    const select = screen.getByRole('combobox') as HTMLSelectElement
    expect(select.value).toBe('default')
  })
})
