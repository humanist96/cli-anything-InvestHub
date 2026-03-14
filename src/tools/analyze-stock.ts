import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getAIScore } from "../ai/scoring.js"
import { getUSAIScore } from "../ai/us-scoring.js"

export function registerAnalyzeStock(server: McpServer) {
  server.tool(
    "analyze_stock",
    "AI 종합 분석 (기술적/재무적/감성 분석, 스코어 1-10). OPENAI_API_KEY 없으면 알고리즘 기반 분석",
    {
      ticker: z.string().describe("종목코드 (KR: 005930) 또는 심볼 (US: AAPL)"),
      market: z.enum(["KR", "US"]).default("KR").describe("시장"),
    },
    async ({ ticker, market }) => {
      const score = market === "KR"
        ? await getAIScore(ticker)
        : await getUSAIScore(ticker)

      if (!score) {
        return { content: [{ type: "text" as const, text: `${ticker} 분석에 실패했습니다. 종목코드를 확인해주세요.` }] }
      }

      return { content: [{ type: "text" as const, text: JSON.stringify(score, null, 2) }] }
    }
  )
}
