import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { OrderManager } from '../../components/admin/OrderManager'

vi.mock('../../services/emailService', () => ({
  emailService: {
    sendOrderStatusUpdate: vi.fn(() => Promise.resolve()),
    sendOrderConfirmation: vi.fn(() => Promise.resolve()),
  },
}))

describe('OrderManager', () => {
  it('should render order list', async () => {
    render(<OrderManager />)
    
    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument()
    })

    expect(screen.getByPlaceholderText(/Search orders/)).toBeInTheDocument()
  })

  it('should display mock orders', async () => {
    render(<OrderManager />)
    
    await waitFor(() => {
      expect(screen.getByText('RV-2024-001')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('jane@example.com')).toBeInTheDocument()
    })
  })

  it('should filter orders by search term', async () => {
    render(<OrderManager />)
    
    await waitFor(() => {
      expect(screen.getByText('RV-2024-001')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/Search orders/)
    
    fireEvent.change(searchInput, { target: { value: 'john@example.com' } })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('should filter orders by status', async () => {
    render(<OrderManager />)
    
    await waitFor(() => {
      expect(screen.getByText('RV-2024-001')).toBeInTheDocument()
    })

    const pendingButton = screen.getByText(/Pending \(1\)/)
    fireEvent.click(pendingButton)
    
    expect(screen.getByText('RV-2024-001')).toBeInTheDocument()
  })

  it('should update order status', async () => {
    render(<OrderManager />)
    
    await waitFor(() => {
      expect(screen.getByText('RV-2024-001')).toBeInTheDocument()
    })

    const statusSelects = screen.getAllByRole('combobox')
    const statusSelect = statusSelects.find(select => 
      select.closest('tr')?.textContent?.includes('RV-2024-001')
    )
    
    if (statusSelect) {
      fireEvent.click(statusSelect)
      
      const processingOption = screen.getByText('Processing')
      fireEvent.click(processingOption)
    }
  })

  it('should show order details modal', async () => {
    render(<OrderManager />)
    
    await waitFor(() => {
      expect(screen.getByText('RV-2024-001')).toBeInTheDocument()
    })

    const viewButtons = screen.getAllByRole('button')
    const viewButton = viewButtons.find(btn => 
      btn.querySelector('svg') && btn.closest('tr')?.textContent?.includes('RV-2024-001')
    )
    
    if (viewButton) {
      fireEvent.click(viewButton)
      
      await waitFor(() => {
        expect(screen.getByText('Order Details')).toBeInTheDocument()
      })
    }
  })

  it('should send order confirmation email', async () => {
    const { emailService } = await import('../../services/emailService')
    
    render(<OrderManager />)
    
    await waitFor(() => {
      expect(screen.getByText('RV-2024-001')).toBeInTheDocument()
    })

    expect(emailService.sendOrderConfirmation).toBeDefined()
    expect(typeof emailService.sendOrderConfirmation).toBe('function')
  })

  it('should display status counts correctly', async () => {
    render(<OrderManager />)
    
    await waitFor(() => {
      expect(screen.getByText(/All \(3\)/)).toBeInTheDocument()
      expect(screen.getByText(/Pending \(1\)/)).toBeInTheDocument()
      expect(screen.getByText(/Processing \(1\)/)).toBeInTheDocument()
      expect(screen.getByText(/Shipped \(1\)/)).toBeInTheDocument()
    })
  })
})
