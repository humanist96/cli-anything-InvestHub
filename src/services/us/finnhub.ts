import { cache, FIVE_MINUTES, ONE_HOUR, ONE_DAY } from "../../cache/memory-cache.js"

const BASE_URL = "https://finnhub.io/api/v1"

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY
  if (!key) throw new Error("FINNHUB_API_KEY is not configured")
  return key
}

async function fetchFinnhub<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set("token", getApiKey())
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Finnhub ${endpoint} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export interface FinnhubQuote {
  readonly c: number
  readonly d: number
  readonly dp: number
  readonly h: number
  readonly l: number
  readonly o: number
  readonly pc: number
  readonly t: number
}

export interface FinnhubProfile {
  readonly country: string
  readonly currency: string
  readonly exchange: string
  readonly finnhubIndustry: string
  readonly ipo: string
  readonly logo: string
  readonly marketCapitalization: number
  readonly name: string
  readonly phone: string
  readonly shareOutstanding: number
  readonly ticker: string
  readonly weburl: string
}

export interface FinnhubCandle {
  readonly c: readonly number[]
  readonly h: readonly number[]
  readonly l: readonly number[]
  readonly o: readonly number[]
  readonly t: readonly number[]
  readonly v: readonly number[]
  readonly s: string
}

export interface FinnhubNewsItem {
  readonly category: string
  readonly datetime: number
  readonly headline: string
  readonly id: number
  readonly image: string
  readonly related: string
  readonly source: string
  readonly summary: string
  readonly url: string
}

export interface FinnhubMetrics {
  readonly metric: {
    readonly "52WeekHigh"?: number
    readonly "52WeekLow"?: number
    readonly beta?: number
    readonly dividendYieldIndicatedAnnual?: number
    readonly epsAnnual?: number
    readonly marketCapitalization?: number
    readonly peAnnual?: number
    readonly pbAnnual?: number
    readonly roeTTM?: number
    readonly [key: string]: number | string | undefined
  }
}

export interface FinnhubInsiderTransaction {
  readonly name: string
  readonly share: number
  readonly change: number
  readonly filingDate: string
  readonly transactionDate: string
  readonly transactionCode: string
  readonly transactionPrice: number
  readonly symbol: string
}

export interface FinnhubInsiderResponse {
  readonly data: readonly FinnhubInsiderTransaction[]
  readonly symbol: string
}

export async function getUSQuote(symbol: string): Promise<FinnhubQuote> {
  const cacheKey = `finnhub:quote:${symbol}`
  const cached = cache.get<FinnhubQuote>(cacheKey)
  if (cached) return cached

  const data = await fetchFinnhub<FinnhubQuote>("/quote", { symbol })
  cache.set(cacheKey, data, FIVE_MINUTES)
  return data
}

export async function getUSProfile(symbol: string): Promise<FinnhubProfile | null> {
  const cacheKey = `finnhub:profile:${symbol}`
  const cached = cache.get<FinnhubProfile>(cacheKey)
  if (cached) return cached

  try {
    const data = await fetchFinnhub<FinnhubProfile>("/stock/profile2", { symbol })
    if (!data.name) return null
    cache.set(cacheKey, data, ONE_DAY)
    return data
  } catch {
    return null
  }
}

export async function getUSCandle(
  symbol: string,
  resolution = "D",
  from?: number,
  to?: number
): Promise<FinnhubCandle> {
  const now = Math.floor(Date.now() / 1000)
  const defaultFrom = now - 365 * 24 * 60 * 60

  const cacheKey = `finnhub:candle:${symbol}:${resolution}:${from ?? defaultFrom}`
  const cached = cache.get<FinnhubCandle>(cacheKey)
  if (cached) return cached

  const data = await fetchFinnhub<FinnhubCandle>("/stock/candle", {
    symbol,
    resolution,
    from: String(from ?? defaultFrom),
    to: String(to ?? now),
  })

  cache.set(cacheKey, data, ONE_HOUR)
  return data
}

export async function getUSNews(
  symbol: string,
  days = 7
): Promise<readonly FinnhubNewsItem[]> {
  const cacheKey = `finnhub:news:${symbol}`
  const cached = cache.get<readonly FinnhubNewsItem[]>(cacheKey)
  if (cached) return cached

  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - days)

  const data = await fetchFinnhub<FinnhubNewsItem[]>("/company-news", {
    symbol,
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  })

  const result = data.slice(0, 20)
  cache.set(cacheKey, result, FIVE_MINUTES * 3)
  return result
}

export async function getUSMetrics(symbol: string): Promise<FinnhubMetrics | null> {
  const cacheKey = `finnhub:metrics:${symbol}`
  const cached = cache.get<FinnhubMetrics>(cacheKey)
  if (cached) return cached

  try {
    const data = await fetchFinnhub<FinnhubMetrics>("/stock/metric", {
      symbol,
      metric: "all",
    })
    cache.set(cacheKey, data, ONE_HOUR)
    return data
  } catch {
    return null
  }
}

export async function getUSInsiderTransactions(
  symbol: string
): Promise<readonly FinnhubInsiderTransaction[]> {
  const cacheKey = `finnhub:insider:${symbol}`
  const cached = cache.get<readonly FinnhubInsiderTransaction[]>(cacheKey)
  if (cached) return cached

  try {
    const data = await fetchFinnhub<FinnhubInsiderResponse>(
      "/stock/insider-transactions",
      { symbol }
    )
    const result = data.data ?? []
    cache.set(cacheKey, result, ONE_HOUR)
    return result
  } catch {
    return []
  }
}
