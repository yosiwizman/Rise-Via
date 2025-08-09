import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/accordion'

describe('Accordion', () => {
  it('should render accordion items', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Section 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Section 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    
    expect(screen.getByText('Section 1')).toBeInTheDocument()
    expect(screen.getByText('Section 2')).toBeInTheDocument()
  })

  it('should expand accordion item on click', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Expandable Section</AccordionTrigger>
          <AccordionContent>Hidden Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    
    const trigger = screen.getByText('Expandable Section')
    fireEvent.click(trigger)
    
    expect(screen.getByText('Hidden Content')).toBeInTheDocument()
  })

  it('should support multiple type accordion', () => {
    render(
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Multi 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Multi 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    
    expect(screen.getByText('Multi 1')).toBeInTheDocument()
    expect(screen.getByText('Multi 2')).toBeInTheDocument()
  })

  it('should handle disabled items', () => {
    render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" disabled>
          <AccordionTrigger>Disabled Section</AccordionTrigger>
          <AccordionContent>Disabled Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    )
    
    const trigger = screen.getByText('Disabled Section')
    expect(trigger).toBeDisabled()
  })
})
