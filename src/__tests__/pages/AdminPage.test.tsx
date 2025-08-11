import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test-utils'
import { AdminPage } from '../../pages/AdminPage'

vi.mock('../../services/customerService', () => ({
  customerService: {
    getAll: vi.fn(() => Promise.resolve({ data: [], error: null })),
  }
}))

vi.mock('../../services/activityService', () => ({
  activityService: {
    getActivity: vi.fn(() => Promise.resolve({ data: [], error: null })),
    logActivity: vi.fn(() => Promise.resolve({ success: true })),
  }
}))

const AdminPageWrapper = () => <AdminPage />

describe('AdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    const localStorageMock = {
      getItem: vi.fn(() => 'admin-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  })

  it('should render admin login form when not authenticated', async () => {
    render(<AdminPageWrapper />)
    
    expect(screen.getByText('Admin Login')).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should handle admin login form submission', async () => {
    render(<AdminPageWrapper />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const loginButton = screen.getByRole('button', { name: /login/i })
    
    fireEvent.change(usernameInput, { target: { value: 'admin' } })
    fireEvent.change(passwordInput, { target: { value: 'admin123' } })
    fireEvent.click(loginButton)
    
    expect(usernameInput).toHaveValue('admin')
    expect(passwordInput).toHaveValue('admin123')
  })

  it('should display demo credentials', async () => {
    render(<AdminPageWrapper />)
    
    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument()
    expect(screen.getByText(/Username: admin/)).toBeInTheDocument()
    expect(screen.getByText(/Password: admin123/)).toBeInTheDocument()
  })

  it('should render with proper styling', async () => {
    render(<AdminPageWrapper />)
    
    const heading = screen.getByText('Admin Login')
    expect(heading).toBeInTheDocument()
    
    const description = screen.getByText('Access the RiseViA admin dashboard')
    expect(description).toBeInTheDocument()
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    expect(usernameInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
  })

  it('should handle form validation', async () => {
    render(<AdminPageWrapper />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(usernameInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should handle form input changes', async () => {
    render(<AdminPageWrapper />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } })
    fireEvent.change(passwordInput, { target: { value: 'testpass' } })
    
    expect(usernameInput).toHaveValue('testuser')
    expect(passwordInput).toHaveValue('testpass')
  })

  it('should render login form by default', async () => {
    render(<AdminPageWrapper />)
    
    expect(screen.getByText('Admin Login')).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should have proper form structure', async () => {
    render(<AdminPageWrapper />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    expect(usernameInput).toHaveAttribute('type', 'text')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(usernameInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should show demo credentials section', async () => {
    render(<AdminPageWrapper />)
    
    expect(screen.getByText('Demo Credentials:')).toBeInTheDocument()
    expect(screen.getByText(/Username: admin/)).toBeInTheDocument()
    expect(screen.getByText(/Password: admin123/)).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', async () => {
    render(<AdminPageWrapper />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })
    
    expect(usernameInput).toHaveAttribute('id', 'username')
    expect(passwordInput).toHaveAttribute('id', 'password')
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should render with proper CSS classes', async () => {
    render(<AdminPageWrapper />)
    
    const heading = screen.getByText('Admin Login')
    expect(heading).toHaveClass('text-2xl', 'font-bold', 'text-risevia-black')
    
    const description = screen.getByText('Access the RiseViA admin dashboard')
    expect(description).toHaveClass('text-risevia-charcoal')
  })

  it('should have proper form validation attributes', async () => {
    render(<AdminPageWrapper />)
    
    const usernameInput = screen.getByLabelText(/username/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(usernameInput).toHaveAttribute('placeholder', 'Enter username')
    expect(passwordInput).toHaveAttribute('placeholder', 'Enter password')
    expect(usernameInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
  })
})
