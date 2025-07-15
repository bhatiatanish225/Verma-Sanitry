# AquaShop Backend API Specification

This document outlines all the API endpoints required for the AquaShop application backend.

## Base URL
```
https://your-api-domain.com/api/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this format:
```json
{
  "success": boolean,
  "data": any,
  "error": string,
  "message": string,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+91 98765 43210"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone": "+91 98765 43210",
      "role": "user",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/login
Login with email and password.

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
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone": "+91 98765 43210",
      "role": "user",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    "token": "jwt_token_here"
  }
}
```

### GET /auth/me
Get current user profile (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+91 98765 43210",
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /auth/logout
Logout current user (requires authentication).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/forgot-password
Send password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

## Category Endpoints

### GET /categories
Get all categories.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Bathroom Fittings",
      "description": "Premium bathroom fixtures and fittings",
      "image_url": "https://example.com/image.jpg",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /categories/:id
Get category by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Bathroom Fittings",
    "description": "Premium bathroom fixtures and fittings",
    "image_url": "https://example.com/image.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /categories
Create new category (admin only).

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "image_url": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Category",
    "description": "Category description",
    "image_url": "https://example.com/image.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /categories/:id
Update category (admin only).

**Request Body:**
```json
{
  "name": "Updated Category",
  "description": "Updated description",
  "image_url": "https://example.com/new-image.jpg"
}
```

### DELETE /categories/:id
Delete category (admin only).

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## Product Endpoints

### GET /products
Get all products with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category_id` (optional): Filter by category
- `search` (optional): Search in name and description
- `tags` (optional): Filter by tags (comma-separated)
- `min_price` (optional): Minimum price filter
- `max_price` (optional): Maximum price filter
- `sort` (optional): Sort by (price_asc, price_desc, rating, newest)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Premium Kitchen Sink",
      "description": "High-quality stainless steel kitchen sink",
      "price": 12999,
      "original_price": 15999,
      "image_url": "https://example.com/image.jpg",
      "category_id": "uuid",
      "category": {
        "id": "uuid",
        "name": "Kitchen Accessories"
      },
      "stock_quantity": 25,
      "rating": 4.5,
      "reviews_count": 234,
      "specifications": ["Material: Stainless Steel", "Size: 32x18 inches"],
      "tags": ["featured", "premium"],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### GET /products/featured
Get featured products.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Premium Kitchen Sink",
      "description": "High-quality stainless steel kitchen sink",
      "price": 12999,
      "original_price": 15999,
      "image_url": "https://example.com/image.jpg",
      "category_id": "uuid",
      "stock_quantity": 25,
      "rating": 4.5,
      "reviews_count": 234,
      "specifications": ["Material: Stainless Steel"],
      "tags": ["featured", "premium"],
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /products/bestsellers
Get bestseller products.

