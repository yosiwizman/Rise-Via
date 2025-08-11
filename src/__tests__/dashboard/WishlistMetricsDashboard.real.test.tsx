import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test-utils'
import { WishlistMetricsDashboard } from '../../dashboard/WishlistMetricsDashboard'

vi.mock('../../analytics/wishlistAnalytics', () => ({
  wishlistAnalytics: {
    getMetrics: vi.fn(() => ({
      addToWishlistEvents: 150,
      removeFromWishlistEvents: 25,
      shareEvents: 12,
      conversionEvents: 18,
      importEvents: 5,
      priceAlertConversions: 8,
      topCategories: [
        { category: 'flower', count: 85 },
        { category: 'edibles', count: 42 },
        { category: 'concentrates', count: 23 }
      ]
    })),
    calculateReturnVisitorRate: vi.fn(() => 65.4),
    calculateAverageItemsPerWishlist: vi.fn(() => 4.2),
    generateDailyReport: vi.fn(() => ({
      date: '2024-01-15',
      totalEvents: 45,
      addEvents: 28,
      removeEvents: 8,
      shareEvents: 3,
      conversionRate: 12.5
    }))
  }
}))

vi.mock('../../services/priceTracking', () => ({
  priceTrackingService: {
    getAlertStats: vi.fn(() => ({
      activeAlerts: 234,
      triggeredToday: 12,
      averageResponseTime: 2.3
    }))
  }
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>
  }
}))

describe('WishlistMetricsDashboard - Real Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', async () => {
    const { wishlistAnalytics } = await import('../../analytics/wishlistAnalytics')
    vi.mocked(wishlistAnalytics.getMetrics).mockImplementationOnce(() => {
      throw new Error('Loading...')
    })

    render(<WishlistMetricsDashboard />)
    
    const loadingElement = document.querySelector('.animate-spin')
    expect(loadingElement).toBeTruthy()
  })

  it('should render dashboard with metrics after loading', async () => {
    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Wishlist Analytics Dashboard')).toBeInTheDocument()
    })

    expect(screen.getByText('Return Visitor Rate')).toBeInTheDocument()
    expect(screen.getByText('65.4%')).toBeInTheDocument()
    expect(screen.getByText('Wishlist Conversion')).toBeInTheDocument()
    expect(screen.getByText('Average Items')).toBeInTheDocument()
    const averageItemsElements = screen.getAllByText('4.2')
    expect(averageItemsElements.length).toBeGreaterThan(0)
  })

  it('should display activity summary correctly', async () => {
    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Activity Summary')).toBeInTheDocument()
    })

    expect(screen.getByText('150')).toBeInTheDocument() // addToWishlistEvents
    expect(screen.getByText('25')).toBeInTheDocument()  // removeFromWishlistEvents
    expect(screen.getByText('5')).toBeInTheDocument()   // importEvents
    expect(screen.getByText('18')).toBeInTheDocument()  // conversionEvents
  })

  it('should show top categories with progress bars', async () => {
    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Top Categories')).toBeInTheDocument()
    })

    expect(screen.getByText('flower')).toBeInTheDocument()
    expect(screen.getByText('85')).toBeInTheDocument()
    expect(screen.getByText('edibles')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('concentrates')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()
  })

  it('should display price alert performance when available', async () => {
    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Price Alert Performance')).toBeInTheDocument()
    })

    expect(screen.getByText('234')).toBeInTheDocument() // activeAlerts
    const triggeredTodayElements = screen.getAllByText('12')
    expect(triggeredTodayElements.length).toBeGreaterThan(0) // triggeredToday (may appear multiple times)
    const priceAlertElements = screen.getAllByText('8')
    expect(priceAlertElements.length).toBeGreaterThan(0) // priceAlertConversions (may appear multiple times)
    expect(screen.getByText('2.3s')).toBeInTheDocument() // averageResponseTime
  })

  it('should show daily report when available', async () => {
    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/Today's Report - 2024-01-15/)).toBeInTheDocument()
    })

    expect(screen.getByText('45')).toBeInTheDocument()   // totalEvents
    expect(screen.getByText('28')).toBeInTheDocument()   // addEvents
    const removeEventsElements = screen.getAllByText('8')
    expect(removeEventsElements.length).toBeGreaterThan(0) // removeEvents (may appear multiple times)
    expect(screen.getByText('3')).toBeInTheDocument()    // shareEvents
    expect(screen.getByText('12.5%')).toBeInTheDocument() // conversionRate
  })

  it('should handle refresh button click', async () => {
    const { wishlistAnalytics } = await import('../../analytics/wishlistAnalytics')
    
    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument()
    })

    const refreshButton = screen.getByText('Refresh')
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(vi.mocked(wishlistAnalytics.getMetrics)).toHaveBeenCalledTimes(2)
    })
  })

  it('should calculate conversion rate correctly', async () => {
    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Wishlist Conversion')).toBeInTheDocument()
    })

    expect(screen.getByText('12.0%')).toBeInTheDocument()
  })

  it('should handle zero conversion rate', async () => {
    const { wishlistAnalytics } = await import('../../analytics/wishlistAnalytics')
    vi.mocked(wishlistAnalytics.getMetrics).mockReturnValueOnce({
      addToWishlistEvents: 0,
      removeFromWishlistEvents: 0,
      shareEvents: 0,
      conversionEvents: 0,
      importEvents: 0,
      priceAlertConversions: 0,
      topCategories: [],
      totalItems: 0,
      totalValue: 0,
      averagePrice: 0,
      categoryBreakdown: {}
    } as unknown as ReturnType<typeof wishlistAnalytics.getMetrics>)

    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument()
    })
  })

  it('should show empty state for categories when no data', async () => {
    const { wishlistAnalytics } = await import('../../analytics/wishlistAnalytics')
    vi.mocked(wishlistAnalytics.getMetrics).mockReturnValueOnce({
      addToWishlistEvents: 10,
      removeFromWishlistEvents: 2,
      shareEvents: 1,
      conversionEvents: 1,
      importEvents: 0,
      priceAlertConversions: 0,
      topCategories: [],
      totalItems: 10,
      totalValue: 100,
      averagePrice: 10,
      categoryBreakdown: {}
    } as unknown as ReturnType<typeof wishlistAnalytics.getMetrics>)

    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('No category data available yet')).toBeInTheDocument()
    })
  })

  it('should handle error in loading metrics', async () => {
    const { wishlistAnalytics } = await import('../../analytics/wishlistAnalytics')
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(wishlistAnalytics.getMetrics).mockImplementationOnce(() => {
      throw new Error('Analytics service unavailable')
    })

    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error loading metrics:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should display business impact summary', async () => {
    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('🎯 Business Impact Summary')).toBeInTheDocument()
    })

    expect(screen.getByText('+65%')).toBeInTheDocument() // Return visitor rate
    expect(screen.getByText('+12.0%')).toBeInTheDocument() // Conversion rate
    const averageItemsElements = screen.getAllByText('4.2')
    expect(averageItemsElements.length).toBeGreaterThan(0) // Average items (may appear multiple times)
  })

  it('should update last updated timestamp', async () => {
    render(<WishlistMetricsDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })

    const timestampElement = screen.getByText(/Last updated:/)
    expect(timestampElement).toBeInTheDocument()
  })
})
