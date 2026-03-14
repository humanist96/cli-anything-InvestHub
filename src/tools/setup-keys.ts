import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { formatApiKeyGuide } from "../utils/config.js"

export function registerSetupKeys(server: McpServer) {
  server.tool(
    "setup_keys",
    "API 키 설정 상태 확인 및 발급 가이드",
    {},
    async () => {
      const guide = formatApiKeyGuide()
      return { content: [{ type: "text" as const, text: guide }] }
    }
  )
}
