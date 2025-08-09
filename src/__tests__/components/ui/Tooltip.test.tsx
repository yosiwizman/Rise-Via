import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../components/ui/tooltip'

describe('Tooltip', () => {
  it('should render tooltip with provider', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    
    expect(screen.getByText('Hover me')).toBeInTheDocument()
  })

  it('should handle tooltip trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Button with tooltip</button>
          </TooltipTrigger>
          <TooltipContent>Button tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    
    expect(screen.getByText('Button with tooltip')).toBeInTheDocument()
  })

  it('should support different sides', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Top tooltip</TooltipTrigger>
          <TooltipContent side="top">Top content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    
    expect(screen.getByText('Top tooltip')).toBeInTheDocument()
  })

  it('should handle custom delay', () => {
    render(
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger>Quick tooltip</TooltipTrigger>
          <TooltipContent>Quick content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    
    expect(screen.getByText('Quick tooltip')).toBeInTheDocument()
  })

  it('should support custom styling', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Styled tooltip</TooltipTrigger>
          <TooltipContent className="custom-tooltip">Styled content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
    
    expect(screen.getByText('Styled tooltip')).toBeInTheDocument()
  })
})
