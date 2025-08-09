import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover'

describe('Popover', () => {
  it('should render popover trigger', () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    )
    
    expect(screen.getByText('Open Popover')).toBeInTheDocument()
  })

  it('should open popover when trigger is clicked', () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    )
    
    const trigger = screen.getByText('Open Popover')
    fireEvent.click(trigger)
    
    expect(screen.getByText('Popover Content')).toBeInTheDocument()
  })

  it('should support controlled state', () => {
    render(
      <Popover open={true}>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Always Open</PopoverContent>
      </Popover>
    )
    
    expect(screen.getByText('Always Open')).toBeInTheDocument()
  })

  it('should handle custom positioning', () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent side="top" align="start">
          Top Aligned Content
        </PopoverContent>
      </Popover>
    )
    
    expect(screen.getByText('Open Popover')).toBeInTheDocument()
  })
})
