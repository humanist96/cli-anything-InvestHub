import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getQuote } from "../services/korean/naver-finance.js"
import { getUSQuote, getUSProfile } from "../services/us/finnhub.js"
import { findUSStock } from "../data/us-stock-registry.js"

export function registerGetQuote(server: McpServer) {
  server.tool(
    "get_quote",
    "한국/미국 주식 실시간 시세 조회. KR: 종목코드(005930), US: 심볼(AAPL)",
    {
      ticker: z.string().describe("종목코드 (KR: 005930) 또는 심볼 (US: AAPL)"),
      market: z.enum(["KR", "US"]).default("KR").describe("시장 (KR 또는 US)"),
    },
    async ({ ticker, market }) => {
      if (market === "KR") {
        const data = await getQuote(ticker)
        if (!data) return { content: [{ type: "text" as const, text: `종목 ${ticker}를 찾을 수 없습니다.` }] }
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
      } else {
        const quote = await getUSQuote(ticker)
        const profile = await getUSProfile(ticker).catch(() => null)
        const registry = findUSStock(ticker)
        const result = {
          symbol: ticker,
          name: profile?.name ?? registry?.nameKr ?? ticker,
          price: quote.c,
          change: quote.d,
          changePercent: quote.dp,
          dayHigh: quote.h,
          dayLow: quote.l,
          open: quote.o,
          previousClose: quote.pc,
          marketCap: profile?.marketCapitalization ?? null,
          industry: profile?.finnhubIndustry ?? registry?.sector ?? null,
        }
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] }
      }
    }
  )
}
