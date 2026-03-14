import { prisma } from "../config/prisma";
import { OrderStatus } from "../constants/orderStatus";
import {
  AdminAnalyticOverviewResponse,
  AdminAnalyticRevenueByTimeResponse,
  SellerAnalyticOrderStatsResponse,
  SellerAnalyticOverviewResponse,
  SellerAnalyticRevenueByTimeResponse,
  SellerAnalyticTopProductsResponse,
} from "../dtos/analytic/analytic.response.dto";

class AnalyticRepository {
  // Seller Analytics
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
        where: { shopId, status: OrderStatus.COMPLETED },
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
        where: { shopId, status: OrderStatus.COMPLETED },
      }),
      prisma.orderItem.aggregate({
        where: {
          subOrder: { shopId, status: OrderStatus.COMPLETED },
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
    }

    return prisma.$queryRawUnsafe(
      `
    SELECT ${groupBy} as date, SUM(real_amount) as revenue
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
    SELECT p.id as productId, p.name as productName, SUM(oi.quantity) as totalSales
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN sub_orders so ON oi.sub_order_id = so.id
    WHERE so.shop_id = ${shopId} AND so.status = ${OrderStatus.COMPLETED}
    GROUP BY p.id, p.name
    ORDER BY totalSales DESC
    LIMIT 10
    `;
  };

  getOrderStats = async (
    shopId: string,
  ): Promise<SellerAnalyticOrderStatsResponse> => {
    const [totalOrders, pendingPayments, completedOrders, cancelledOrders] =
      await Promise.all([
        prisma.subOrder.count({ where: { shopId } }),
        prisma.subOrder.count({
          where: { shopId, status: OrderStatus.PENDING_PAYMENT },
        }),
        prisma.subOrder.count({
          where: { shopId, status: OrderStatus.COMPLETED },
        }),
        prisma.subOrder.count({
          where: { shopId, status: OrderStatus.CANCELLED },
        }),
      ]);
    return {
      totalOrders,
      pendingPayments,
      completedOrders,
      cancelledOrders,
    };
  };

  // Admin Analytics

  getAdminOverview = async (): Promise<AdminAnalyticOverviewResponse> => {};
  getAdminRevenueByTime =
    async (): Promise<AdminAnalyticRevenueByTimeResponse> => {};
  getAdminTopProducts =
    async (): Promise<SellerAnalyticTopProductsResponse> => {};
  getAdminTopShops = async (): Promise<SellerAnalyticTopProductsResponse> => {};
}

export default new AnalyticRepository();
