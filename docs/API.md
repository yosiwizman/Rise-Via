# Rise-Via API Documentation

## Overview

The Rise-Via API provides endpoints for managing cannabis e-commerce operations including authentication, customer management, wishlist functionality, and compliance tracking. All endpoints use Supabase as the backend database.

## Base URL

```
https://your-supabase-project.supabase.co/rest/v1
```

## Authentication

All API requests require authentication using Supabase JWT tokens or API keys.

### Headers

```
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

## Endpoints

### Authentication

#### Login
```http
POST /auth/v1/token?grant_type=password
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "user_id",
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
