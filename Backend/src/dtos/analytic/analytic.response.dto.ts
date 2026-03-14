export type SellerAnalyticOverviewResponse = {
  totalRevenue: number;
  totalRevenueToday: number;
  totalRevenueThisMonth: number;

  totalOrders: number;
  totalSoldProducts: number;
};

export type SellerAnalyticRevenueByTimeResponse = {
  date: string;
  revenue: number;
}[];

export type SellerAnalyticTopProductsResponse = {
  productId: string;
  productName: string;
  totalSales: number;
}[];

export type SellerAnalyticOrderStatsResponse = {
  totalOrders: number;
  pendingPayments: number;
  completedOrders: number;
  cancelledOrders: number;
};

export type AdminAnalyticOverviewResponse = {
  totalRevenue: number;
  totalCommission: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalShops: number;
};

export type AdminAnalyticRevenueByTimeResponse = {
  date: string;
  revenue: number;
}[];

export type AdminAnalyticTopProductsResponse = {
  productId: string;
  productName: string;
  totalSales: number;
}[];

export type AdminAnalyticTopShopsResponse = {
  shopId: string;
  shopName: string;
  totalRevenue: number;
}[];
