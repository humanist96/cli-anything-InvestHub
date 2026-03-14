import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getHistorical } from "../services/korean/naver-finance.js"
import { getUSCandle } from "../services/us/finnhub.js"
import { runBacktest } from "../backtest/engine.js"
import { STRATEGY_TEMPLATES } from "../backtest/templates.js"
import type { OHLCVBar, StrategyDefinition } from "../backtest/types.js"

export function registerRunBacktest(server: McpServer) {
  server.tool(
    "run_backtest",
    "전략 백테스트 - 기본 전략 프리셋 또는 커스텀 전략으로 과거 성과 분석",
    {
      ticker: z.string().describe("종목코드 또는 심볼"),
      market: z.enum(["KR", "US"]).default("KR").describe("시장"),
      strategy: z.string().default("RSI Oversold Bounce").describe(
        "전략명: Golden Cross, RSI Oversold Bounce, MACD Signal Cross, Bollinger Band Breakout, Dual MA Trend"
      ),
      period: z.enum(["1y", "3y"]).default("3y").describe("백테스트 기간"),
      initialCapital: z.number().default(10000000).describe("초기 투자금 (KR: 원, US: 달러)"),
    },
    async ({ ticker, market, strategy, period, initialCapital }) => {
      let bars: OHLCVBar[]

      if (market === "KR") {
        const historical = await getHistorical(ticker, period as "1y" | "3y")
        if (historical.length < 50) {
          return { content: [{ type: "text" as const, text: `${ticker}의 히스토리 데이터가 부족합니다 (${historical.length}개).` }] }
        }
        bars = historical
      } else {
        const yearsBack = period === "3y" ? 3 : 1
        const now = Math.floor(Date.now() / 1000)
        const from = now - yearsBack * 365 * 24 * 60 * 60
        const candle = await getUSCandle(ticker, "D", from, now)
        if (candle.s !== "ok" || candle.c.length < 50) {
          return { content: [{ type: "text" as const, text: `${ticker}의 캔들 데이터가 부족합니다.` }] }
        }
        bars = candle.c.map((close, i) => ({
          date: new Date(candle.t[i] * 1000).toISOString().slice(0, 10),
          open: candle.o[i], high: candle.h[i], low: candle.l[i],
          close, volume: candle.v[i],
        }))
      }

      const template = STRATEGY_TEMPLATES.find(
        (t) => t.name.toLowerCase() === strategy.toLowerCase() || t.nameKr === strategy
      )

      const strategyDef: StrategyDefinition = template?.definition ?? STRATEGY_TEMPLATES[1].definition

      const result = runBacktest(bars, strategyDef, { initialCapital })

      const availableStrategies = STRATEGY_TEMPLATES.map((t) => ({
        name: t.name,
        nameKr: t.nameKr,
        description: t.description,
      }))

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            strategy: template?.name ?? strategy,
            strategyKr: template?.nameKr ?? strategy,
            period,
            ticker,
            market,
            initialCapital,
            result: {
              totalReturn: result.totalReturn,
              cagr: result.cagr,
              mdd: result.mdd,
              sharpe: result.sharpe,
              winRate: result.winRate,
              totalTrades: result.totalTrades,
            },
            recentTrades: result.trades.slice(-10),
            availableStrategies,
          }, null, 2),
        }],
      }
    }
  )
}
