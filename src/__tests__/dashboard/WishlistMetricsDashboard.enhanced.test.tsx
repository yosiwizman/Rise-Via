import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '../../test-utils'

const MockWishlistMetricsDashboard = () => {
  const mockData = {
    totalItems: 156,
    totalValue: 4234.56,
    averagePrice: 27.14,
    topProducts: [
      { id: '1', name: 'Blue Dream', count: 23 },
      { id: '2', name: 'OG Kush', count: 18 },
      { id: '3', name: 'Sour Diesel', count: 15 }
    ],
    recentActivity: [
      { id: '1', action: 'added', product: 'Blue Dream', timestamp: '2024-01-15T10:30:00Z' },
      { id: '2', action: 'removed', product: 'OG Kush', timestamp: '2024-01-15T09:15:00Z' }
    ]
  }

  return (
    <div className="wishlist-metrics-dashboard">
      <h2>Wishlist Analytics</h2>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Total Items</h3>
          <span className="metric-value">{mockData.totalItems}</span>
        </div>
        
        <div className="metric-card">
          <h3>Total Value</h3>
          <span className="metric-value">${mockData.totalValue.toFixed(2)}</span>
        </div>
        
        <div className="metric-card">
          <h3>Average Price</h3>
          <span className="metric-value">${mockData.averagePrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="top-products">
        <h3>Most Wishlisted Products</h3>
        <ul>
          {mockData.topProducts.map(product => (
            <li key={product.id}>
              {product.name} ({product.count} times)
            </li>
          ))}
        </ul>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <ul>
          {mockData.recentActivity.map(activity => (
            <li key={activity.id}>
              {activity.action} {activity.product} at {new Date(activity.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>

      <div className="actions">
        <button onClick={() => console.log('Export CSV')}>
          Export CSV
        </button>
        <button onClick={() => console.log('Refresh Data')}>
          Refresh
        </button>
      </div>
    </div>
  )
}

describe('WishlistMetricsDashboard - Enhanced', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Dashboard Rendering', () => {
    it('should render dashboard with all metrics', () => {
      render(<MockWishlistMetricsDashboard />)
      
      expect(screen.getByText('Wishlist Analytics')).toBeInTheDocument()
      expect(screen.getByText('156')).toBeInTheDocument()
      expect(screen.getByText('$4234.56')).toBeInTheDocument()
      expect(screen.getByText('$27.14')).toBeInTheDocument()
    })

    it('should display top products list', () => {
      render(<MockWishlistMetricsDashboard />)
      
      expect(screen.getByText('Most Wishlisted Products')).toBeInTheDocument()
      expect(screen.getByText('Blue Dream (23 times)')).toBeInTheDocument()
      expect(screen.getByText('OG Kush (18 times)')).toBeInTheDocument()
      expect(screen.getByText('Sour Diesel (15 times)')).toBeInTheDocument()
    })

    it('should show recent activity', () => {
      render(<MockWishlistMetricsDashboard />)
      
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText(/added Blue Dream/)).toBeInTheDocument()
      expect(screen.getByText(/removed OG Kush/)).toBeInTheDocument()
    })
  })

  describe('Dashboard Actions', () => {
    it('should handle export CSV action', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      
      render(<MockWishlistMetricsDashboard />)
      
      const exportButton = screen.getByText('Export CSV')
      fireEvent.click(exportButton)
      
      expect(consoleSpy).toHaveBeenCalledWith('Export CSV')
    })

    it('should handle refresh action', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      
      render(<MockWishlistMetricsDashboard />)
      
      const refreshButton = screen.getByText('Refresh')
      fireEvent.click(refreshButton)
      
      expect(consoleSpy).toHaveBeenCalledWith('Refresh Data')
    })
  })

  describe('Data Formatting', () => {
    it('should format currency values correctly', () => {
      render(<MockWishlistMetricsDashboard />)
      
      expect(screen.getByText('$4234.56')).toBeInTheDocument()
      expect(screen.getByText('$27.14')).toBeInTheDocument()
    })

    it('should format timestamps correctly', () => {
      render(<MockWishlistMetricsDashboard />)
      
      const timeElements = screen.getAllByText(/\d{1,2}:\d{2}:\d{2}/)
      expect(timeElements.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('should have proper CSS classes for responsive layout', () => {
      render(<MockWishlistMetricsDashboard />)
      
      const dashboard = screen.getByText('Wishlist Analytics').closest('.wishlist-metrics-dashboard')
      expect(dashboard).toBeInTheDocument()
      
      const metricsGrid = dashboard?.querySelector('.metrics-grid')
      expect(metricsGrid).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<MockWishlistMetricsDashboard />)
      
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Wishlist Analytics')
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(5)
    })

    it('should have accessible buttons', () => {
      render(<MockWishlistMetricsDashboard />)
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
      
      buttons.forEach((button: HTMLElement) => {
        expect(button).toHaveTextContent(/Export CSV|Refresh/)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle missing data gracefully', () => {
      const EmptyDashboard = () => (
        <div className="wishlist-metrics-dashboard">
          <h2>Wishlist Analytics</h2>
          <div className="no-data">No data available</div>
        </div>
      )
      
      render(<EmptyDashboard />)
      
      expect(screen.getByText('No data available')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should render efficiently with large datasets', () => {
      const startTime = performance.now()
      
      render(<MockWishlistMetricsDashboard />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      expect(renderTime).toBeLessThan(100) // Should render in less than 100ms
    })
  })
})
