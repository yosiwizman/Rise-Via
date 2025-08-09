import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../../../components/ui/sheet'

describe('Sheet', () => {
  it('should render sheet trigger', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
    
    expect(screen.getByText('Open Sheet')).toBeInTheDocument()
  })

  it('should open sheet when trigger is clicked', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
    
    const trigger = screen.getByText('Open Sheet')
    fireEvent.click(trigger)
    
    expect(screen.getByText('Sheet Title')).toBeInTheDocument()
    expect(screen.getByText('Sheet Description')).toBeInTheDocument()
  })

  it('should support different sides', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Left Sheet</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
    
    expect(screen.getByText('Open Sheet')).toBeInTheDocument()
  })

  it('should handle controlled state', () => {
    render(
      <Sheet open={true}>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Always Open</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
    
    expect(screen.getByText('Always Open')).toBeInTheDocument()
  })
})
