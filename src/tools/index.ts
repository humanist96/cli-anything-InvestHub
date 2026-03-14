import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { registerGetQuote } from "./get-quote.js"
import { registerAnalyzeStock } from "./analyze-stock.js"
import { registerGetNews } from "./get-news.js"
import { registerGetInsider } from "./get-insider.js"
import { registerGetMacro } from "./get-macro.js"
import { registerScreenStocks } from "./screen-stocks.js"
import { registerGetTechnical } from "./get-technical.js"
import { registerRunBacktest } from "./run-backtest.js"
import { registerGetFearGreed } from "./get-fear-greed.js"
import { registerSetupKeys } from "./setup-keys.js"

export function registerAllTools(server: McpServer) {
  registerGetQuote(server)
  registerAnalyzeStock(server)
  registerGetNews(server)
  registerGetInsider(server)
  registerGetMacro(server)
  registerScreenStocks(server)
  registerGetTechnical(server)
  registerRunBacktest(server)
  registerGetFearGreed(server)
  registerSetupKeys(server)
}