### GET /products/:id
Get product by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Premium Kitchen Sink",
    "description": "High-quality stainless steel kitchen sink",
    "price": 12999,
    "original_price": 15999,
    "image_url": "https://example.com/image.jpg",
    "category_id": "uuid",
    "category": {
      "id": "uuid",
      "name": "Kitchen Accessories"
    },
    "stock_quantity": 25,
    "rating": 4.5,
    "reviews_count": 234,
    "specifications": ["Material: Stainless Steel", "Size: 32x18 inches"],
    "tags": ["featured", "premium"],
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /products
Create new product (admin only).

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 9999,
  "original_price": 12999,
  "image_url": "https://example.com/image.jpg",
  "category_id": "uuid",
  "stock_quantity": 50,
  "specifications": ["Spec 1", "Spec 2"],
  "tags": ["new", "featured"],
  "is_active": true
}
```

### PUT /products/:id
Update product (admin only).

### DELETE /products/:id
Delete product (admin only).

---

## Order Endpoints

### GET /orders
Get orders (users see their own, admins see all).

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `user_id` (optional, admin only): Filter by user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "status": "pending",
      "total_amount": 12999,
      "delivery_address": "123 Main St, City, State 12345",
      "payment_method": "UPI",
      "estimated_delivery": "2024-01-25",
      "order_items": [
        {
          "id": "uuid",
          "product_id": "uuid",
          "product": {
            "id": "uuid",
            "name": "Premium Kitchen Sink",
            "image_url": "https://example.com/image.jpg"
          },
          "quantity": 1,
          "price": 12999
        }
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /orders/:id
Get order by ID.

### POST /orders
Create new order (authenticated users only).

**Request Body:**
```json
{
  "delivery_address": "123 Main St, City, State 12345",
  "payment_method": "UPI",
  "order_items": [
    {
      "product_id": "uuid",
      "quantity": 1,
      "price": 12999
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "status": "pending",
    "total_amount": 12999,
    "delivery_address": "123 Main St, City, State 12345",
    "payment_method": "UPI",
    "estimated_delivery": "2024-01-25",
    "order_items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "quantity": 1,
        "price": 12999
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /orders/:id/status
Update order status (admin only).

**Request Body:**
```json
{
  "status": "shipped"
}
```

---

## User Management Endpoints (Admin Only)

### GET /admin/users
Get all users (admin only).

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `role` (optional): Filter by role

### GET /admin/dashboard/stats
Get dashboard statistics (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 150,
    "total_products": 45,
    "total_orders": 89,
    "total_revenue": 125000,
    "recent_orders": [],
    "low_stock_products": []
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "email": ["Email is required"],
    "password": ["Password must be at least 6 characters"]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Database Schema Requirements

### Users Table
- id (UUID, Primary Key)
- email (String, Unique)
- password_hash (String)
- full_name (String)
- phone (String, Optional)
- role (Enum: 'admin', 'user')
- created_at (Timestamp)
- updated_at (Timestamp)

### Categories Table
- id (UUID, Primary Key)
- name (String, Unique)
- description (Text, Optional)
- image_url (String, Optional)
- created_at (Timestamp)
- updated_at (Timestamp)

### Products Table
- id (UUID, Primary Key)
- name (String)
- description (Text)
- price (Decimal)
- original_price (Decimal, Optional)
- image_url (String)
- category_id (UUID, Foreign Key)
- stock_quantity (Integer)
- rating (Decimal, Default: 0)
- reviews_count (Integer, Default: 0)
- specifications (JSON Array)
- tags (JSON Array)
- is_active (Boolean, Default: true)
- created_at (Timestamp)
- updated_at (Timestamp)

### Orders Table
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- status (Enum: 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
- total_amount (Decimal)
- delivery_address (Text)
- payment_method (String)
- estimated_delivery (Date, Optional)
- created_at (Timestamp)
- updated_at (Timestamp)

### Order Items Table
- id (UUID, Primary Key)
- order_id (UUID, Foreign Key)
- product_id (UUID, Foreign Key)
- quantity (Integer)
- price (Decimal)
- created_at (Timestamp)

---

## Security Requirements

1. **Authentication**: Use JWT tokens for authentication
2. **Password Hashing**: Use bcrypt or similar for password hashing
3. **Rate Limiting**: Implement rate limiting on all endpoints
4. **Input Validation**: Validate all input data
5. **SQL Injection Protection**: Use parameterized queries
6. **CORS**: Configure CORS properly for frontend domain
7. **HTTPS**: Use HTTPS in production
8. **Environment Variables**: Store sensitive data in environment variables

---

## Additional Features to Implement

1. **File Upload**: For product images and category images
2. **Email Service**: For password reset and order confirmations
3. **Payment Integration**: Stripe, Razorpay, or similar
4. **Search**: Full-text search for products
5. **Reviews**: Product review system
6. **Wishlist**: User wishlist functionality
7. **Inventory Management**: Stock tracking and alerts
8. **Analytics**: Order and sales analytics
9. **Notifications**: Push notifications for order updates
10. **Caching**: Redis for caching frequently accessed data