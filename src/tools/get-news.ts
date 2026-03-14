import { z } from "zod"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getGoogleNews } from "../services/news/google-news.js"
import { getNaverNews } from "../services/korean/naver-news.js"
import { getUSNews } from "../services/us/finnhub.js"
import { analyzeNewsSentiment } from "../analysis/sentiment.js"

export function registerGetNews(server: McpServer) {
  server.tool(
    "get_news",
    "종목 관련 뉴스 검색 및 감성 분석",
    {
      query: z.string().describe("종목명 또는 키워드"),
      market: z.enum(["KR", "US"]).default("KR").describe("시장"),
      ticker: z.string().optional().describe("US 시장 종목 심볼 (Finnhub 뉴스용)"),
    },
    async ({ query, market, ticker }) => {
      const articles = []

      if (market === "KR") {
        const [google, naver] = await Promise.allSettled([
          getGoogleNews(query),
          getNaverNews(query),
        ])
        if (google.status === "fulfilled") articles.push(...google.value)
        if (naver.status === "fulfilled") articles.push(...naver.value)
      } else {
        const symbol = ticker ?? query
        try {
          const news = await getUSNews(symbol, 7)
          articles.push(...news.map((n) => ({
            title: n.headline,
            source: n.source,
            url: n.url,
            publishedAt: new Date(n.datetime * 1000).toISOString(),
            snippet: n.summary,
          })))
        } catch { /* Finnhub key not configured */ }
        const google = await getGoogleNews(query)
        articles.push(...google)
      }

      const sentiment = analyzeNewsSentiment(articles)

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            articles: articles.slice(0, 15),
            sentiment: {
              positiveCount: sentiment.positiveCount,
              negativeCount: sentiment.negativeCount,
              neutralCount: sentiment.neutralCount,
              overallScore: sentiment.overallScore,
              keywords: sentiment.keywords,
            },
          }, null, 2),
        }],
      }
    }
  )
}
