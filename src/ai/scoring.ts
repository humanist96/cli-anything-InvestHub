import { cache, ONE_HOUR } from "../cache/memory-cache.js"
import { getQuote, getHistorical } from "../services/korean/naver-finance.js"
import { getCompanyOverview, getFinancialStatements } from "../services/korean/dart.js"
import { getNaverNews } from "../services/korean/naver-news.js"
import { getGoogleNews } from "../services/news/google-news.js"
import { generateAIAnalysis } from "../services/ai/openai.js"
import { calculateTechnicalIndicators } from "../analysis/technical.js"
import { analyzeNewsSentiment } from "../analysis/sentiment.js"
import { AIScoreSchema, type AIScore } from "./score-schema.js"
import { generateFallbackScore } from "./fallback-scoring.js"
import { buildScoringPrompt, type PromptData } from "./prompts.js"
import { parseAIJsonResponse } from "./parse-response.js"
import { ensureLoaded, findStock as registryFindStock } from "../data/stock-registry.js"
import { resolveCorpCode } from "../data/dart-corp-codes.js"
import { findStock as fallbackFindStock } from "../data/constants.js"

async function fetchFinancialsWithFallback(corpCode: string) {
  const currentYear = new Date().getFullYear()
  for (const year of [currentYear - 1, currentYear - 2]) {
    const result = await getFinancialStatements(corpCode, String(year))
    if (result.length > 0) return result
  }
  return []
}

export async function getAIScore(ticker: string): Promise<AIScore | null> {
  const cacheKey = `ai-score:${ticker}`
  const cached = cache.get<AIScore>(cacheKey)
  if (cached) return cached

  await ensureLoaded()
  const stock = registryFindStock(ticker) ?? fallbackFindStock(ticker)
  if (!stock) return null

  try {
    const corpCode = resolveCorpCode(ticker)

    const [quoteResult, historicalResult, companyResult, financialsResult, naverNewsResult, googleNewsResult] =
      await Promise.allSettled([
        getQuote(ticker),
        getHistorical(ticker, "1y"),
        corpCode ? getCompanyOverview(corpCode) : Promise.resolve(null),
        corpCode ? fetchFinancialsWithFallback(corpCode) : Promise.resolve([]),
        getNaverNews(stock.name),
        getGoogleNews(stock.name),
      ])

    const quote = quoteResult.status === "fulfilled" ? quoteResult.value : null
    const historical = historicalResult.status === "fulfilled" ? historicalResult.value : []
    const companyInfo = companyResult.status === "fulfilled" ? companyResult.value : null
    const financials = financialsResult.status === "fulfilled" ? financialsResult.value : []
    const naverNews = naverNewsResult.status === "fulfilled" ? naverNewsResult.value : []
    const googleNews = googleNewsResult.status === "fulfilled" ? googleNewsResult.value : []

    const sources = {
      quote: quote !== null, technical: historical.length > 0,
      dart: companyInfo !== null, financials: financials.length > 0,
      naverNews: naverNews.length > 0, googleNews: googleNews.length > 0,
    }

    if (!quote && historical.length === 0) {
      const fallback = generateFallbackScore({ stockName: stock.name, dataSources: sources })
      cache.set(cacheKey, fallback, ONE_HOUR)
      return fallback
    }

    const technicalIndicators = historical.length > 0
      ? calculateTechnicalIndicators(historical.map((h) => ({
          close: h.close, high: h.high, low: h.low, volume: h.volume,
        })))
      : undefined

    const allNews = [...naverNews, ...googleNews]
    const newsSentiment = allNews.length > 0 ? analyzeNewsSentiment(allNews) : null
    const newsHeadlines = allNews.slice(0, 5).map((a) => a.title)

    try {
      const promptData: PromptData = {
        name: stock.name, ticker: stock.ticker,
        price: quote?.price ?? 0, changePercent: quote?.changePercent ?? 0,
        per: quote?.per ?? null, pbr: quote?.pbr ?? null,
        eps: quote?.eps ?? null, dividendYield: quote?.dividendYield ?? null,
        marketCap: quote?.marketCap ?? 0, volume: quote?.volume ?? 0,
        technicalIndicators: technicalIndicators ?? {
          rsi: 50, macdLine: 0, macdSignal: 0, macdHistogram: 0,
          sma20: 0, sma50: 0, sma200: 0, ema12: 0, ema26: 0,
          bollingerUpper: 0, bollingerMiddle: 0, bollingerLower: 0,
          atr: 0, priceVsSma20: 0, priceVsSma50: 0, priceVsSma200: 0, volumeRatio: 1,
        },
        sector: stock.sector, companyInfo, financials, newsSentiment,
      }

      const prompt = buildScoringPrompt(promptData)
      const response = await generateAIAnalysis(prompt)
      const parsed = parseAIJsonResponse(response)
      const score = AIScoreSchema.parse({
        ...parsed, dataSources: sources, newsHeadlines, analyzedAt: new Date().toISOString(),
      })

      cache.set(cacheKey, score, ONE_HOUR)
      return score
    } catch {
      const fallback = generateFallbackScore({
        stockName: stock.name, technicalIndicators, newsSentiment,
        dataSources: sources, newsHeadlines,
        fundamentals: quote ? {
          per: quote.per, pbr: quote.pbr, eps: quote.eps,
          dividendYield: quote.dividendYield, marketCap: quote.marketCap,
          priceChange52w: quote.changePercent,
        } : null,
      })
      cache.set(cacheKey, fallback, ONE_HOUR)
      return fallback
    }
  } catch {
    return null
  }
}
