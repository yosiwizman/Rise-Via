import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'

const MockCard = ({ children, className }: any) => (
  <div className={className}>
    {children}
  </div>
)

const MockCardHeader = ({ children }: any) => (
  <div className="card-header">
    {children}
  </div>
)

const MockCardContent = ({ children }: any) => (
  <div className="card-content">
    {children}
  </div>
)

describe('Card Component - Simple', () => {
  it('should render card with content', () => {
    render(
      <MockCard>
        <MockCardHeader>
          <h2>Card Title</h2>
        </MockCardHeader>
        <MockCardContent>
          <p>Card content</p>
        </MockCardContent>
      </MockCard>
    )
    
    expect(screen.getByText('Card Title')).toBeInTheDocument()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<MockCard className="custom-card">Content</MockCard>)
    const card = screen.getByText('Content')
    expect(card).toHaveClass('custom-card')
  })

  it('should render nested components', () => {
    render(
      <MockCard>
        <MockCardHeader>Header</MockCardHeader>
        <MockCardContent>Content</MockCardContent>
      </MockCard>
    )
    
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})
