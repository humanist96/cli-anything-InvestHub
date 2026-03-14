import { cache, ONE_DAY } from "../../cache/memory-cache.js"

const BASE_URL = "https://financialmodelingprep.com"

function getApiKey(): string {
  const key = process.env.FMP_API_KEY
  if (!key) throw new Error("FMP_API_KEY is not configured")
  return key
}

async function fetchFmp<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`)
  url.searchParams.set("apikey", getApiKey())
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`FMP ${endpoint} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export interface FmpProfile {
  readonly symbol: string
  readonly companyName: string
  readonly industry: string
  readonly sector: string
  readonly country: string
  readonly mktCap: number
  readonly price: number
  readonly beta: number
  readonly description: string
}

export async function getFmpProfile(symbol: string): Promise<FmpProfile | null> {
  const cacheKey = `fmp:profile:${symbol}`
  const cached = cache.get<FmpProfile>(cacheKey)
  if (cached) return cached

  try {
    const data = await fetchFmp<FmpProfile[]>("/stable/profile", { symbol })
    if (!data[0]) return null
    cache.set(cacheKey, data[0], ONE_DAY)
    return data[0]
  } catch {
    return null
  }
}
