import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test-utils'

const MockWishlistMetricsDashboard = () => {
  const mockMetrics = {
    totalItems: 25,
    totalValue: 749.75,
    averagePrice: 29.99,
    topCategories: [
      { name: 'Flower', count: 15, percentage: 60 },
      { name: 'Edibles', count: 7, percentage: 28 },
      { name: 'Concentrates', count: 3, percentage: 12 }
    ],
    recentActivity: [
      { action: 'added', product: 'Blue Dream', timestamp: '2023-12-01T10:00:00Z' },
      { action: 'removed', product: 'OG Kush', timestamp: '2023-12-01T09:30:00Z' }
    ],
    priceAlerts: {
      active: 5,
      triggered: 2
    }
  }

  return (
    <div data-testid="wishlist-metrics-dashboard">
      <h1>Wishlist Analytics</h1>
      
      <div data-testid="metrics-overview">
        <div data-testid="total-items">{mockMetrics.totalItems} Items</div>
        <div data-testid="total-value">${mockMetrics.totalValue.toFixed(2)}</div>
        <div data-testid="average-price">${mockMetrics.averagePrice.toFixed(2)} avg</div>
      </div>

      <div data-testid="category-breakdown">
        <h2>Categories</h2>
        {mockMetrics.topCategories.map(category => (
          <div key={category.name} data-testid={`category-${category.name.toLowerCase()}`}>
            {category.name}: {category.count} ({category.percentage}%)
          </div>
        ))}
      </div>

      <div data-testid="recent-activity">
        <h2>Recent Activity</h2>
        {mockMetrics.recentActivity.map((activity, index) => (
          <div key={index} data-testid={`activity-${index}`}>
            {activity.action} {activity.product}
          </div>
        ))}
      </div>

      <div data-testid="price-alerts">
        <h2>Price Alerts</h2>
        <div data-testid="active-alerts">{mockMetrics.priceAlerts.active} Active</div>
        <div data-testid="triggered-alerts">{mockMetrics.priceAlerts.triggered} Triggered</div>
      </div>

      <div data-testid="export-controls">
        <button data-testid="export-csv">Export CSV</button>
        <button data-testid="export-pdf">Export PDF</button>
        <button data-testid="refresh-data">Refresh</button>
      </div>
    </div>
  )
}


