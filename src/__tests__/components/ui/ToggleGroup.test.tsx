import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'
import { ToggleGroup, ToggleGroupItem } from '../../../components/ui/toggle-group'

describe('ToggleGroup', () => {
  it('should render toggle group', () => {
    render(
      <ToggleGroup type="single" value="option1">
        <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
      </ToggleGroup>
    )
    
    expect(screen.getByText('Option 1')).toBeInTheDocument()
    expect(screen.getByText('Option 2')).toBeInTheDocument()
  })

  it('should handle single selection', () => {
    render(
      <ToggleGroup type="single" defaultValue="option1">
        <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
      </ToggleGroup>
    )
    
    const option1 = screen.getByText('Option 1')
    const option2 = screen.getByText('Option 2')
    
    expect(option1).toBeInTheDocument()
    expect(option2).toBeInTheDocument()
  })

  it('should handle multiple selection', () => {
    render(
      <ToggleGroup type="multiple" defaultValue={['option1']}>
        <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
      </ToggleGroup>
    )
    
    const option2 = screen.getByText('Option 2')
    fireEvent.click(option2)
    
    expect(option2).toBeInTheDocument()
  })

  it('should support different sizes', () => {
    render(
      <ToggleGroup type="single" size="sm">
        <ToggleGroupItem value="small">Small</ToggleGroupItem>
      </ToggleGroup>
    )
    
    expect(screen.getByText('Small')).toBeInTheDocument()
  })

  it('should handle disabled state', () => {
    render(
      <ToggleGroup type="single" disabled>
        <ToggleGroupItem value="disabled">Disabled</ToggleGroupItem>
      </ToggleGroup>
    )
    
    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })
})
