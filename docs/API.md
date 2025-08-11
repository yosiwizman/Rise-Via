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
    "email": "user@example.com"
  }
}
```

#### Register
```http
POST /auth/v1/signup
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-01-01"
  }
}
```

#### Logout
```http
POST /auth/v1/logout
```

### Customer Management

#### Get Customer
```http
GET /customers?id=eq.{customer_id}
```

**Response:**
```json
{
  "id": "customer_id",
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "555-1234",
  "dateOfBirth": "1990-01-01",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Create Customer
```http
POST /customers
```

**Request Body:**
```json
{
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "555-1234",
  "dateOfBirth": "1990-01-01"
}
```

#### Update Customer
```http
PATCH /customers?id=eq.{customer_id}
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "555-5678"
}
```

#### Search Customers
```http
GET /customers?or=(email.ilike.*{query}*,firstName.ilike.*{query}*,lastName.ilike.*{query}*)
```

### Customer Profiles

#### Get Customer Profile
```http
GET /customer_profiles?customer_id=eq.{customer_id}
```

**Response:**
```json
{
  "id": "profile_id",
  "customer_id": "customer_id",
  "preferences": {
    "strainType": "indica",
    "priceRange": [20, 100]
  },
  "addresses": [
    {
      "type": "shipping",
      "street": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90210"
    }
  ],
  "loyaltyPoints": 150,
  "totalSpent": 299.99
}
```

#### Update Customer Profile
```http
PATCH /customer_profiles?customer_id=eq.{customer_id}
```

### Wishlist Management

#### Get Wishlist Session
```http
GET /wishlist_sessions?session_token=eq.{token}
```

#### Create Wishlist Session
```http
POST /wishlist_sessions
```

**Request Body:**
```json
{
  "session_token": "unique_session_token",
  "user_id": "user_id_optional"
}
```

#### Get Wishlist Items
```http
GET /wishlist_items?session_id=eq.{session_id}
```

**Response:**
```json
[
  {
    "id": "item_id",
    "session_id": "session_id",
    "product_id": "product_1",
    "added_at": "2024-01-01T00:00:00Z",
    "price_alert": {
      "isActive": true,
      "targetPrice": 25.00
    }
  }
]
```

#### Add to Wishlist
```http
POST /wishlist_items
```

**Request Body:**
```json
{
  "session_id": "session_id",
  "product_id": "product_1",
  "price_alert": {
    "isActive": true,
    "targetPrice": 25.00
  }
}
```

#### Remove from Wishlist
```http
DELETE /wishlist_items?session_id=eq.{session_id}&product_id=eq.{product_id}
```

### Orders

#### Get Orders
```http
GET /orders?customer_id=eq.{customer_id}
```

**Response:**
```json
[
  {
    "id": "order_id",
    "orderNumber": "RV-2024-001",
    "customer_id": "customer_id",
    "status": "pending",
    "total": 89.99,
    "items": [
      {
        "product_id": "product_1",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90210"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Order
```http
POST /orders
```

**Request Body:**
```json
{
  "customer_id": "customer_id",
  "items": [
    {
      "product_id": "product_1",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210"
  },
  "total": 89.99
}
```

#### Update Order Status
```http
PATCH /orders?id=eq.{order_id}
```

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "1Z999AA1234567890"
}
```

### Admin Operations

#### Get Activity Logs
```http
GET /activity_logs?order=created_at.desc&limit=50
```

**Response:**
```json
[
  {
    "id": "log_id",
    "admin_id": "admin_id",
    "admin_email": "admin@risevia.com",
    "action": "UPDATE",
    "entity": "Product",
    "entity_id": "product_1",
    "details": {
      "field": "price",
      "oldValue": 45.00,
      "newValue": 50.00
    },
    "ip_address": "192.168.1.1",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Log Admin Activity
```http
POST /activity_logs
```

**Request Body:**
```json
{
  "admin_id": "admin_id",
  "admin_email": "admin@risevia.com",
  "action": "CREATE",
  "entity": "Customer",
  "entity_id": "customer_id",
  "details": {
    "customerEmail": "new@example.com"
  },
  "ip_address": "192.168.1.1"
}
```

## Error Responses

All endpoints return standard HTTP status codes and error messages:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "details": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for anonymous users
- 1000 requests per hour for admin operations

## Compliance Notes

- All customer data is encrypted at rest
- Age verification is required for all cannabis-related operations
- State restrictions are enforced at the API level
- All transactions are logged for compliance auditing
- PII data access is restricted to authorized personnel only

## SDK Examples

### JavaScript/TypeScript
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// Get customer
const { data, error } = await supabase
  .from('customers')
  .select('*')
  .eq('id', customerId)
  .single()

// Add to wishlist
const { data, error } = await supabase
  .from('wishlist_items')
  .insert({
    session_id: sessionId,
    product_id: productId
  })
```

### cURL
```bash
# Get customer
curl -X GET \
  'https://your-project.supabase.co/rest/v1/customers?id=eq.customer_id' \
  -H 'Authorization: Bearer jwt_token' \
  -H 'apikey: anon_key'

# Create order
curl -X POST \
  'https://your-project.supabase.co/rest/v1/orders' \
  -H 'Authorization: Bearer jwt_token' \
  -H 'apikey: anon_key' \
  -H 'Content-Type: application/json' \
  -d '{
    "customer_id": "customer_id",
    "total": 89.99,
    "items": [{"product_id": "product_1", "quantity": 2}]
  }'
```
||||||| c358f7f
=======
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
>>>>>>> origin/feature/testing-docs
