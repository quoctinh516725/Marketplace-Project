import { Client } from "@elastic/elasticsearch";
import { env } from "./env";


export const esClient = new Client({
  node: env.ES_URL,
});
