import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getFearGreedIndex } from "../services/market/fear-greed.js"

export function registerGetFearGreed(server: McpServer) {
  server.tool(
    "get_fear_greed",
    "KOSPI 공포탐욕 지수 조회 (0: 극도의 공포 ~ 100: 극도의 탐욕)",
    {},
    async () => {
      const data = await getFearGreedIndex()
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }
    }
  )
}
