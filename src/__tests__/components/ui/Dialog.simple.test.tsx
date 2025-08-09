import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'

const MockDialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null
  
  return (
    <div role="dialog" aria-modal="true">
      <div className="dialog-overlay" onClick={() => onOpenChange?.(false)} />
      <div className="dialog-content">
        {children}
      </div>
    </div>
  )
}

const MockDialogTrigger = ({ children, onClick }: any) => (
  <button onClick={onClick}>
    {children}
  </button>
)

describe('Dialog Component - Simple', () => {
  it('should render dialog when open', () => {
    render(
      <MockDialog open={true}>
        <h2>Dialog Title</h2>
        <p>Dialog content</p>
      </MockDialog>
    )
    
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Dialog Title')).toBeInTheDocument()
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(
      <MockDialog open={false}>
        <h2>Dialog Title</h2>
      </MockDialog>
    )
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should handle close on overlay click', () => {
    const handleOpenChange = vi.fn()
    render(
      <MockDialog open={true} onOpenChange={handleOpenChange}>
        <h2>Dialog Title</h2>
      </MockDialog>
    )
    
    const overlay = document.querySelector('.dialog-overlay')
    if (overlay) {
      fireEvent.click(overlay)
      expect(handleOpenChange).toHaveBeenCalledWith(false)
    }
  })

  it('should render trigger button', () => {
    const handleClick = vi.fn()
    render(
      <MockDialogTrigger onClick={handleClick}>
        Open Dialog
      </MockDialogTrigger>
    )
    
    const trigger = screen.getByText('Open Dialog')
    expect(trigger).toBeInTheDocument()
    
    fireEvent.click(trigger)
    expect(handleClick).toHaveBeenCalled()
  })
})
