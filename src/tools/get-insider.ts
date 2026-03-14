import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getInsiderActivities } from "../services/korean/dart-insider.js"
import { getUSInsiderTransactions } from "../services/us/finnhub.js"

export function registerGetInsider(server: McpServer) {
  server.tool(
    "get_insider",
    "내부자/기관 거래 조회 (KR: DART, US: Finnhub)",
    {
      ticker: z.string().describe("종목코드 또는 심볼"),
      market: z.enum(["KR", "US"]).default("KR").describe("시장"),
    },
    async ({ ticker, market }) => {
      if (market === "KR") {
        const activities = await getInsiderActivities(ticker)
        if (activities.length === 0) {
          return { content: [{ type: "text" as const, text: `${ticker}의 내부자 거래 데이터가 없습니다. DART_API_KEY가 필요합니다.` }] }
        }
        return { content: [{ type: "text" as const, text: JSON.stringify(activities.slice(0, 20), null, 2) }] }
      } else {
        const transactions = await getUSInsiderTransactions(ticker)
        if (transactions.length === 0) {
          return { content: [{ type: "text" as const, text: `${ticker}의 내부자 거래 데이터가 없습니다. FINNHUB_API_KEY가 필요합니다.` }] }
        }
        return { content: [{ type: "text" as const, text: JSON.stringify(transactions.slice(0, 20), null, 2) }] }
      }
    }
  )
}
