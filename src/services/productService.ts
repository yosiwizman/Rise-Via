import { sql } from '../lib/neon'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  in_stock: boolean
  created_at: string
  updated_at: string
}

export interface CreateProductData {
  name: string
  description: string
  price: number
  images?: string[]
  category: string
  in_stock?: boolean
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE in_stock = true
        ORDER BY created_at DESC
      `
      return (products || []) as Product[]
    } catch (error) {
      return []
    }
  },

  async getProduct(productId: string): Promise<Product | null> {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE id = ${productId}
      `
      return products.length > 0 ? products[0] as Product : null
    } catch (error) {
      return null
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE category = ${category} AND in_stock = true
        ORDER BY created_at DESC
      `
      return (products || []) as Product[]
    } catch (error) {
      return []
    }
  },

  async createProduct(productData: CreateProductData): Promise<Product | null> {
    try {
      const products = await sql`
        INSERT INTO products (name, description, price, images, category, in_stock)
        VALUES (
          ${productData.name}, 
          ${productData.description}, 
          ${productData.price}, 
          ${JSON.stringify(productData.images || [])}, 
          ${productData.category}, 
          ${productData.in_stock !== false}
        )
        RETURNING *
      `
      return products.length > 0 ? products[0] as Product : null
    } catch (error) {
      return null
    }
  },

  async updateProduct(productId: string, updates: Partial<CreateProductData>): Promise<Product | null> {
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => {
          if (key === 'images') {
            return `images = $${index + 2}`
          }
          return `${key} = $${index + 2}`
        })
        .join(', ')

      if (!setClause) return null

      const products = await sql`
        UPDATE products 
        SET ${setClause}, updated_at = NOW()
        WHERE id = ${productId}
        RETURNING *
      `
      return products.length > 0 ? products[0] as Product : null
    } catch (error) {
      return null
    }
  },

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      await sql`
        UPDATE products 
        SET in_stock = false, updated_at = NOW()
        WHERE id = ${productId}
      `
      return true
    } catch (error) {
      return false
    }
  },

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const products = await sql`
        SELECT * FROM products 
        WHERE (name ILIKE ${'%' + query + '%'} OR description ILIKE ${'%' + query + '%'})
        AND in_stock = true
        ORDER BY created_at DESC
      `
      return (products || []) as Product[]
    } catch (error) {
      return []
    }
  },
}
