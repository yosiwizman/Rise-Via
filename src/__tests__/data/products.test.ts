import { describe, it, expect } from 'vitest'

const mockProducts = [
  {
    id: 'blue-dream',
    name: 'Blue Dream',
    price: 29.99,
    category: 'Flower',
    thc: '22%',
    type: 'Hybrid',
    effects: ['Relaxed', 'Happy', 'Euphoric'],
    description: 'A balanced hybrid strain with sweet berry aroma',
    image: '/images/blue-dream.jpg',
    inventory: 50,
    active: true
  },
  {
    id: 'og-kush',
    name: 'OG Kush',
    price: 34.99,
    category: 'Flower',
    thc: '25%',
    type: 'Indica',
    effects: ['Relaxed', 'Sleepy', 'Hungry'],
    description: 'Classic indica strain with earthy pine flavors',
    image: '/images/og-kush.jpg',
    inventory: 25,
    active: true
  },
  {
    id: 'sour-diesel',
    name: 'Sour Diesel',
    price: 32.99,
    category: 'Flower',
    thc: '20%',
    type: 'Sativa',
    effects: ['Energetic', 'Creative', 'Uplifted'],
    description: 'Energizing sativa with diesel-like aroma',
    image: '/images/sour-diesel.jpg',
    inventory: 0,
    active: false
  }
]

const getProductById = (id: string) => {
  return mockProducts.find(product => product.id === id)
}

const getProductsByCategory = (category: string) => {
  return mockProducts.filter(product => product.category === category)
}

const getProductsByType = (type: string) => {
  return mockProducts.filter(product => product.type === type)
}

const getActiveProducts = () => {
  return mockProducts.filter(product => product.active)
}

const getInStockProducts = () => {
  return mockProducts.filter(product => product.inventory > 0)
}

const getAvailableProducts = () => {
  return mockProducts.filter(product => product.active && product.inventory > 0)
}

const calculateProductDiscount = (originalPrice: number, discountPercent: number) => {
  return originalPrice * (1 - discountPercent / 100)
}

const formatPrice = (price: number) => {
  return `$${price.toFixed(2)}`
}

const calculateTax = (price: number, taxRate: number = 0.08) => {
  return price * taxRate
}

const calculateTotal = (price: number, taxRate: number = 0.08) => {
  return price + calculateTax(price, taxRate)
}

const sortProductsByPrice = (products: typeof mockProducts, ascending: boolean = true) => {
  return [...products].sort((a, b) => {
    return ascending ? a.price - b.price : b.price - a.price
  })
}

const filterProductsByPriceRange = (products: typeof mockProducts, minPrice: number, maxPrice: number) => {
  return products.filter(product => product.price >= minPrice && product.price <= maxPrice)
}

const searchProducts = (products: typeof mockProducts, query: string) => {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.effects.some(effect => effect.toLowerCase().includes(lowercaseQuery))
  )
}

