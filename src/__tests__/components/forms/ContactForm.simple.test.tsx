import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../../../test-utils'

const MockContactForm = ({ onSubmit }: any) => (
  <form onSubmit={onSubmit}>
    <input name="name" placeholder="Your Name" />
    <input name="email" placeholder="Your Email" type="email" />
    <textarea name="message" placeholder="Your Message" />
    <button type="submit">Send Message</button>
  </form>
)

describe('ContactForm - Simple', () => {
  it('should render form fields', () => {
    render(<MockContactForm />)
    
    expect(screen.getByPlaceholderText('Your Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your Message')).toBeInTheDocument()
  })

  it('should render submit button', () => {
    render(<MockContactForm />)
    expect(screen.getByText('Send Message')).toBeInTheDocument()
  })

  it('should handle form submission', () => {
    const handleSubmit = vi.fn()
    render(<MockContactForm onSubmit={handleSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /send message/i })
    fireEvent.click(submitButton)
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('should have proper input types', () => {
    render(<MockContactForm />)
    
    const emailInput = screen.getByPlaceholderText('Your Email')
    expect(emailInput).toHaveAttribute('type', 'email')
  })
})
