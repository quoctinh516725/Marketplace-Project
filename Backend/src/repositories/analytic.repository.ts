import { prisma } from "../config/prisma";
import { OrderStatus } from "../constants/orderStatus";
import {
  AdminAnalyticOverviewResponse,
  AdminAnalyticRevenueByTimeResponse,
  AdminAnalyticTopProductsResponse,
  AdminAnalyticTopShopsResponse,
  SellerAnalyticOrderStatsResponse,
  SellerAnalyticOverviewResponse,
  SellerAnalyticRevenueByTimeResponse,
  SellerAnalyticTopProductsResponse,
} from "../dtos/analytic/analytic.response.dto";

class AnalyticRepository {
  getShopOverview = async (
    shopId: string,
  ): Promise<SellerAnalyticOverviewResponse> => {
    const today = new Date();

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalRevenue,
      totalRevenueToday,
      totalRevenueThisMonth,
      totalOrders,
      totalSoldProducts,
    ] = await Promise.all([
      prisma.subOrder.aggregate({
        where: {
          shopId,
          status: OrderStatus.COMPLETED,
        },
        _sum: { realAmount: true },
      }),

      prisma.subOrder.aggregate({
        where: {
          shopId,
          status: OrderStatus.COMPLETED,
          createdAt: { gte: startOfToday },
        },
        _sum: { realAmount: true },
      }),

      prisma.subOrder.aggregate({
        where: {
          shopId,
          status: OrderStatus.COMPLETED,
          createdAt: { gte: startOfMonth },
        },
        _sum: { realAmount: true },
      }),

      prisma.subOrder.count({
        where: {
          shopId,
          status: OrderStatus.COMPLETED,
        },
      }),

      prisma.orderItem.aggregate({
        where: {
          subOrder: {
            shopId,
            status: OrderStatus.COMPLETED,
          },
        },
        _sum: { quantity: true },
      }),
    ]);

