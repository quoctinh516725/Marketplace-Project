import ghnClient from "./ghn.client";

type CalculateFeeInput = {
  fromDistrictId: number;
  fromWardCode: string;
  toDistrictId: number;
  toWardCode: string;
  weight: number;

  totalAmount: number;
};

class GHNService {
  async calculateFee(data: CalculateFeeInput): Promise<number> {
    const res = await ghnClient.post("/v2/shipping-order/fee", {
      service_type_id: 2, // E-Commerce Delivery
      from_district_id: data.fromDistrictId,
      from_ward_code: data.fromWardCode,
      to_district_id: data.toDistrictId,
      to_ward_code: data.toWardCode,
      weight: data.weight,

      insurance_value: data.totalAmount,
    });

    return res.data.data.total;
  }
}

export default new GHNService();
