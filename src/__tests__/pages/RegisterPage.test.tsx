import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test-utils'
import RegisterPage from '../../pages/RegisterPage'

const mockNavigate = vi.fn()

vi.mock('../../contexts/CustomerContext', () => ({
  useCustomer: vi.fn(() => ({
    register: vi.fn(),
  })),
}))

const RegisterPageWrapper = () => (
  <RegisterPage onNavigate={mockNavigate} />
)

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render registration form', () => {
    render(<RegisterPageWrapper />)
    
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password \(min 6 characters\)/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('should handle form input changes', () => {
    render(<RegisterPageWrapper />)
    
    const firstNameInput = screen.getByPlaceholderText(/first name/i)
    const lastNameInput = screen.getByPlaceholderText(/last name/i)
    const emailInput = screen.getByPlaceholderText(/email address/i)
    const passwordInput = screen.getByPlaceholderText(/password \(min 6 characters\)/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i)
    
    fireEvent.change(firstNameInput, { target: { value: 'John' } })
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    expect(firstNameInput).toHaveValue('John')
    expect(lastNameInput).toHaveValue('Doe')
    expect(emailInput).toHaveValue('john@example.com')
    expect(passwordInput).toHaveValue('password123')
    expect(confirmPasswordInput).toHaveValue('password123')
  })

  it('should handle form submission', async () => {
    render(<RegisterPageWrapper />)
    
    const firstNameInput = screen.getByPlaceholderText(/first name/i)
    const lastNameInput = screen.getByPlaceholderText(/last name/i)
    const emailInput = screen.getByPlaceholderText(/email address/i)
    const passwordInput = screen.getByPlaceholderText(/password \(min 6 characters\)/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(firstNameInput, { target: { value: 'John' } })
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    
    expect(submitButton).toBeInTheDocument()
    expect(firstNameInput).toHaveValue('John')
    expect(emailInput).toHaveValue('john@example.com')
  })

  it('should have proper form validation attributes', async () => {
    render(<RegisterPageWrapper />)
    
    const firstNameInput = screen.getByPlaceholderText(/first name/i)
    const emailInput = screen.getByPlaceholderText(/email address/i)
    const passwordInput = screen.getByPlaceholderText(/password \(min 6 characters\)/i)
    
    expect(firstNameInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('minlength', '6')
  })

  it('should have required form fields', async () => {
    render(<RegisterPageWrapper />)
    
    const firstNameInput = screen.getByPlaceholderText(/first name/i)
    const lastNameInput = screen.getByPlaceholderText(/last name/i)
    const emailInput = screen.getByPlaceholderText(/email address/i)
    const passwordInput = screen.getByPlaceholderText(/password \(min 6 characters\)/i)
    
    expect(firstNameInput).toHaveAttribute('required')
    expect(lastNameInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
  })

  it('should have password confirmation field', async () => {
    render(<RegisterPageWrapper />)
    
    const passwordInput = screen.getByPlaceholderText(/password \(min 6 characters\)/i)
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm password/i)
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toHaveAttribute('minlength', '6')
  })

  it('should have proper input types and attributes', async () => {
    render(<RegisterPageWrapper />)
    
    const emailInput = screen.getByPlaceholderText(/email address/i)
    const phoneInput = screen.getByPlaceholderText(/phone number/i)
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(phoneInput).toHaveAttribute('type', 'tel')
  })

  it('should display member benefits section', async () => {
    render(<RegisterPageWrapper />)
    
    expect(screen.getByText('Member Benefits:')).toBeInTheDocument()
    expect(screen.getByText(/100 welcome bonus loyalty points/i)).toBeInTheDocument()
    expect(screen.getByText(/Exclusive member discounts/i)).toBeInTheDocument()
    expect(screen.getByText(/Early access to new product releases/i)).toBeInTheDocument()
  })

  it('should display login link', () => {
    render(<RegisterPageWrapper />)
    
    const loginText = screen.getByText(/already have an account/i)
    const signInButton = screen.getByText(/sign in/i)
    
    expect(loginText).toBeInTheDocument()
    expect(signInButton).toBeInTheDocument()
  })

  it('should have proper button styling', async () => {
    render(<RegisterPageWrapper />)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    expect(submitButton).toHaveAttribute('type', 'submit')
    expect(submitButton).toHaveClass('w-full', 'bg-purple-600', 'text-white')
  })

  it('should display terms and privacy policy links', () => {
    render(<RegisterPageWrapper />)
    
    const termsButton = screen.getByRole('button', { name: /terms of service/i })
    const privacyButton = screen.getByRole('button', { name: /privacy policy/i })
    
    expect(termsButton).toBeInTheDocument()
    expect(privacyButton).toBeInTheDocument()
  })

  it('should have terms and conditions checkboxes', async () => {
    render(<RegisterPageWrapper />)
    
    const ageCheckbox = screen.getByText(/I confirm I am 21 years or older/i).closest('label')?.querySelector('input')
    const termsCheckbox = screen.getByText(/I accept the/i).closest('label')?.querySelector('input')
    
    expect(ageCheckbox).toHaveAttribute('type', 'checkbox')
    expect(termsCheckbox).toHaveAttribute('type', 'checkbox')
    expect(ageCheckbox).toHaveAttribute('required')
    expect(termsCheckbox).toHaveAttribute('required')
  })
})
