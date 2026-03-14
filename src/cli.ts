#!/usr/bin/env node
import { Command } from "commander"
import { getQuote, getHistorical } from "./services/korean/naver-finance.js"
import { getUSQuote } from "./services/us/finnhub.js"
import { getFearGreedIndex } from "./services/market/fear-greed.js"
import { formatApiKeyGuide } from "./utils/config.js"

const program = new Command()

program
  .name("invest-hub-mcp")
  .description("InvestHub MCP - 한국/미국 주식 분석 도구")
  .version("1.0.0")

program
  .command("quote <ticker>")
  .description("주식 시세 조회")
  .option("-m, --market <market>", "시장 (KR/US)", "KR")
  .action(async (ticker: string, opts: { market: string }) => {
    try {
      const data = opts.market === "US"
        ? await getUSQuote(ticker)
        : await getQuote(ticker)
      console.log(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error("시세 조회 실패:", (err as Error).message)
      process.exit(1)
    }
  })

program
  .command("fear-greed")
  .description("KOSPI 공포탐욕 지수 조회")
  .action(async () => {
    try {
      const data = await getFearGreedIndex()
      console.log(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error("공포탐욕지수 조회 실패:", (err as Error).message)
      process.exit(1)
    }
  })

program
  .command("setup-keys")
  .description("API 키 설정 상태 및 발급 가이드")
  .action(() => {
    console.log(formatApiKeyGuide())
  })

program.parse()
