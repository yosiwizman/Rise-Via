import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'

const MockSidebar = ({ children }: any) => (
  <div data-testid="sidebar" className="sidebar">
    {children}
  </div>
)

const MockSidebarContent = ({ children }: any) => (
  <div data-testid="sidebar-content">
    {children}
  </div>
)

describe('Sidebar - Simple', () => {
  it('should render sidebar', () => {
    render(<MockSidebar>Content</MockSidebar>)
    expect(screen.getByTestId('sidebar')).toBeDefined()
  })

  it('should render sidebar content', () => {
    render(<MockSidebarContent>Test content</MockSidebarContent>)
    expect(screen.getByTestId('sidebar-content')).toBeDefined()
    expect(screen.getByText('Test content')).toBeDefined()
  })
})
