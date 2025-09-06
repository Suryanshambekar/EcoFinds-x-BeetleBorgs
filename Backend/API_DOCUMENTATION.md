# EcoFinds API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

## Authentication

#### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "fullName": "string (optional)",
  "phone": "string (optional)",
  "profileImage": "string (optional)",
  "isVerified": "boolean (optional)",
  "preferences": {
    "notifications": "boolean (optional)",
    "newsletter": "boolean (optional)"
  }
}
```

**Response (201):**
```json
{
  "ok": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string"
  }
}
```

#### POST /auth/login
Initiate login process with OTP.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "OTP sent to email"
}
```

#### POST /auth/verify-otp
Verify OTP and get JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "otp": "string (required)"
}
```

**Response (200):**
```json
{
  "ok": true,
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string"
  }
}
```

### Products

#### GET /products
Get all products with optional filtering.

**Query Parameters:**
- `category`: string (optional) - Filter by category
- `search`: string (optional) - Search in title/description
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 20)
- `sort`: string (optional) - 'price_asc', 'price_desc', 'newest'

**Response (200):**
```json
{
  "products": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "price": "number",
      "category": "string",
      "condition": "string",
      "images": ["string"],
      "co2Saved": "number",
      "location": {
        "city": "string",
        "state": "string"
      },
      "tags": ["string"],
      "seller": {
        "username": "string",
        "email": "string"
      },
      "createdAt": "string"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 100
  }
}
```

#### GET /products/:id
Get single product details.

**Response (200):**
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "condition": "string",
  "images": ["string"],
  "co2Saved": "number",
  "location": {
    "city": "string",
    "state": "string"
  },
  "tags": ["string"],
  "seller": {
    "username": "string",
    "email": "string"
  },
  "createdAt": "string"
}
```

#### POST /products
Create new product (requires authentication).

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "price": "number (required)",
  "category": "string (required)",
  "condition": "string (required)",
  "images": ["string"] (optional),
  "co2Saved": "number" (optional),
  "location": {
    "city": "string",
    "state": "string"
  } (optional),
  "tags": ["string"] (optional)
}
```

**Response (201):**
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "condition": "string",
  "images": ["string"],
  "co2Saved": "number",
  "location": {
    "city": "string",
    "state": "string"
  },
  "tags": ["string"],
  "seller": {
    "username": "string",
    "email": "string"
  },
  "createdAt": "string"
}
```

#### PUT /products/:id
Update product (requires authentication, owner only).

**Request Body:** (same as POST, all fields optional)

**Response (200):** (same as GET single product)

#### DELETE /products/:id
Delete product (requires authentication, owner only).

**Response (200):**
```json
{
  "message": "Product deleted successfully"
}
```

#### GET /products/user/my-listings
Get user's own products (requires authentication).

**Response (200):**
```json
[
  {
    "_id": "string",
    "title": "string",
    "description": "string",
    "price": "number",
    "category": "string",
    "condition": "string",
    "images": ["string"],
    "co2Saved": "number",
    "isActive": "boolean",
    "createdAt": "string"
  }
]
```

### Cart

#### GET /cart
Get user's cart (requires authentication).

**Response (200):**
```json
{
  "_id": "string",
  "user": "string",
  "items": [
    {
      "_id": "string",
      "product": {
        "_id": "string",
        "title": "string",
        "price": "number",
        "images": ["string"],
        "co2Saved": "number",
        "isActive": "boolean"
      },
      "quantity": "number"
    }
  ],
  "totalItems": "number",
  "totalPrice": "number",
  "totalCO2Saved": "number"
}
```

#### POST /cart/add
Add item to cart (requires authentication).

**Request Body:**
```json
{
  "productId": "string (required)",
  "quantity": "number (optional, default: 1)"
}
```

**Response (200):** (same as GET cart)

#### PUT /cart/update/:itemId
Update item quantity (requires authentication).

**Request Body:**
```json
{
  "quantity": "number (required, min: 1)"
}
```

**Response (200):** (same as GET cart)

#### DELETE /cart/remove/:itemId
Remove item from cart (requires authentication).

**Response (200):** (same as GET cart)

#### DELETE /cart/clear
Clear entire cart (requires authentication).

**Response (200):**
```json
{
  "message": "Cart cleared successfully"
}
```

#### POST /cart/checkout
Process checkout (requires authentication).

**Request Body:**
```json
{
  "shippingAddress": {
    "street": "string (required)",
    "city": "string (required)",
    "state": "string (required)",
    "zipCode": "string (required)",
    "country": "string (optional, default: US)"
  },
  "paymentMethod": "string (optional, default: credit_card)",
  "notes": "string (optional)"
}
```

**Response (200):**
```json
{
  "message": "Checkout successful",
  "orderData": {
    "buyer": "string",
    "items": [
      {
        "product": "string",
        "quantity": "number",
        "price": "number",
        "co2Saved": "number"
      }
    ],
    "totalAmount": "number",
    "totalCO2Saved": "number",
    "shippingAddress": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zipCode": "string",
      "country": "string"
    },
    "paymentMethod": "string",
    "notes": "string"
  },
  "totalAmount": "number",
  "totalCO2Saved": "number"
}
```

