import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getHistorical } from "../services/korean/naver-finance.js"
import { getUSCandle } from "../services/us/finnhub.js"
import { calculateTechnicalIndicators, getTechnicalScore } from "../analysis/technical.js"

export function registerGetTechnical(server: McpServer) {
  server.tool(
    "get_technical",
    "기술적 분석 (RSI, MACD, 이동평균, 볼린저밴드, ATR 등)",
    {
      ticker: z.string().describe("종목코드 또는 심볼"),
      market: z.enum(["KR", "US"]).default("KR").describe("시장"),
    },
    async ({ ticker, market }) => {
      let ohlcv: { close: number; high: number; low: number; volume: number }[]

      if (market === "KR") {
        const historical = await getHistorical(ticker, "1y")
        if (historical.length === 0) {
          return { content: [{ type: "text" as const, text: `${ticker}의 히스토리 데이터를 가져올 수 없습니다.` }] }
        }
        ohlcv = historical.map((h) => ({ close: h.close, high: h.high, low: h.low, volume: h.volume }))
      } else {
        const candle = await getUSCandle(ticker, "D")
        if (candle.s !== "ok" || candle.c.length < 20) {
          return { content: [{ type: "text" as const, text: `${ticker}의 캔들 데이터를 가져올 수 없습니다.` }] }
        }
        ohlcv = candle.c.map((close, i) => ({
          close, high: candle.h[i], low: candle.l[i], volume: candle.v[i],
        }))
      }

      const indicators = calculateTechnicalIndicators(ohlcv)
      const score = getTechnicalScore(indicators)

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ ...indicators, technicalScore: score }, null, 2),
        }],
      }
    }
  )
}