describe('Product Data and Utilities', () => {
  describe('getProductById', () => {
    it('should return product when ID exists', () => {
      const product = getProductById('blue-dream')
      expect(product).toBeDefined()
      expect(product?.name).toBe('Blue Dream')
    })

    it('should return undefined when ID does not exist', () => {
      const product = getProductById('non-existent')
      expect(product).toBeUndefined()
    })

    it('should handle empty string ID', () => {
      const product = getProductById('')
      expect(product).toBeUndefined()
    })
  })

  describe('getProductsByCategory', () => {
    it('should return products in specified category', () => {
      const products = getProductsByCategory('Flower')
      expect(products).toHaveLength(3)
      expect(products.every(p => p.category === 'Flower')).toBe(true)
    })

    it('should return empty array for non-existent category', () => {
      const products = getProductsByCategory('Edibles')
      expect(products).toHaveLength(0)
    })

    it('should be case sensitive', () => {
      const products = getProductsByCategory('flower')
      expect(products).toHaveLength(0)
    })
  })

  describe('getProductsByType', () => {
    it('should return hybrid products', () => {
      const products = getProductsByType('Hybrid')
      expect(products).toHaveLength(1)
      expect(products[0].name).toBe('Blue Dream')
    })

    it('should return indica products', () => {
      const products = getProductsByType('Indica')
      expect(products).toHaveLength(1)
      expect(products[0].name).toBe('OG Kush')
    })

    it('should return sativa products', () => {
      const products = getProductsByType('Sativa')
      expect(products).toHaveLength(1)
      expect(products[0].name).toBe('Sour Diesel')
    })
  })

  describe('getActiveProducts', () => {
    it('should return only active products', () => {
      const products = getActiveProducts()
      expect(products).toHaveLength(2)
      expect(products.every(p => p.active)).toBe(true)
    })

    it('should exclude inactive products', () => {
      const products = getActiveProducts()
      expect(products.find(p => p.name === 'Sour Diesel')).toBeUndefined()
    })
  })

  describe('getInStockProducts', () => {
    it('should return only products with inventory', () => {
      const products = getInStockProducts()
      expect(products).toHaveLength(2)
      expect(products.every(p => p.inventory > 0)).toBe(true)
    })

    it('should exclude out of stock products', () => {
      const products = getInStockProducts()
      expect(products.find(p => p.inventory === 0)).toBeUndefined()
    })
  })

  describe('getAvailableProducts', () => {
    it('should return products that are both active and in stock', () => {
      const products = getAvailableProducts()
      expect(products).toHaveLength(2)
      expect(products.every(p => p.active && p.inventory > 0)).toBe(true)
    })

    it('should exclude inactive or out of stock products', () => {
      const products = getAvailableProducts()
      expect(products.find(p => !p.active || p.inventory === 0)).toBeUndefined()
    })
  })

  describe('calculateProductDiscount', () => {
    it('should calculate 10% discount correctly', () => {
      const discounted = calculateProductDiscount(100, 10)
      expect(discounted).toBe(90)
    })

    it('should calculate 25% discount correctly', () => {
      const discounted = calculateProductDiscount(29.99, 25)
      expect(discounted).toBeCloseTo(22.49, 2)
    })

    it('should handle 0% discount', () => {
      const discounted = calculateProductDiscount(50, 0)
      expect(discounted).toBe(50)
    })

    it('should handle 100% discount', () => {
      const discounted = calculateProductDiscount(50, 100)
      expect(discounted).toBe(0)
    })
  })

  describe('formatPrice', () => {
    it('should format whole numbers with decimals', () => {
      expect(formatPrice(30)).toBe('$30.00')
    })

    it('should format decimal prices correctly', () => {
      expect(formatPrice(29.99)).toBe('$29.99')
    })

    it('should handle single decimal places', () => {
      expect(formatPrice(25.5)).toBe('$25.50')
    })

    it('should handle zero price', () => {
      expect(formatPrice(0)).toBe('$0.00')
    })
  })

  describe('calculateTax', () => {
    it('should calculate 8% tax by default', () => {
      const tax = calculateTax(100)
      expect(tax).toBe(8)
    })

    it('should calculate custom tax rate', () => {
      const tax = calculateTax(100, 0.10)
      expect(tax).toBe(10)
    })

    it('should handle zero tax rate', () => {
      const tax = calculateTax(100, 0)
      expect(tax).toBe(0)
    })
  })

  describe('calculateTotal', () => {
    it('should calculate total with default tax', () => {
      const total = calculateTotal(100)
      expect(total).toBe(108)
    })

    it('should calculate total with custom tax', () => {
      const total = calculateTotal(100, 0.10)
      expect(total).toBe(110)
    })

    it('should handle decimal prices', () => {
      const total = calculateTotal(29.99, 0.08)
      expect(total).toBeCloseTo(32.39, 2)
    })
  })

  describe('sortProductsByPrice', () => {
    it('should sort products by price ascending by default', () => {
      const sorted = sortProductsByPrice(mockProducts)
      expect(sorted[0].price).toBe(29.99)
      expect(sorted[1].price).toBe(32.99)
      expect(sorted[2].price).toBe(34.99)
    })

    it('should sort products by price descending', () => {
      const sorted = sortProductsByPrice(mockProducts, false)
      expect(sorted[0].price).toBe(34.99)
      expect(sorted[1].price).toBe(32.99)
      expect(sorted[2].price).toBe(29.99)
    })

    it('should not mutate original array', () => {
      const originalOrder = [...mockProducts]
      sortProductsByPrice(mockProducts)
      expect(mockProducts).toEqual(originalOrder)
    })
  })

  describe('filterProductsByPriceRange', () => {
    it('should filter products within price range', () => {
      const filtered = filterProductsByPriceRange(mockProducts, 30, 35)
      expect(filtered).toHaveLength(2)
      expect(filtered.every(p => p.price >= 30 && p.price <= 35)).toBe(true)
    })

    it('should return empty array when no products in range', () => {
      const filtered = filterProductsByPriceRange(mockProducts, 50, 60)
      expect(filtered).toHaveLength(0)
    })

    it('should include products at exact boundaries', () => {
      const filtered = filterProductsByPriceRange(mockProducts, 29.99, 34.99)
      expect(filtered).toHaveLength(3)
    })
  })

  describe('searchProducts', () => {
    it('should find products by name', () => {
      const results = searchProducts(mockProducts, 'Blue')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Blue Dream')
    })

    it('should find products by description', () => {
      const results = searchProducts(mockProducts, 'balanced')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Blue Dream')
    })

    it('should find products by effects', () => {
      const results = searchProducts(mockProducts, 'relaxed')
      expect(results).toHaveLength(2)
    })

    it('should be case insensitive', () => {
      const results = searchProducts(mockProducts, 'BLUE')
      expect(results).toHaveLength(1)
      expect(results[0].name).toBe('Blue Dream')
    })

    it('should return empty array for no matches', () => {
      const results = searchProducts(mockProducts, 'nonexistent')
      expect(results).toHaveLength(0)
    })

    it('should handle empty search query', () => {
      const results = searchProducts(mockProducts, '')
      expect(results).toHaveLength(3)
    })
  })

  describe('product data integrity', () => {
    it('should have valid product structure', () => {
      mockProducts.forEach(product => {
        expect(product).toHaveProperty('id')
        expect(product).toHaveProperty('name')
        expect(product).toHaveProperty('price')
        expect(product).toHaveProperty('category')
        expect(product).toHaveProperty('thc')
        expect(product).toHaveProperty('type')
        expect(product).toHaveProperty('effects')
        expect(product).toHaveProperty('description')
        expect(product).toHaveProperty('image')
        expect(product).toHaveProperty('inventory')
        expect(product).toHaveProperty('active')
      })
    })

    it('should have valid price values', () => {
      mockProducts.forEach(product => {
        expect(typeof product.price).toBe('number')
        expect(product.price).toBeGreaterThan(0)
      })
    })

    it('should have valid inventory values', () => {
      mockProducts.forEach(product => {
        expect(typeof product.inventory).toBe('number')
        expect(product.inventory).toBeGreaterThanOrEqual(0)
      })
    })

    it('should have valid THC percentages', () => {
      mockProducts.forEach(product => {
        expect(product.thc).toMatch(/^\d+%$/)
      })
    })

    it('should have valid product types', () => {
      const validTypes = ['Sativa', 'Indica', 'Hybrid']
      mockProducts.forEach(product => {
        expect(validTypes).toContain(product.type)
      })
    })
  })
})
