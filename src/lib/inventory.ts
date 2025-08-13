/**
 * Inventory Management Library
 * Handles real-time stock tracking, reservations, and inventory operations
 */

import { sql } from './neon';

export interface InventoryItem {
  id: string;
  product_id: string;
  sku: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_sold: number;
  reorder_point: number;
  reorder_quantity: number;
  cost_per_unit: number;
  location: string;
  batch_number?: string;
  expiration_date?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryReservation {
  id: string;
  product_id: string;
  quantity: number;
  reserved_for: string; // order_id or customer_id
  reservation_type: 'order' | 'cart' | 'manual';
  expires_at: string;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment' | 'reserved' | 'released';
  quantity: number;
  reference_id?: string; // order_id, purchase_order_id, etc.
  reference_type?: string;
  reason: string;
  cost_per_unit?: number;
  created_by: string;
  created_at: string;
}

export interface StockAlert {
  id: string;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  acknowledged: boolean;
  created_at: string;
}

/**
 * Initialize inventory tables
 */
export async function initializeInventoryTables(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping inventory table initialization');
      return;
    }

    // Inventory items table
    await sql`
      CREATE TABLE IF NOT EXISTS inventory_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE NOT NULL,
        quantity_available INTEGER NOT NULL DEFAULT 0,
        quantity_reserved INTEGER NOT NULL DEFAULT 0,
        quantity_sold INTEGER NOT NULL DEFAULT 0,
        reorder_point INTEGER DEFAULT 10,
        reorder_quantity INTEGER DEFAULT 50,
        cost_per_unit DECIMAL(10,2),
        location VARCHAR(100) DEFAULT 'main_warehouse',
        batch_number VARCHAR(100),
        expiration_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Inventory reservations table
    await sql`
      CREATE TABLE IF NOT EXISTS inventory_reservations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        reserved_for VARCHAR(255) NOT NULL,
        reservation_type VARCHAR(20) DEFAULT 'cart',
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Inventory movements table
    await sql`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id VARCHAR(255) NOT NULL,
        movement_type VARCHAR(20) NOT NULL,
        quantity INTEGER NOT NULL,
        reference_id VARCHAR(255),
        reference_type VARCHAR(50),
        reason TEXT NOT NULL,
        cost_per_unit DECIMAL(10,2),
        created_by VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Stock alerts table
    await sql`
      CREATE TABLE IF NOT EXISTS stock_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id VARCHAR(255) NOT NULL,
        alert_type VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        severity VARCHAR(10) DEFAULT 'medium',
        acknowledged BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_items_product_id ON inventory_items(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(sku)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_reservations_product_id ON inventory_reservations(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_reservations_reserved_for ON inventory_reservations(reserved_for)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_id ON stock_alerts(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_stock_alerts_acknowledged ON stock_alerts(acknowledged)`;

    console.log('✅ Inventory tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize inventory tables:', error);
  }
}

/**
 * Get current stock level for a product
 */
export async function getProductStock(productId: string): Promise<{
  available: number;
  reserved: number;
  total: number;
} | null> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return null;
    }

    const inventory = await sql`
      SELECT 
        COALESCE(SUM(quantity_available), 0) as available,
        COALESCE(SUM(quantity_reserved), 0) as reserved
      FROM inventory_items 
      WHERE product_id = ${productId}
    ` as Array<{ available: number; reserved: number }>;

    if (inventory.length === 0) {
      return { available: 0, reserved: 0, total: 0 };
    }

    const stock = inventory[0];
    return {
      available: stock.available,
      reserved: stock.reserved,
      total: stock.available + stock.reserved
    };
  } catch (error) {
    console.error('Failed to get product stock:', error);
    return null;
  }
}

/**
 * Reserve inventory for an order or cart
 */
export async function reserveInventory(
  productId: string,
  quantity: number,
  reservedFor: string,
  reservationType: 'order' | 'cart' | 'manual' = 'cart',
  expirationMinutes: number = 30
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sql) {
      return { success: false, error: 'Database not available' };
    }

    // Check available stock
    const stock = await getProductStock(productId);
    if (!stock || stock.available < quantity) {
      return { success: false, error: 'Insufficient stock available' };
    }

    // Create reservation
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
    
    await sql`
      INSERT INTO inventory_reservations (product_id, quantity, reserved_for, reservation_type, expires_at)
      VALUES (${productId}, ${quantity}, ${reservedFor}, ${reservationType}, ${expiresAt.toISOString()})
    `;

    // Update inventory quantities
    await sql`
      UPDATE inventory_items 
      SET quantity_available = quantity_available - ${quantity},
          quantity_reserved = quantity_reserved + ${quantity},
          updated_at = NOW()
      WHERE product_id = ${productId}
    `;

    // Log movement
    await logInventoryMovement(
      productId,
      'reserved',
      quantity,
      reservedFor,
      reservationType,
      `Reserved for ${reservationType}`,
      'system'
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to reserve inventory:', error);
    return { success: false, error: 'Failed to reserve inventory' };
  }
}

/**
 * Release inventory reservation
 */
export async function releaseReservation(
  productId: string,
  reservedFor: string,
  quantity?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sql) {
      return { success: false, error: 'Database not available' };
    }

    // Get reservations to release
    const reservations = await sql`
      SELECT * FROM inventory_reservations 
      WHERE product_id = ${productId} AND reserved_for = ${reservedFor}
      ${quantity ? sql`AND quantity = ${quantity}` : sql``}
    ` as Array<InventoryReservation>;

    if (reservations.length === 0) {
      return { success: false, error: 'No reservations found' };
    }

    const totalQuantity = reservations.reduce((sum, res) => sum + res.quantity, 0);

    // Remove reservations
    await sql`
      DELETE FROM inventory_reservations 
      WHERE product_id = ${productId} AND reserved_for = ${reservedFor}
      ${quantity ? sql`AND quantity = ${quantity}` : sql``}
    `;

    // Update inventory quantities
    await sql`
      UPDATE inventory_items 
      SET quantity_available = quantity_available + ${totalQuantity},
          quantity_reserved = quantity_reserved - ${totalQuantity},
          updated_at = NOW()
      WHERE product_id = ${productId}
    `;

    // Log movement
    await logInventoryMovement(
      productId,
      'released',
      totalQuantity,
      reservedFor,
      'reservation',
      'Released reservation',
      'system'
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to release reservation:', error);
    return { success: false, error: 'Failed to release reservation' };
  }
}

/**
 * Fulfill order (convert reservation to sale)
 */
export async function fulfillOrder(
  productId: string,
  quantity: number,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sql) {
      return { success: false, error: 'Database not available' };
    }

    // Check if reservation exists
    const reservations = await sql`
      SELECT * FROM inventory_reservations 
      WHERE product_id = ${productId} AND reserved_for = ${orderId}
    ` as Array<InventoryReservation>;

    const reservedQuantity = reservations.reduce((sum, res) => sum + res.quantity, 0);

    if (reservedQuantity < quantity) {
      return { success: false, error: 'Insufficient reserved quantity' };
    }

    // Remove reservation
    await sql`
      DELETE FROM inventory_reservations 
      WHERE product_id = ${productId} AND reserved_for = ${orderId}
    `;

    // Update inventory quantities
    await sql`
      UPDATE inventory_items 
      SET quantity_reserved = quantity_reserved - ${quantity},
          quantity_sold = quantity_sold + ${quantity},
          updated_at = NOW()
      WHERE product_id = ${productId}
    `;

    // Log movement
    await logInventoryMovement(
      productId,
      'out',
      quantity,
      orderId,
      'order',
      'Order fulfillment',
      'system'
    );

    // Check for low stock alerts
    await checkStockAlerts(productId);

    return { success: true };
  } catch (error) {
    console.error('Failed to fulfill order:', error);
    return { success: false, error: 'Failed to fulfill order' };
  }
}

/**
 * Add inventory (receiving stock)
 */
export async function addInventory(
  productId: string,
  sku: string,
  quantity: number,
  costPerUnit: number,
  reason: string,
  createdBy: string,
  batchNumber?: string,
  expirationDate?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sql) {
      return { success: false, error: 'Database not available' };
    }

    // Check if inventory item exists
    const existingItems = await sql`
      SELECT * FROM inventory_items WHERE product_id = ${productId} AND sku = ${sku}
    ` as Array<InventoryItem>;

    if (existingItems.length > 0) {
      // Update existing item
      await sql`
        UPDATE inventory_items 
        SET quantity_available = quantity_available + ${quantity},
            cost_per_unit = ${costPerUnit},
            updated_at = NOW()
        WHERE product_id = ${productId} AND sku = ${sku}
      `;
    } else {
      // Create new inventory item
      await sql`
        INSERT INTO inventory_items (
          product_id, sku, quantity_available, cost_per_unit, 
          batch_number, expiration_date
        )
        VALUES (
          ${productId}, ${sku}, ${quantity}, ${costPerUnit},
          ${batchNumber || null}, ${expirationDate || null}
        )
      `;
    }

    // Log movement
    await logInventoryMovement(
      productId,
      'in',
      quantity,
      null,
      'receiving',
      reason,
      createdBy,
      costPerUnit
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to add inventory:', error);
    return { success: false, error: 'Failed to add inventory' };
  }
}

/**
 * Adjust inventory (manual adjustment)
 */
export async function adjustInventory(
  productId: string,
  quantityChange: number,
  reason: string,
  createdBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!sql) {
      return { success: false, error: 'Database not available' };
    }

    // Update inventory
    await sql`
      UPDATE inventory_items 
      SET quantity_available = quantity_available + ${quantityChange},
          updated_at = NOW()
      WHERE product_id = ${productId}
    `;

    // Log movement
    await logInventoryMovement(
      productId,
      'adjustment',
      Math.abs(quantityChange),
      null,
      'adjustment',
      reason,
      createdBy
    );

    // Check for alerts
    await checkStockAlerts(productId);

    return { success: true };
  } catch (error) {
    console.error('Failed to adjust inventory:', error);
    return { success: false, error: 'Failed to adjust inventory' };
  }
}

/**
 * Log inventory movement
 */
async function logInventoryMovement(
  productId: string,
  movementType: InventoryMovement['movement_type'],
  quantity: number,
  referenceId: string | null,
  referenceType: string | null,
  reason: string,
  createdBy: string,
  costPerUnit?: number
): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping inventory movement log');
      return;
    }

    await sql`
      INSERT INTO inventory_movements (
        product_id, movement_type, quantity, reference_id, 
        reference_type, reason, cost_per_unit, created_by
      )
      VALUES (
        ${productId}, ${movementType}, ${quantity}, ${referenceId},
        ${referenceType}, ${reason}, ${costPerUnit || null}, ${createdBy}
      )
    `;
  } catch (error) {
    console.error('Failed to log inventory movement:', error);
  }
}

/**
 * Check and create stock alerts
 */
export async function checkStockAlerts(productId: string): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping stock alerts check');
      return;
    }

    const inventory = await sql`
      SELECT * FROM inventory_items WHERE product_id = ${productId}
    ` as Array<InventoryItem>;

    if (inventory.length === 0) return;

    const item = inventory[0];
    const alerts: Array<{ type: StockAlert['alert_type']; message: string; severity: StockAlert['severity'] }> = [];

    // Check for low stock
    if (item.quantity_available <= item.reorder_point && item.quantity_available > 0) {
      alerts.push({
        type: 'low_stock',
        message: `Low stock alert: ${item.quantity_available} units remaining (reorder point: ${item.reorder_point})`,
        severity: 'medium'
      });
    }

    // Check for out of stock
    if (item.quantity_available <= 0) {
      alerts.push({
        type: 'out_of_stock',
        message: 'Product is out of stock',
        severity: 'high'
      });
    }

    // Check for expiring items
    if (item.expiration_date) {
      const expirationDate = new Date(item.expiration_date);
      const now = new Date();
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiration <= 0) {
        alerts.push({
          type: 'expired',
          message: `Product has expired (expiration date: ${item.expiration_date})`,
          severity: 'critical'
        });
      } else if (daysUntilExpiration <= 7) {
        alerts.push({
          type: 'expiring_soon',
          message: `Product expires in ${daysUntilExpiration} days`,
          severity: 'medium'
        });
      }
    }

    // Create alerts that don't already exist
    for (const alert of alerts) {
      const existingAlerts = await sql`
        SELECT id FROM stock_alerts 
        WHERE product_id = ${productId} 
        AND alert_type = ${alert.type} 
        AND acknowledged = false
      `;

      if (existingAlerts.length === 0) {
        await sql`
          INSERT INTO stock_alerts (product_id, alert_type, message, severity)
          VALUES (${productId}, ${alert.type}, ${alert.message}, ${alert.severity})
        `;
      }
    }
  } catch (error) {
    console.error('Failed to check stock alerts:', error);
  }
}

/**
 * Clean up expired reservations
 */
export async function cleanupExpiredReservations(): Promise<void> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available, skipping reservation cleanup');
      return;
    }

    // Get expired reservations
    const expiredReservations = await sql`
      SELECT * FROM inventory_reservations 
      WHERE expires_at < NOW()
    ` as Array<InventoryReservation>;

    for (const reservation of expiredReservations) {
      await releaseReservation(reservation.product_id, reservation.reserved_for, reservation.quantity);
    }

    console.log(`Cleaned up ${expiredReservations.length} expired reservations`);
  } catch (error) {
    console.error('Failed to cleanup expired reservations:', error);
  }
}

/**
 * Get inventory analytics
 */
export async function getInventoryAnalytics(): Promise<{
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  topMovingProducts: Array<{ product_id: string; quantity_sold: number }>;
}> {
  try {
    if (!sql) {
      console.warn('⚠️ Database not available');
      return {
        totalProducts: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        topMovingProducts: []
      };
    }

    // Get overall stats
    const overallStats = await sql`
      SELECT 
        COUNT(*) as total_products,
        SUM(quantity_available * cost_per_unit) as total_value,
        COUNT(CASE WHEN quantity_available <= reorder_point AND quantity_available > 0 THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN quantity_available <= 0 THEN 1 END) as out_of_stock_items
      FROM inventory_items
    ` as Array<{
      total_products: number;
      total_value: number;
      low_stock_items: number;
      out_of_stock_items: number;
    }>;

    // Get top moving products
    const topMovingProducts = await sql`
      SELECT product_id, SUM(quantity_sold) as quantity_sold
      FROM inventory_items
      GROUP BY product_id
      ORDER BY quantity_sold DESC
      LIMIT 10
    ` as Array<{ product_id: string; quantity_sold: number }>;

    const stats = overallStats[0] || {
      total_products: 0,
      total_value: 0,
      low_stock_items: 0,
      out_of_stock_items: 0
    };

    return {
      totalProducts: stats.total_products,
      totalValue: stats.total_value || 0,
      lowStockItems: stats.low_stock_items,
      outOfStockItems: stats.out_of_stock_items,
      topMovingProducts: topMovingProducts || []
    };
  } catch (error) {
    console.error('Failed to get inventory analytics:', error);
    return {
      totalProducts: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
      topMovingProducts: []
    };
  }
}

// Clean up expired reservations every 5 minutes
setInterval(cleanupExpiredReservations, 5 * 60 * 1000);