    return {
      totalRevenue: totalRevenue._sum.realAmount?.toNumber() || 0,
      totalRevenueToday: totalRevenueToday._sum.realAmount?.toNumber() || 0,
      totalRevenueThisMonth:
        totalRevenueThisMonth._sum.realAmount?.toNumber() || 0,
      totalOrders,
      totalSoldProducts: totalSoldProducts._sum.quantity || 0,
    };
  };

  getRevenueByTime = async (
    shopId: string,
    range: string,
  ): Promise<SellerAnalyticRevenueByTimeResponse> => {
    const today = new Date();
    let startDate = new Date();
    let groupBy = "";

    switch (range) {
      case "7d":
        startDate.setDate(today.getDate() - 7);
        groupBy = "DATE(created_at)";
        break;

      case "30d":
        startDate.setDate(today.getDate() - 30);
        groupBy = "DATE(created_at)";
        break;

      case "12m":
        startDate.setMonth(today.getMonth() - 12);
        groupBy = "DATE_TRUNC('month', created_at)";
        break;

      default:
        startDate.setDate(today.getDate() - 7);
        groupBy = "DATE(created_at)";
    }

    return prisma.$queryRawUnsafe(
      `
        SELECT ${groupBy} as date,
            SUM(real_amount) as revenue
        FROM sub_orders
        WHERE shop_id = $1
        AND status = $2
        AND created_at >= $3
        GROUP BY date
        ORDER BY date ASC
        `,
      shopId,
      OrderStatus.COMPLETED,
      startDate,
    );
  };

  getTopProducts = async (
    shopId: string,
  ): Promise<SellerAnalyticTopProductsResponse> => {
    return prisma.$queryRaw`
      SELECT 
        p.id as "productId",
        p.name as "productName",
        SUM(oi.quantity) as "totalSales"
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN sub_orders so ON oi.sub_order_id = so.id
      WHERE so.shop_id = ${shopId}
      AND so.status = ${OrderStatus.COMPLETED}
      GROUP BY p.id, p.name
      ORDER BY "totalSales" DESC
      LIMIT 10
    `;
  };

  getOrderStats = async (
    shopId: string,
  ): Promise<SellerAnalyticOrderStatsResponse> => {
    const [totalOrders, pendingPayments, completedOrders, cancelledOrders] =
      await Promise.all([
        prisma.subOrder.count({
          where: { shopId },
        }),

        prisma.subOrder.count({
          where: {
            shopId,
            status: OrderStatus.PENDING_PAYMENT,
          },
        }),

        prisma.subOrder.count({
          where: {
            shopId,
            status: OrderStatus.COMPLETED,
          },
        }),

        prisma.subOrder.count({
          where: {
            shopId,
            status: OrderStatus.CANCELLED,
          },
        }),
      ]);

    return {
      totalOrders,
      pendingPayments,
      completedOrders,
      cancelledOrders,
    };
  };

  getAdminOverview = async (): Promise<AdminAnalyticOverviewResponse> => {
    const [
      totalRevenue,
      totalCommission,
      totalOrders,
      totalProducts,
      totalUsers,
      totalShops,
    ] = await Promise.all([
      prisma.subOrder.aggregate({
        where: { status: OrderStatus.COMPLETED },
        _sum: { totalAmount: true },
      }),

      prisma.subOrder.aggregate({
        where: { status: OrderStatus.COMPLETED },
        _sum: { commissionAmount: true },
      }),

      prisma.subOrder.count(),

      prisma.product.count(),

      prisma.user.count(),

      prisma.shop.count(),
    ]);

    return {
      totalRevenue: totalRevenue._sum.totalAmount?.toNumber() || 0,
      totalCommission: totalCommission._sum.commissionAmount?.toNumber() || 0,
      totalOrders,
      totalProducts,
      totalUsers,
      totalShops,
    };
  };

  getAdminRevenueByTime = async (
    range: string,
  ): Promise<AdminAnalyticRevenueByTimeResponse> => {
    const today = new Date();
    let startDate = new Date();
    let groupBy = "";

    switch (range) {
      case "7d":
        startDate.setDate(today.getDate() - 7);
        groupBy = "DATE(created_at)";
        break;

      case "30d":
        startDate.setDate(today.getDate() - 30);
        groupBy = "DATE(created_at)";
        break;

      case "12m":
        startDate.setMonth(today.getMonth() - 12);
        groupBy = "DATE_TRUNC('month', created_at)";
        break;

      default:
        startDate.setDate(today.getDate() - 7);
        groupBy = "DATE(created_at)";
    }

    return prisma.$queryRawUnsafe(
      `
        SELECT ${groupBy} as date,
        SUM(total_amount) as revenue
        FROM sub_orders
        WHERE status = $1
        AND created_at >= $2
        GROUP BY date
        ORDER BY date ASC
        `,
      OrderStatus.COMPLETED,
      startDate,
    );
  };

  getAdminTopProducts = async (): Promise<AdminAnalyticTopProductsResponse> => {
    return prisma.$queryRaw`
      SELECT 
        p.id as "productId",
        p.name as "productName",
        SUM(oi.quantity) as "totalSales"
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN sub_orders so ON oi.sub_order_id = so.id
      WHERE so.status = ${OrderStatus.COMPLETED}
      GROUP BY p.id, p.name
      ORDER BY "totalSales" DESC
      LIMIT 10
    `;
  };

  getAdminTopShops = async (): Promise<AdminAnalyticTopShopsResponse> => {
    return prisma.$queryRaw`
      SELECT 
        s.id as "shopId",
        s.name as "shopName",
        SUM(so.real_amount) as "totalRevenue"
      FROM sub_orders so
      JOIN shops s ON so.shop_id = s.id
      WHERE so.status = ${OrderStatus.COMPLETED}
      GROUP BY s.id, s.name
      ORDER BY "totalRevenue" DESC
      LIMIT 10
    `;
  };
}

export default new AnalyticRepository();
