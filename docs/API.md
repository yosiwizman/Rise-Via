# Rise-Via API Documentation

## Overview
The Rise-Via platform uses Supabase as the backend database with client-side services for data management.

## Authentication

### Supabase Auth
- **Base URL**: Configured via `VITE_SUPABASE_URL`
- **Authentication**: Anonymous and authenticated users supported
- **Service Key**: Admin operations use `VITE_SUPABASE_SERVICE_KEY`

## Database Schema

### Tables

#### `wishlist_sessions`
Manages anonymous user wishlist sessions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `session_token` | TEXT | Unique session identifier |
| `user_id` | UUID | Optional user ID for authenticated users |
| `created_at` | TIMESTAMP | Session creation time |
| `updated_at` | TIMESTAMP | Last update time |

#### `wishlist_items`
Stores individual wishlist items.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `session_id` | UUID | Foreign key to wishlist_sessions |
| `product_id` | TEXT | Product identifier |
| `created_at` | TIMESTAMP | Item addition time |

#### `customers`
Customer information and profiles.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | Customer email address |
| `name` | TEXT | Customer full name |
| `phone` | TEXT | Phone number |
| `address` | JSONB | Shipping address |
| `created_at` | TIMESTAMP | Account creation time |

#### `orders`
Order records and status tracking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `order_number` | TEXT | Human-readable order number |
| `customer_id` | UUID | Foreign key to customers |
| `status` | TEXT | Order status (pending, processing, shipped, delivered, cancelled) |
| `payment_status` | TEXT | Payment status (pending, paid, failed, refunded) |
| `total_amount` | DECIMAL | Order total |
| `created_at` | TIMESTAMP | Order creation time |

#### `order_items`
Individual items within orders.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `order_id` | UUID | Foreign key to orders |
| `product_id` | TEXT | Product identifier |
| `quantity` | INTEGER | Item quantity |
| `price` | DECIMAL | Item price at time of order |
| `total` | DECIMAL | Line item total |

## Services

### Wishlist Service
**File**: `src/services/wishlistService.ts`

#### `getOrCreateSession()`
Creates or retrieves a wishlist session for the current user.

**Returns**: `Promise<Session | null>`

**Example**:
```typescript
const session = await wishlistService.getOrCreateSession()
```

#### `getWishlist()`
Retrieves all wishlist items for the current session.

**Returns**: `Promise<{ data: string[], error: any }>`

**Example**:
```typescript
const { data, error } = await wishlistService.getWishlist()
if (!error) {
  console.log('Wishlist items:', data)
}
```

#### `addToWishlist(productId: string)`
Adds a product to the user's wishlist.

**Parameters**:
- `productId` (string): The product identifier

**Returns**: `Promise<{ error: any }>`

**Example**:
```typescript
const { error } = await wishlistService.addToWishlist('product-123')
if (!error) {
  console.log('Product added to wishlist')
}
```

#### `removeFromWishlist(productId: string)`
Removes a product from the user's wishlist.

**Parameters**:
- `productId` (string): The product identifier

**Returns**: `Promise<{ error: any }>`

**Example**:
```typescript
const { error } = await wishlistService.removeFromWishlist('product-123')
```

#### `isInWishlist(productId: string)`
Checks if a product is in the user's wishlist.

**Parameters**:
- `productId` (string): The product identifier

**Returns**: `Promise<boolean>`

**Example**:
```typescript
const inWishlist = await wishlistService.isInWishlist('product-123')
```

### Email Service
**File**: `src/services/emailService.ts`

#### `sendOrderConfirmation(email: string, orderData: any)`
Sends order confirmation email to customer.

**Parameters**:
- `email` (string): Customer email address
- `orderData` (object): Order details including orderNumber and total

**Example**:
```typescript
await emailService.sendOrderConfirmation('customer@example.com', {
  orderNumber: 'RV-2024-001',
  total: 89.99
})
```

#### `sendOrderStatusUpdate(email: string, orderData: any, status: string)`
Sends order status update notification.

**Parameters**:
- `email` (string): Customer email address
- `orderData` (object): Order details
- `status` (string): New order status

**Example**:
```typescript
await emailService.sendOrderStatusUpdate('customer@example.com', orderData, 'shipped')
```

### Customer Service
**File**: `src/services/customerService.ts`

#### `getAll()`
Retrieves all customers (admin only).

**Returns**: `Promise<Customer[]>`

#### `create(customerData: any)`
Creates a new customer record.

**Parameters**:
- `customerData` (object): Customer information

**Returns**: `Promise<{ data: Customer, error: any }>`

### Price Tracking Service
**File**: `src/services/priceTracking.ts`

#### `startPriceTracking()`
Initializes price tracking for wishlist items.

#### `getAlertStats()`
Returns price alert statistics.

**Returns**: `Object` with alert metrics

### Authentication Service
**File**: `src/services/authService.ts`

#### `signIn(email: string, password: string)`
Authenticates user with email and password.

#### `signUp(email: string, password: string, userData: any)`
Creates new user account.

#### `signOut()`
Signs out current user.

#### `getCurrentUser()`
Gets current authenticated user.

## Error Handling

All services return errors in a consistent format:

```typescript
{
  error: {
    message: string,
    code?: string,
    details?: any
  }
}
```

## Rate Limiting

Cart operations are rate-limited to prevent abuse:
- **Add to Cart**: 30 requests per minute
- **Security Check**: Implemented via `SecurityUtils.checkRateLimit()`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_SUPABASE_SERVICE_KEY` | Supabase service key (admin) | No |
| `VITE_RESEND_API_KEY` | Resend email service key | No |

## API Endpoints

### REST API Patterns

All database operations follow RESTful patterns through Supabase:

#### Wishlist Operations
- `GET /wishlist_sessions` - Retrieve sessions
- `POST /wishlist_sessions` - Create session
- `GET /wishlist_items` - Retrieve wishlist items
- `POST /wishlist_items` - Add item to wishlist
- `DELETE /wishlist_items` - Remove item from wishlist

#### Customer Operations
- `GET /customers` - List customers (admin)
- `POST /customers` - Create customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

#### Order Operations
- `GET /orders` - List orders
- `POST /orders` - Create order
- `PUT /orders/:id` - Update order status
- `GET /order_items` - List order items

## Security

### Row Level Security (RLS)
All tables implement RLS policies:
- Anonymous users can only access their session data
- Authenticated users can access their own data
- Admin users have elevated permissions

### Input Validation
- All inputs are sanitized using `SecurityUtils.sanitizeInput()`
- XSS protection via DOMPurify
- SQL injection prevention through parameterized queries

### Rate Limiting
- Cart operations: 30 requests per minute
- API calls: Configurable per endpoint
- Implemented client-side with fallback to server-side

## Monitoring

### Analytics
- Cart events tracked via Google Analytics
- Custom event tracking for user interactions
- Performance monitoring with Core Web Vitals

### Error Tracking
- Client-side error reporting
- API error logging
- Performance monitoring

## Compliance

### Cannabis Industry
- Age verification enforcement
- State shipping restrictions
- Product warning requirements
- Lab result management

### Data Protection
- GDPR compliance features
- Data encryption at rest and in transit
- Secure session management
- Privacy policy enforcement
