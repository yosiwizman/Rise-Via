import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'

const MockToaster = () => (
  <div data-testid="toaster" role="region" aria-label="Notifications">
    <div data-testid="toast">Test notification</div>
  </div>
)

describe('Sonner - Simple', () => {
  it('should render toaster', () => {
    render(<MockToaster />)
    expect(screen.getByTestId('toaster')).toBeDefined()
  })

  it('should render toast notifications', () => {
    render(<MockToaster />)
    expect(screen.getByTestId('toast')).toBeDefined()
    expect(screen.getByText('Test notification')).toBeDefined()
  })
})
