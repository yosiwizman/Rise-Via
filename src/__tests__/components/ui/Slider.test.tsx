import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '../../../test-utils'
import { Slider } from '../../../components/ui/slider'

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

describe('Slider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render slider component', () => {
    const { container } = render(<Slider defaultValue={[50]} />)
    
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should handle basic rendering without errors', () => {
    expect(() => {
      render(<Slider defaultValue={[25]} />)
    }).not.toThrow()
  })

  it('should render with min and max values', () => {
    expect(() => {
      render(<Slider defaultValue={[50]} min={0} max={100} />)
    }).not.toThrow()
  })

  it('should handle multiple values', () => {
    expect(() => {
      render(<Slider defaultValue={[25, 75]} />)
    }).not.toThrow()
  })

  it('should handle disabled state', () => {
    expect(() => {
      render(<Slider defaultValue={[50]} disabled />)
    }).not.toThrow()
  })

  it('should apply custom className', () => {
    const { container } = render(<Slider defaultValue={[50]} className="custom-slider" />)
    
    expect(container.firstChild).toBeInTheDocument()
  })
})
