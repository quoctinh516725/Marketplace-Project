# MarketPlace API Documentation

## Overview

This is the API documentation for the MarketPlace e-commerce platform built with Node.js, TypeScript, and Prisma.

## Access Swagger UI

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:{PORT}/api-docs
```

Replace `{PORT}` with your configured port (default: 8080).

## Authentication

Most endpoints require authentication using JWT Bearer tokens. To authenticate:

1. Call the `/auth/login` or `/auth/register` endpoint
2. Use the returned `accessToken` in the Authorization header:
   ```
   Authorization: Bearer {accessToken}
   ```

## User Roles & Permissions

The system supports multiple user roles:

- **USER**: Regular customers
- **SELLER**: Shop owners who can manage their products and orders
- **STAFF**: Moderators who can review products and manage categories
- **ADMIN**: Full system administrators

## Main Features

### Authentication

- **POST /api/auth/login** - User login
- **POST /api/auth/register** - User registration

### Users

- **GET /api/users/me** - Get current user profile
- **PUT /api/users/me** - Update current user profile
- **POST /api/users/me/avatar** - Update user avatar
- **POST /api/users/me/addresses** - Create user address
- **PUT /api/users/me/addresses/{id}** - Update user address
- **DELETE /api/users/me/addresses/{id}** - Delete user address
- **GET /api/users/profile/{id}** - Get user profile by ID
- **GET /api/users** - Get all users (Admin only)
- **PUT /api/users/{id}** - Update user (Admin only)
- **DELETE /api/users/{id}** - Delete user (Admin only)
- **PATCH /api/users/{id}/status** - Update user status (Admin only)

### Products

- **GET /api/products** - Get all products with pagination
- **GET /api/products/search** - Search products with filters
- **GET /api/products/{id}** - Get product details by ID
- **GET /api/products/shop/{shopId}** - Get products by shop
- **GET /api/products/category/{categoryId}** - Get products by category
- **GET /api/products/slug/{slug}** - Get product by slug

### Shopping Cart

- **GET /api/cart** - Get user's cart items
- **POST /api/cart** - Add item to cart
- **PATCH /api/cart/{id}** - Update item quantity
- **DELETE /api/cart/{id}** - Remove item from cart

_Note: Cart supports both authenticated users and guest users via cookies_

### Orders

- **POST /api/orders/checkout** - Create new order
- **GET /api/orders** - Get user's orders
- **GET /api/orders/{id}** - Get order details
- **POST /api/orders/cancel/{id}** - Cancel order
- **POST /api/orders/confirm/{id}** - Confirm order received

### Payments

- **POST /api/orders/{orderId}/payments** - Get payment URL for VNPay
- **GET /api/payments/payment-return** - Handle payment return from VNPay
- **GET /api/payments/vnpay-ipn** - VNPay Instant Payment Notification

### Shops

- **GET /api/shops/{slug}** - Get shop by slug
- **GET /api/seller/shops** - Get my shop (Seller only)
- **POST /api/seller/shops** - Create shop (Seller only)
- **PUT /api/seller/shops** - Update my shop (Seller only)
- **PATCH /api/seller/shops/status** - Update shop status (Seller only)
- **POST /api/seller/shops/logo** - Update shop logo (Seller only)
- **POST /api/seller/shops/background** - Update shop background (Seller only)
- **GET /api/staff/shops** - Get all shops (Staff only)
- **POST /api/staff/shops/{shopId}/ban** - Ban shop (Staff only)
- **POST /api/staff/shops/{shopId}/review** - Review shop creation request (Staff only)

### Categories

- **GET /api/categories** - Get all categories
- **GET /api/categories/tree** - Get category tree
- **GET /api/categories/{id}** - Get category by ID
- **GET /api/categories/{id}/attributes** - Get category attributes
- **POST /api/categories** - Create category (Staff only)
- **PUT /api/categories/{id}** - Update category (Staff only)
- **PATCH /api/categories/{id}/status** - Update category status (Staff only)
- **DELETE /api/categories/{id}** - Delete category (Staff only)
- **POST /api/categories/{id}/attributes** - Create category attribute (Staff only)
- **DELETE /api/categories/{id}/attributes/{attributeId}** - Delete category attribute (Staff only)

### Reviews

- **POST /api/reviews** - Create product review
- **GET /api/reviews/{id}** - Get review by ID
- **PUT /api/reviews/{id}** - Update review
- **DELETE /api/reviews/{id}** - Delete review
- **GET /api/products/{productId}/reviews** - Get product reviews

### Vouchers

- **GET /api/vouchers** - Get all vouchers (Admin only)
- **POST /api/vouchers** - Create voucher (Admin only)
- **GET /api/vouchers/{id}** - Get voucher by ID
- **PUT /api/vouchers/{id}** - Update voucher (Admin only)
- **DELETE /api/vouchers/{id}** - Delete voucher (Admin only)
- **GET /api/shops/{shopId}/vouchers** - Get shop vouchers
- **GET /api/vouchers/platform** - Get platform vouchers

### Notifications

- **GET /api/notifications** - Get user notifications
- **GET /api/notifications/unread-count** - Get unread notification count
- **POST /api/notifications/{id}/read** - Mark notification as read
- **POST /api/notifications/mark-all-read** - Mark all notifications as read
- **DELETE /api/notifications/{id}** - Delete notification

### Chat

- **GET /api/chat/conversations** - Get user conversations
- **POST /api/chat/conversations** - Start new conversation
- **GET /api/chat/conversations/{conversationId}/messages** - Get conversation messages
- **POST /api/chat/conversations/{conversationId}/messages** - Send message
- **POST /api/chat/conversations/{conversationId}/mark-read** - Mark messages as read

### Roles (Admin Only)

- **GET /api/roles** - Get all roles
- **POST /api/roles** - Create role
- **GET /api/roles/{id}** - Get role by ID
- **PUT /api/roles/{id}** - Update role
- **DELETE /api/roles/{id}** - Delete role
- **POST /api/users/{userId}/roles** - Assign roles to user
- **DELETE /api/users/{userId}/roles** - Revoke roles from user

### Permissions (Admin Only)

- **GET /api/permissions** - Get all permissions
- **POST /api/permissions** - Create permission
- **PUT /api/permissions/{id}** - Update permission
- **DELETE /api/permissions/{id}** - Delete permission
- **POST /api/roles/{roleId}/permissions** - Assign permissions to role
- **DELETE /api/roles/{roleId}/permissions** - Remove permissions from role
- **POST /api/users/{userId}/permissions** - Assign permissions to user
- **DELETE /api/users/{userId}/permissions** - Remove permissions from user

### Seller Dashboard

- **GET /api/seller/products** - Get my products
- **POST /api/seller/products** - Create product
- **GET /api/seller/products/{id}** - Get my product by ID
- **PUT /api/seller/products/{id}** - Update product
- **DELETE /api/seller/products/{id}** - Delete product
- **POST /api/seller/products/{id}/thumbnail** - Upload product thumbnail
- **POST /api/seller/products/{id}/images** - Upload product images
- **PATCH /api/seller/products/{id}/status** - Update product status
- **DELETE /api/seller/products/{id}/variants/{variantId}** - Delete product variant
- **GET /api/seller/orders** - Get shop orders
- **PATCH /api/seller/orders/{id}/status** - Update sub-order status
- **POST /api/seller/orders/refunds/{id}** - Handle refund request
- **GET /api/seller/analytics/overview** - Get shop overview analytics
- **GET /api/seller/analytics/revenue** - Get shop revenue analytics
- **GET /api/seller/analytics/top-products** - Get shop top products
- **GET /api/seller/analytics/orders** - Get shop order statistics

### Staff Management

- **GET /api/staff/products** - Get all products
- **GET /api/staff/products/{id}** - Get product by ID
- **POST /api/staff/products/{id}/review** - Review product approval
- **PATCH /api/staff/products/{id}/status** - Update product status

### Admin System Management

- **GET /api/admin/settings** - Get all system settings
- **POST /api/admin/settings** - Create system setting
- **PUT /api/admin/settings/{key}** - Update system setting
- **DELETE /api/admin/settings/{key}** - Delete system setting
- **GET /api/admin/analytics/overview** - Get admin overview analytics
- **GET /api/admin/analytics/revenue** - Get revenue analytics by time
- **GET /api/admin/analytics/top-products** - Get top selling products
- **GET /api/admin/analytics/top-shops** - Get top performing shops

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Success message",
  "data": { ... } // Response data
}
```

## Error Handling

Error responses include:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Data Models

### Core Entities

- **User**: User accounts with profiles and addresses
- **Product**: Products with variants, images, and attributes
- **Shop**: Seller shops with branding
- **Category**: Product categories with attributes
- **Order**: Customer orders split by shop
- **Cart**: Shopping cart with guest support
- **Review**: Product reviews and ratings
- **Voucher**: Discount codes (platform and shop level)
- **Notification**: User notifications
- **Chat**: Real-time messaging between users

### System Management

- **Role**: User roles with permissions
- **Permission**: Granular permissions system
- **System Settings**: Configurable system parameters
- **Analytics**: Comprehensive reporting and insights

## Development

The API documentation is auto-generated from YAML files in:

- `src/swagger/schemas/` - Data schemas
- `src/swagger/paths/` - API endpoint definitions

To update the documentation, modify the corresponding YAML files and restart the server.
