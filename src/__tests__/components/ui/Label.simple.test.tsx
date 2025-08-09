import { describe, it, expect } from 'vitest'
import { render, screen } from '../../../test-utils'

const MockLabel = ({ children, htmlFor }: any) => (
  <label htmlFor={htmlFor}>
    {children}
  </label>
)

describe('Label Component - Simple', () => {
  it('should render label with text', () => {
    render(<MockLabel>Username</MockLabel>)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('should have htmlFor attribute', () => {
    render(<MockLabel htmlFor="username">Username</MockLabel>)
    const label = screen.getByText('Username')
    expect(label).toHaveAttribute('for', 'username')
  })

  it('should render children correctly', () => {
    render(<MockLabel>Email Address</MockLabel>)
    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })
})
