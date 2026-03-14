import {
  AdminAnalyticOverviewResponse,
  AdminAnalyticRevenueByTimeResponse,
  AdminAnalyticTopProductsResponse,
  AdminAnalyticTopShopsResponse,
  SellerAnalyticOrderStatsResponse,
  SellerAnalyticOverviewResponse,
  SellerAnalyticRevenueByTimeResponse,
  SellerAnalyticTopProductsResponse,
} from "../../dtos/analytic/analytic.response.dto";
import analyticRepository from "../../repositories/analytic.repository";

class AnalyticService {
  getShopOverview = async (
    shopId: string,
  ): Promise<SellerAnalyticOverviewResponse> => {
    return analyticRepository.getShopOverview(shopId);
  };

  getRevenueByTime = async (
    shopId: string,
    range: string,
  ): Promise<SellerAnalyticRevenueByTimeResponse> => {
    return analyticRepository.getRevenueByTime(shopId, range);
  };

  getTopProducts = async (
    shopId: string,
  ): Promise<SellerAnalyticTopProductsResponse> => {
    return analyticRepository.getTopProducts(shopId);
  };

  getOrderStats = async (
    shopId: string,
  ): Promise<SellerAnalyticOrderStatsResponse> => {
    return analyticRepository.getOrderStats(shopId);
  };

  // Admin
  getAdminOverview = async (): Promise<AdminAnalyticOverviewResponse> => {
    return analyticRepository.getAdminOverview();
  };

  getAdminRevenueByTime = async (
    range: string,
  ): Promise<AdminAnalyticRevenueByTimeResponse> => {
    return analyticRepository.getAdminRevenueByTime(range);
  };

  getAdminTopProducts = async (): Promise<AdminAnalyticTopProductsResponse> => {
    return analyticRepository.getAdminTopProducts();
  };

  getAdminTopShops = async (): Promise<AdminAnalyticTopShopsResponse> => {
    return analyticRepository.getAdminTopShops();
  };
}

export default new AnalyticService();
