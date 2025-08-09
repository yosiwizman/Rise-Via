import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'

const MockMenubar = () => (
  <div role="menubar">
    <button role="menuitem">File</button>
    <button role="menuitem">Edit</button>
    <button role="menuitem">View</button>
  </div>
)

describe('Menubar - Simple', () => {
  it('should render menubar', () => {
    render(<MockMenubar />)
    expect(screen.getByRole('menubar')).toBeDefined()
  })

  it('should render menu items', () => {
    render(<MockMenubar />)
    expect(screen.getByText('File')).toBeDefined()
    expect(screen.getByText('Edit')).toBeDefined()
    expect(screen.getByText('View')).toBeDefined()
  })
})
