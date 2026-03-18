import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MarketPlace API",
      version: "1.0.0",
      description: "API documentation for MarketPlace e-commerce platform",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Authentication endpoints",
      },
      {
        name: "Users",
        description: "User management endpoints",
      },
      {
        name: "Products",
        description: "Product management endpoints",
      },
      {
        name: "Cart",
        description: "Shopping cart endpoints",
      },
      {
        name: "Orders",
        description: "Order management endpoints",
      },
      {
        name: "Payments",
        description: "Payment processing endpoints",
      },
      {
        name: "Shops",
        description: "Shop management endpoints",
      },
      {
        name: "Categories",
        description: "Category management endpoints",
      },
      {
        name: "Reviews",
        description: "Product review endpoints",
      },
      {
        name: "Vouchers",
        description: "Voucher management endpoints",
      },
      {
        name: "Notifications",
        description: "Notification endpoints",
      },
      {
        name: "Chat",
        description: "Chat and messaging endpoints",
      },
      {
        name: "Roles",
        description: "Role management endpoints",
      },
      {
        name: "Permissions",
        description: "Permission management endpoints",
      },
      {
        name: "Admin",
        description: "Admin system management endpoints",
      },
      {
        name: "Seller",
        description: "Seller dashboard endpoints",
      },
      {
        name: "Staff",
        description: "Staff management endpoints",
      },
    ],
  },
  apis: ["./src/swagger/schemas/*.yml", "./src/swagger/paths/*.yml"],
};

export const swaggerSpec = swaggerJsdoc(options);
