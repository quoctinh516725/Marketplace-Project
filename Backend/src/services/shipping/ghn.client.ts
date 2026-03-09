import axios from "axios";
import { env } from "../../config/env";

const ghnClient = axios.create({
  baseURL: env.GHN_API_URL,
  headers: {
    Token: env.GHN_TOKEN,
    ShopId: env.GHN_SHOP_ID,
    "Content-Type": "text/plain",
  },
  timeout: 5000,
});

export default ghnClient;