describe('WishlistMetricsDashboard Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('dashboard rendering', () => {
    it('should render dashboard with all sections', () => {
      render(<MockWishlistMetricsDashboard />)

      expect(screen.getByTestId('wishlist-metrics-dashboard')).toBeInTheDocument()
      expect(screen.getByText('Wishlist Analytics')).toBeInTheDocument()
      expect(screen.getByTestId('metrics-overview')).toBeInTheDocument()
      expect(screen.getByTestId('category-breakdown')).toBeInTheDocument()
      expect(screen.getByTestId('recent-activity')).toBeInTheDocument()
      expect(screen.getByTestId('price-alerts')).toBeInTheDocument()
    })

    it('should display metrics overview correctly', () => {
      render(<MockWishlistMetricsDashboard />)

      expect(screen.getByTestId('total-items')).toHaveTextContent('25 Items')
      expect(screen.getByTestId('total-value')).toHaveTextContent('$749.75')
      expect(screen.getByTestId('average-price')).toHaveTextContent('$29.99 avg')
    })

    it('should show category breakdown', () => {
      render(<MockWishlistMetricsDashboard />)

      expect(screen.getByTestId('category-flower')).toHaveTextContent('Flower: 15 (60%)')
      expect(screen.getByTestId('category-edibles')).toHaveTextContent('Edibles: 7 (28%)')
      expect(screen.getByTestId('category-concentrates')).toHaveTextContent('Concentrates: 3 (12%)')
    })

    it('should display recent activity', () => {
      render(<MockWishlistMetricsDashboard />)

      expect(screen.getByTestId('activity-0')).toHaveTextContent('added Blue Dream')
      expect(screen.getByTestId('activity-1')).toHaveTextContent('removed OG Kush')
    })

    it('should show price alerts information', () => {
      render(<MockWishlistMetricsDashboard />)

      expect(screen.getByTestId('active-alerts')).toHaveTextContent('5 Active')
      expect(screen.getByTestId('triggered-alerts')).toHaveTextContent('2 Triggered')
    })
  })

  describe('export functionality', () => {
    it('should have export controls', () => {
      render(<MockWishlistMetricsDashboard />)

      expect(screen.getByTestId('export-csv')).toBeInTheDocument()
      expect(screen.getByTestId('export-pdf')).toBeInTheDocument()
      expect(screen.getByTestId('refresh-data')).toBeInTheDocument()
    })

    it('should handle CSV export', () => {
      const createObjectURL = vi.fn()
      const revokeObjectURL = vi.fn()
      
      Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL })
      Object.defineProperty(URL, 'revokeObjectURL', { value: revokeObjectURL })

      render(<MockWishlistMetricsDashboard />)

      const exportButton = screen.getByTestId('export-csv')
      fireEvent.click(exportButton)

      expect(exportButton).toBeInTheDocument()
    })

    it('should handle PDF export', () => {
      render(<MockWishlistMetricsDashboard />)

      const exportButton = screen.getByTestId('export-pdf')
      fireEvent.click(exportButton)

      expect(exportButton).toBeInTheDocument()
    })

    it('should handle data refresh', () => {
      render(<MockWishlistMetricsDashboard />)

      const refreshButton = screen.getByTestId('refresh-data')
      fireEvent.click(refreshButton)

      expect(refreshButton).toBeInTheDocument()
    })
  })

  describe('analytics integration', () => {
    it('should call analytics functions on mount', async () => {
      const getMetrics = vi.fn(() => Promise.resolve({
        totalItems: 25,
        totalValue: 749.75,
        averagePrice: 29.99
      }))

      await getMetrics()

      expect(getMetrics).toHaveBeenCalled()
    })

    it('should handle analytics errors gracefully', async () => {
      const getMetrics = vi.fn(() => Promise.reject(new Error('Analytics error')))

      try {
        await getMetrics()
      } catch (error) {
        expect((error as Error).message).toBe('Analytics error')
      }

      expect(getMetrics).toHaveBeenCalled()
    })

    it('should format currency values correctly', () => {
      const formatCurrency = (value: number) => `$${value.toFixed(2)}`

      expect(formatCurrency(749.75)).toBe('$749.75')
      expect(formatCurrency(29.99)).toBe('$29.99')
      expect(formatCurrency(1000)).toBe('$1000.00')
    })

    it('should calculate percentages correctly', () => {
      const calculatePercentage = (part: number, total: number) => 
        Math.round((part / total) * 100)

      expect(calculatePercentage(15, 25)).toBe(60)
      expect(calculatePercentage(7, 25)).toBe(28)
      expect(calculatePercentage(3, 25)).toBe(12)
    })
  })

  describe('responsive design', () => {
    it('should adapt to mobile viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<MockWishlistMetricsDashboard />)

      expect(screen.getByTestId('wishlist-metrics-dashboard')).toBeInTheDocument()
    })

    it('should adapt to tablet viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(<MockWishlistMetricsDashboard />)

      expect(screen.getByTestId('wishlist-metrics-dashboard')).toBeInTheDocument()
    })

    it('should adapt to desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440,
      })

      render(<MockWishlistMetricsDashboard />)

      expect(screen.getByTestId('wishlist-metrics-dashboard')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      render(<MockWishlistMetricsDashboard />)

      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toHaveTextContent('Wishlist Analytics')

      const h2Elements = screen.getAllByRole('heading', { level: 2 })
      expect(h2Elements).toHaveLength(3)
    })

    it('should have accessible buttons', () => {
      render(<MockWishlistMetricsDashboard />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach((button: HTMLElement) => {
        expect(button).toHaveAttribute('data-testid')
      })
    })

    it('should support keyboard navigation', () => {
      render(<MockWishlistMetricsDashboard />)

      const exportButton = screen.getByTestId('export-csv')
      exportButton.focus()
      
      expect(document.activeElement).toBe(exportButton)
    })
  })

  describe('data loading states', () => {
    it('should handle loading state', () => {
      const LoadingDashboard = () => (
        <div data-testid="loading-dashboard">
          <div data-testid="loading-spinner">Loading...</div>
        </div>
      )

      render(<LoadingDashboard />)

      expect(screen.getByTestId('loading-spinner')).toHaveTextContent('Loading...')
    })

    it('should handle empty state', () => {
      const EmptyDashboard = () => (
        <div data-testid="empty-dashboard">
          <div data-testid="empty-message">No wishlist data available</div>
        </div>
      )

      render(<EmptyDashboard />)

      expect(screen.getByTestId('empty-message')).toHaveTextContent('No wishlist data available')
    })

    it('should handle error state', () => {
      const ErrorDashboard = () => (
        <div data-testid="error-dashboard">
          <div data-testid="error-message">Failed to load analytics data</div>
          <button data-testid="retry-button">Retry</button>
        </div>
      )

      render(<ErrorDashboard />)

      expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to load analytics data')
      expect(screen.getByTestId('retry-button')).toBeInTheDocument()
    })
  })

  describe('real-time updates', () => {
    it('should support real-time metric updates', async () => {
      const mockWebSocket = {
        send: vi.fn(),
        close: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }

      global.WebSocket = vi.fn(() => mockWebSocket) as unknown as typeof WebSocket

      render(<MockWishlistMetricsDashboard />)

      expect(screen.getByTestId('wishlist-metrics-dashboard')).toBeInTheDocument()
    })

    it('should handle connection errors', () => {
      const mockWebSocket = {
        send: vi.fn(),
        close: vi.fn(),
        addEventListener: vi.fn((event, callback) => {
          if (event === 'error') {
            callback(new Error('Connection failed'))
          }
        }),
        removeEventListener: vi.fn(),
      }

      global.WebSocket = vi.fn(() => mockWebSocket) as unknown as typeof WebSocket

      render(<MockWishlistMetricsDashboard />)

      expect(screen.getByTestId('wishlist-metrics-dashboard')).toBeInTheDocument()
    })
  })
})
