import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { ensureLoaded, getScreenerStocks, getSectors } from "../data/stock-registry.js"
import { searchUSStocks, getUSStocksBySector } from "../data/us-stock-registry.js"

export function registerScreenStocks(server: McpServer) {
  server.tool(
    "screen_stocks",
    "종목 스크리너 - 시장/섹터/가격/등락률/시가총액 기준 필터링",
    {
      market: z.enum(["ALL", "KOSPI", "KOSDAQ", "US"]).default("ALL").describe("시장"),
      sector: z.string().default("").describe("섹터 필터"),
      sort: z.string().default("marketCap").describe("정렬 기준 (marketCap, price, changePercent, volume)"),
      order: z.enum(["asc", "desc"]).default("desc").describe("정렬 순서"),
      search: z.string().default("").describe("종목명/코드 검색"),
      page: z.number().default(1).describe("페이지"),
      limit: z.number().default(20).describe("페이지당 종목 수"),
      minPrice: z.number().optional().describe("최소 가격"),
      maxPrice: z.number().optional().describe("최대 가격"),
    },
    async ({ market, sector, sort, order, search, page, limit, minPrice, maxPrice }) => {
      if (market === "US") {
        let stocks = search
          ? searchUSStocks(search, limit)
          : sector
            ? getUSStocksBySector(sector)
            : searchUSStocks("", 50)

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              data: stocks.slice(0, limit),
              meta: { total: stocks.length, page: 1, limit },
            }, null, 2),
          }],
        }
      }

      await ensureLoaded()

      const result = getScreenerStocks({
        page, limit,
        market: market as "ALL" | "KOSPI" | "KOSDAQ",
        sector, sort, order, search,
        minPrice, maxPrice,
      })

      const sectors = getSectors()

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            ...result,
            availableSectors: sectors,
          }, null, 2),
        }],
      }
    }
  )
}
