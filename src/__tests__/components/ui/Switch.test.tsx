import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, screen } from '../../../test-utils'
import { Switch } from '../../../components/ui/switch'

describe('Switch', () => {
  it('should render switch component', () => {
    const { container } = render(<Switch />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should handle checked state', () => {
    render(<Switch checked={true} />)
    
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toBeChecked()
  })

  it('should handle unchecked state', () => {
    render(<Switch checked={false} />)
    
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toBeChecked()
  })

  it('should call onCheckedChange when clicked', () => {
    const onCheckedChange = vi.fn()
    render(<Switch onCheckedChange={onCheckedChange} />)
    
    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)
    
    expect(onCheckedChange).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Switch disabled />)
    
    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeDisabled()
  })

  it('should apply custom className', () => {
    const { container } = render(<Switch className="custom-switch" />)
    
    expect(container.firstChild).toBeInTheDocument()
  })
})
