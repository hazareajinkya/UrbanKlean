import { Client } from "@upstash/qstash";

const upstash = new Client({
  baseUrl: process.env.QSTASH_URL,
  token: process.env.QSTASH_TOKEN,
});

export default upstash;
