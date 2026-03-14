import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getKoreanMacroOverview } from "../services/korean/ecos.js"
import { getGlobalMacroOverview } from "../services/us/fred.js"

export function registerGetMacro(server: McpServer) {
  server.tool(
    "get_macro",
    "거시경제 지표 조회 (KR: 한국은행 ECOS, US: FRED)",
    {
      market: z.enum(["KR", "US"]).default("KR").describe("시장"),
    },
    async ({ market }) => {
      try {
        const indicators = market === "KR"
          ? await getKoreanMacroOverview()
          : await getGlobalMacroOverview()

        if (indicators.length === 0) {
          const keyName = market === "KR" ? "ECOS_API_KEY" : "FRED_API_KEY"
          return { content: [{ type: "text" as const, text: `거시경제 데이터를 가져올 수 없습니다. ${keyName}가 필요합니다.` }] }
        }

        return { content: [{ type: "text" as const, text: JSON.stringify(indicators, null, 2) }] }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        return { content: [{ type: "text" as const, text: `거시경제 데이터 조회 실패: ${message}` }] }
      }
    }
  )
}
