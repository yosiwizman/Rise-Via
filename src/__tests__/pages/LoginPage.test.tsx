import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { LoginPage } from '../../pages/LoginPage'

vi.mock('../../contexts/CustomerContext', () => ({
  useCustomer: vi.fn(() => ({
    login: vi.fn(),
    register: vi.fn(),
  })),
}))

const LoginPageWrapper = () => <LoginPage />

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form', () => {
    render(<LoginPageWrapper />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should handle form input changes', () => {
    render(<LoginPageWrapper />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })

  it('should handle form submission', async () => {
    const { useCustomer } = await import('../../contexts/CustomerContext')
    const mockLogin = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(useCustomer).mockReturnValue({
      customer: null,
      isAuthenticated: false,
      loading: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      checkAuthStatus: vi.fn(),
    })

    render(<LoginPageWrapper />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should handle login errors', async () => {
    const { useCustomer } = await import('../../contexts/CustomerContext')
    const mockLogin = vi.fn().mockResolvedValue({ success: false, message: 'Invalid credentials' })
    vi.mocked(useCustomer).mockReturnValue({
      customer: null,
      isAuthenticated: false,
      loading: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      checkAuthStatus: vi.fn(),
    })

    render(<LoginPageWrapper />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
  })

  it('should have required form fields', async () => {
    render(<LoginPageWrapper />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should have proper form structure', async () => {
    render(<LoginPageWrapper />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    expect(submitButton).toHaveAttribute('type', 'submit')
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should toggle between login and register modes', () => {
    render(<LoginPageWrapper />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    
    const toggleButton = screen.getByText(/don't have an account/i)
    fireEvent.click(toggleButton)
    
    expect(screen.getByText('Join the RiseViA community')).toBeInTheDocument()
  })

  it('should handle successful login', async () => {
    const { useCustomer } = await import('../../contexts/CustomerContext')
    const mockLogin = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(useCustomer).mockReturnValue({
      customer: null,
      isAuthenticated: false,
      loading: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      checkAuthStatus: vi.fn(),
    })

    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    })

    render(<LoginPageWrapper />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled()
    })
  })

  it('should display welcome message', async () => {
    render(<LoginPageWrapper />)
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByText(/sign in to your risevia account/i)).toBeInTheDocument()
  })

  it('should have proper input labels', async () => {
    render(<LoginPageWrapper />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toHaveAttribute('id', 'email')
    expect(passwordInput).toHaveAttribute('id', 'password')
  })
})