### Orders

#### GET /orders
Get user's order history (requires authentication).

**Query Parameters:**
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 10)
- `status`: string (optional) - Filter by status

**Response (200):**
```json
{
  "orders": [
    {
      "_id": "string",
      "orderNumber": "string",
      "buyer": "string",
      "items": [
        {
          "product": {
            "_id": "string",
            "title": "string",
            "images": ["string"],
            "category": "string",
            "condition": "string"
          },
          "quantity": "number",
          "price": "number",
          "co2Saved": "number"
        }
      ],
      "totalAmount": "number",
      "totalCO2Saved": "number",
      "status": "string",
      "shippingAddress": {
        "street": "string",
        "city": "string",
        "state": "string",
        "zipCode": "string",
        "country": "string"
      },
      "paymentMethod": "string",
      "notes": "string",
      "createdAt": "string"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 2,
    "total": 15
  }
}
```

#### GET /orders/:id
Get single order details (requires authentication, buyer only).

**Response (200):** (same as order object in GET /orders)

#### POST /orders
Create new order (requires authentication).

**Request Body:**
```json
{
  "items": [
    {
      "product": "string (required)",
      "quantity": "number (required)",
      "price": "number (required)",
      "co2Saved": "number (optional)"
    }
  ] (required),
  "totalAmount": "number (required)",
  "totalCO2Saved": "number (optional)",
  "shippingAddress": {
    "street": "string (required)",
    "city": "string (required)",
    "state": "string (required)",
    "zipCode": "string (required)",
    "country": "string (optional)"
  } (required),
  "paymentMethod": "string (optional)",
  "notes": "string (optional)"
}
```

**Response (201):** (same as order object)

#### PUT /orders/:id/status
Update order status (requires authentication, seller only).

**Request Body:**
```json
{
  "status": "string (required)" // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
}
```

**Response (200):** (same as order object)

#### GET /orders/seller/orders
Get orders for user's products (requires authentication, seller view).

**Query Parameters:**
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 10)
- `status`: string (optional)

**Response (200):**
```json
{
  "orders": [
    {
      "_id": "string",
      "orderNumber": "string",
      "buyer": {
        "username": "string",
        "email": "string"
      },
      "items": [
        {
          "product": {
            "_id": "string",
            "title": "string",
            "images": ["string"],
            "category": "string",
            "condition": "string",
            "seller": "string"
          },
          "quantity": "number",
          "price": "number",
          "co2Saved": "number"
        }
      ],
      "totalAmount": "number",
      "totalCO2Saved": "number",
      "status": "string",
      "shippingAddress": {
        "street": "string",
        "city": "string",
        "state": "string",
        "zipCode": "string",
        "country": "string"
      },
      "paymentMethod": "string",
      "notes": "string",
      "createdAt": "string"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 2,
    "total": 15
  }
}
```

#### GET /orders/stats
Get order statistics (requires authentication).

**Response (200):**
```json
{
  "buyer": {
    "totalOrders": "number",
    "totalSpent": "number",
    "totalCO2Saved": "number",
    "totalItems": "number"
  },
  "seller": {
    "totalSales": "number",
    "totalRevenue": "number",
    "totalCO2Saved": "number"
  }
}
```

### Upload

#### POST /upload/image
Upload single image file (requires authentication).

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image`: File (required) - Image file

**Response (200):**
```json
{
  "success": true,
  "filePath": "string",
  "filename": "string",
  "originalName": "string",
  "size": "number"
}
```

#### POST /upload/images
Upload multiple image files (requires authentication).

**Content-Type:** `multipart/form-data`

**Form Data:**
- `images`: Files (required) - Multiple image files (max 5)

**Response (200):**
```json
{
  "success": true,
  "files": [
    {
      "filePath": "string",
      "filename": "string",
      "originalName": "string",
      "size": "number"
    }
  ],
  "count": "number"
}
```

#### GET /upload/:filename
Serve uploaded image file.

**Response (200):** Image file content

## Data Schemas

### Product Categories
- Electronics
- Clothing
- Home & Garden
- Sports & Outdoors
- Books & Media
- Automotive
- Health & Beauty
- Toys & Games
- Other

### Product Conditions
- New
- Like New
- Good
- Fair
- Poor

### Order Statuses
- pending
- confirmed
- shipped
- delivered
- cancelled

### Payment Methods
- credit_card
- debit_card
- paypal
- cash_on_delivery

## Error Responses

### 400 Bad Request
```json
{
  "error": "Error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict error"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting
- OTP requests: 5 attempts per 5 minutes
- General API: No specific rate limiting implemented

## File Upload Limits
- Single file: 5MB
- Multiple files: 5 files max, 5MB total
- Supported formats: Images only (jpeg, jpg, png, gif, webp)
