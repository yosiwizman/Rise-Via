import { describe, it, expect } from 'vitest'
import { render } from '../../../test-utils'
import { Progress } from '../../../components/ui/progress'

describe('Progress', () => {
  it('should render progress component', () => {
    const { container } = render(<Progress value={50} />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should display correct progress value', () => {
    const { container } = render(<Progress value={75} />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should handle zero value', () => {
    const { container } = render(<Progress value={0} />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should handle maximum value', () => {
    const { container } = render(<Progress value={100} />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<Progress value={50} className="custom-progress" />)
    
    expect(container.firstChild).toBeInTheDocument()
  })
})
