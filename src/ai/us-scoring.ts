import { cache, ONE_HOUR } from "../cache/memory-cache.js"
import { getUSQuote, getUSMetrics, getUSNews, getUSCandle } from "../services/us/finnhub.js"
import { getGoogleNews } from "../services/news/google-news.js"
import { findUSStock } from "../data/us-stock-registry.js"
import { calculateTechnicalIndicators } from "../analysis/technical.js"
import { analyzeNewsSentiment } from "../analysis/sentiment.js"
import { AIScoreSchema, type AIScore } from "./score-schema.js"
import { generateFallbackScore, type FallbackInput } from "./fallback-scoring.js"
import { generateAIAnalysis } from "../services/ai/openai.js"
import { buildUSScoringPrompt, type USPromptData } from "./prompts.js"
import { parseAIJsonResponse } from "./parse-response.js"

export async function getUSAIScore(symbol: string): Promise<AIScore | null> {
  const cacheKey = `us-ai-score:${symbol}`
  const cached = cache.get<AIScore>(cacheKey)
  if (cached) return cached

  const registry = findUSStock(symbol)
  const stockName = registry?.nameKr ?? registry?.name ?? symbol

  const [quoteResult, metricsResult, candleResult, newsResult, googleNewsResult] =
    await Promise.allSettled([
      getUSQuote(symbol), getUSMetrics(symbol),
      getUSCandle(symbol, "D"), getUSNews(symbol, 7), getGoogleNews(stockName),
    ])

  const quote = quoteResult.status === "fulfilled" ? quoteResult.value : null
  const metrics = metricsResult.status === "fulfilled" ? metricsResult.value : null
  const candle = candleResult.status === "fulfilled" ? candleResult.value : null
  const news = newsResult.status === "fulfilled" ? newsResult.value : []
  const googleNews = googleNewsResult.status === "fulfilled" ? googleNewsResult.value : []

  if (!quote || quote.c === 0) {
    const fallback = generateFallbackScore({
      stockName,
      dataSources: {
        quote: false, technical: false, dart: false,
        financials: false, naverNews: false, googleNews: googleNews.length > 0,
      },
    })
    cache.set(cacheKey, fallback, ONE_HOUR)
    return fallback
  }

  let technicalIndicators = undefined
  if (candle && candle.s === "ok" && candle.c.length > 20) {
    const ohlcv = candle.c.map((close, i) => ({
      close, high: candle.h[i], low: candle.l[i], volume: candle.v[i],
    }))
    technicalIndicators = calculateTechnicalIndicators(ohlcv)
  }

  const allHeadlines = [
    ...news.map((n) => ({ title: n.headline, url: n.url })),
    ...googleNews.slice(0, 5).map((n) => ({ title: n.title, url: n.url })),
  ]
  const newsSentiment = allHeadlines.length > 0
    ? analyzeNewsSentiment(allHeadlines.map((h) => ({ title: h.title, url: h.url, source: "", publishedAt: "" })))
    : null

  const m = metrics?.metric
  const dataSources = {
    quote: true, technical: !!technicalIndicators, dart: false,
    financials: !!m, naverNews: false, googleNews: googleNews.length > 0,
  }
  const newsHeadlines = allHeadlines.slice(0, 5).map((h) => h.title)

  try {
    const promptData: USPromptData = {
      name: stockName, symbol, price: quote.c, changePercent: quote.dp,
      peAnnual: m?.peAnnual ?? null, pbAnnual: m?.pbAnnual ?? null,
      epsAnnual: m?.epsAnnual ?? null,
      dividendYield: m?.dividendYieldIndicatedAnnual ?? null,
      marketCap: m?.marketCapitalization ? (m.marketCapitalization as number) * 1_000_000 : null,
      roeTTM: m?.roeTTM ?? null, beta: m?.beta ?? null,
      high52w: m?.["52WeekHigh"] as number ?? null,
      low52w: m?.["52WeekLow"] as number ?? null,
      sector: registry?.sector ?? null,
      technicalIndicators, newsSentiment, headlines: newsHeadlines,
    }

    const prompt = buildUSScoringPrompt(promptData)
    const response = await generateAIAnalysis(prompt)
    const parsed = parseAIJsonResponse(response)
    const score = AIScoreSchema.parse({
      ...parsed, dataSources, newsHeadlines, analyzedAt: new Date().toISOString(),
    })

    cache.set(cacheKey, score, ONE_HOUR)
    return score
  } catch {
    const fallbackInput: FallbackInput = {
      stockName, technicalIndicators, newsSentiment, dataSources, newsHeadlines,
      fundamentals: m ? {
        per: m.peAnnual ?? null, pbr: m.pbAnnual ?? null, eps: m.epsAnnual ?? null,
        dividendYield: m.dividendYieldIndicatedAnnual ?? null,
        marketCap: m.marketCapitalization ? (m.marketCapitalization as number) * 1_000_000 : 0,
        priceChange52w: quote.dp,
      } : null,
    }
    const fallback = generateFallbackScore(fallbackInput)
    cache.set(cacheKey, fallback, ONE_HOUR)
    return fallback
  }
}
