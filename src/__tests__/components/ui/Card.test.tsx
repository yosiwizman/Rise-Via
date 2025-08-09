import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/card'

describe('Card Components', () => {
  it('should render Card with content', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    )
    
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('should render CardHeader', () => {
    render(
      <Card>
        <CardHeader>
          <div>Header content</div>
        </CardHeader>
      </Card>
    )
    
    expect(screen.getByText('Header content')).toBeInTheDocument()
  })

  it('should render CardTitle', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
        </CardHeader>
      </Card>
    )
    
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('should render CardContent', () => {
    render(
      <Card>
        <CardContent>
          <p>Content text</p>
        </CardContent>
      </Card>
    )
    
    expect(screen.getByText('Content text')).toBeInTheDocument()
  })

  it('should render CardFooter', () => {
    render(
      <Card>
        <CardFooter>
          <button>Footer button</button>
        </CardFooter>
      </Card>
    )
    
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should apply custom className to Card', () => {
    render(<Card className="custom-card">Content</Card>)
    
    const card = screen.getByText('Content').closest('div')
    expect(card).toHaveClass('custom-card')
  })
})
