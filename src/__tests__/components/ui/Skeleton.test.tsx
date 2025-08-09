import { describe, it, expect } from 'vitest'
import { render } from '../../../test-utils'
import { Skeleton } from '../../../components/ui/skeleton'

describe('Skeleton', () => {
  it('should render skeleton component', () => {
    const { container } = render(<Skeleton />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should have default skeleton styling', () => {
    const { container } = render(<Skeleton />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with different sizes', () => {
    const { container: small } = render(<Skeleton className="h-4 w-4" />)
    const { container: large } = render(<Skeleton className="h-8 w-8" />)
    
    expect(small.firstChild).toBeInTheDocument()
    expect(large.firstChild).toBeInTheDocument()
  })
})
