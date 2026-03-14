import type { KrxStockEntry, ScreenerParams, PaginatedResult } from "../types/krx-types.js"
import { STOCK_LIST, SECTORS } from "./constants.js"
import type { StockInfo } from "./constants.js"

const META_TTL = 24 * 60 * 60 * 1000
const NAVER_STOCK_API = "https://m.stock.naver.com/api/stocks/marketValue"
const PAGE_SIZE = 100

interface RegistryState {
  stocks: Map<string, KrxStockEntry>
  sectors: string[]
  metaLoadedAt: number
  loading: Promise<void> | null
}

const state: RegistryState = {
  stocks: new Map(),
  sectors: [],
  metaLoadedAt: 0,
  loading: null,
}

function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === null) return 0
  if (typeof value === "number") return value
  const cleaned = String(value).replace(/,/g, "")
  const num = Number(cleaned)
  return isNaN(num) ? 0 : num
}

interface NaverStockItem {
  readonly itemCode: string
  readonly stockName: string
  readonly closePrice: string
  readonly compareToPreviousClosePrice: string
  readonly fluctuationsRatio: string
  readonly accumulatedTradingVolume: string
  readonly marketValue: string
  readonly stockEndType: string
}

interface NaverResponse {
  readonly stocks: NaverStockItem[]
  readonly totalCount: number
}

async function fetchMarketPage(
  market: "KOSPI" | "KOSDAQ",
  page: number,
  signal?: AbortSignal
): Promise<NaverResponse> {
  const res = await fetch(
    `${NAVER_STOCK_API}/${market}?page=${page}&pageSize=${PAGE_SIZE}`,
    { headers: { "User-Agent": "Mozilla/5.0" }, signal }
  )
  if (!res.ok) return { stocks: [], totalCount: 0 }
  return res.json() as Promise<NaverResponse>
}

function mapItem(item: NaverStockItem, market: "KOSPI" | "KOSDAQ"): KrxStockEntry | null {
  if (item.stockEndType !== "stock") return null
  const ticker = item.itemCode
  if (!ticker || ticker.length !== 6) return null

  return {
    ticker,
    name: item.stockName,
    market,
    sector: "",
    price: parseNumber(item.closePrice),
    change: parseNumber(item.compareToPreviousClosePrice),
    changePercent: parseNumber(item.fluctuationsRatio),
    volume: parseNumber(item.accumulatedTradingVolume),
    marketCap: parseNumber(item.marketValue),
  }
}

async function fetchAllForMarket(
  market: "KOSPI" | "KOSDAQ",
  signal?: AbortSignal
): Promise<KrxStockEntry[]> {
  const first = await fetchMarketPage(market, 1, signal)
  const totalPages = Math.ceil(first.totalCount / PAGE_SIZE)
  const results: KrxStockEntry[] = []

  for (const item of first.stocks) {
    const mapped = mapItem(item, market)
    if (mapped) results.push(mapped)
  }

  for (let batch = 2; batch <= totalPages; batch += 5) {
    const pages = Array.from(
      { length: Math.min(5, totalPages - batch + 1) },
      (_, i) => batch + i
    )
    const responses = await Promise.allSettled(
      pages.map((p) => fetchMarketPage(market, p, signal))
    )
    for (const resp of responses) {
      if (resp.status === "fulfilled") {
        for (const item of resp.value.stocks) {
          const mapped = mapItem(item, market)
          if (mapped) results.push(mapped)
        }
      }
    }
  }

  return results
}

const HARDCODED_SECTORS = new Map<string, string>(
  STOCK_LIST.map((s) => [s.ticker, s.sector])
)

function buildFallbackEntries(): KrxStockEntry[] {
  return STOCK_LIST.map((s) => ({
    ticker: s.ticker,
    name: s.name,
    market: s.market,
    sector: s.sector,
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    marketCap: 0,
  }))
}

function extractSectors(stocks: Map<string, KrxStockEntry>): string[] {
  const sectorSet = new Set<string>()
  for (const stock of stocks.values()) {
    if (stock.sector) sectorSet.add(stock.sector)
  }
  return [...sectorSet].sort()
}

async function loadFromSource(): Promise<void> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const [kospi, kosdaq] = await Promise.all([
      fetchAllForMarket("KOSPI", controller.signal),
      fetchAllForMarket("KOSDAQ", controller.signal),
    ])

    clearTimeout(timeout)
    const entries = [...kospi, ...kosdaq]

    if (entries.length > 0) {
      const newMap = new Map<string, KrxStockEntry>()
      for (const entry of entries) {
        if (!newMap.has(entry.ticker)) {
          const sector = entry.sector || HARDCODED_SECTORS.get(entry.ticker) || ""
          newMap.set(entry.ticker, sector !== entry.sector ? { ...entry, sector } : entry)
        }
      }
      state.stocks = newMap
      state.sectors = extractSectors(newMap)
      state.metaLoadedAt = Date.now()
    } else if (state.stocks.size === 0) {
      const fallback = buildFallbackEntries()
      const fallbackMap = new Map<string, KrxStockEntry>()
      for (const entry of fallback) {
        fallbackMap.set(entry.ticker, entry)
      }
      state.stocks = fallbackMap
      state.sectors = [...SECTORS]
      state.metaLoadedAt = Date.now()
    }
  } catch {
    if (state.stocks.size === 0) {
      const fallback = buildFallbackEntries()
      const fallbackMap = new Map<string, KrxStockEntry>()
      for (const entry of fallback) {
        fallbackMap.set(entry.ticker, entry)
      }
      state.stocks = fallbackMap
      state.sectors = [...SECTORS]
      state.metaLoadedAt = Date.now()
    }
  }
}

export async function ensureLoaded(): Promise<void> {
  const now = Date.now()
  if (state.stocks.size > 0 && now - state.metaLoadedAt < META_TTL) {
    return
  }

  if (state.loading) {
    await state.loading
    return
  }

  state.loading = loadFromSource().finally(() => {
    state.loading = null
  })
  await state.loading
}

export function findStock(ticker: string): StockInfo | undefined {
  const entry = state.stocks.get(ticker)
  if (!entry) return undefined
  return {
    ticker: entry.ticker,
    name: entry.name,
    market: entry.market,
    sector: entry.sector,
  }
}

export function searchStocks(query: string, limit = 20): StockInfo[] {
  const q = query.toLowerCase()
  const results: StockInfo[] = []

  for (const entry of state.stocks.values()) {
    if (results.length >= limit) break
    if (
      entry.ticker.includes(q) ||
      entry.name.toLowerCase().includes(q) ||
      entry.sector.toLowerCase().includes(q)
    ) {
      results.push({
        ticker: entry.ticker,
        name: entry.name,
        market: entry.market,
        sector: entry.sector,
      })
    }
  }

  return results
}

export function getSectors(): string[] {
  return state.sectors
}

function sortEntries(
  entries: KrxStockEntry[],
  sort: string,
  order: "asc" | "desc"
): KrxStockEntry[] {
  const field = sort as keyof KrxStockEntry
  return [...entries].sort((a, b) => {
    const aVal = a[field] ?? 0
    const bVal = b[field] ?? 0
    if (typeof aVal === "string" && typeof bVal === "string") {
      return order === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    return order === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })
}

export function getScreenerStocks(
  params: ScreenerParams
): PaginatedResult<KrxStockEntry> {
  let entries = [...state.stocks.values()]

  if (params.market !== "ALL") {
    entries = entries.filter((e) => e.market === params.market)
  }

  if (params.sector) {
    entries = entries.filter((e) => e.sector === params.sector)
  }

  if (params.search) {
    const q = params.search.toLowerCase()
    entries = entries.filter(
      (e) =>
        e.ticker.includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.sector.toLowerCase().includes(q)
    )
  }

  if (params.minPrice !== undefined) entries = entries.filter((e) => e.price >= params.minPrice!)
  if (params.maxPrice !== undefined) entries = entries.filter((e) => e.price <= params.maxPrice!)
  if (params.minChangePercent !== undefined) entries = entries.filter((e) => e.changePercent >= params.minChangePercent!)
  if (params.maxChangePercent !== undefined) entries = entries.filter((e) => e.changePercent <= params.maxChangePercent!)
  if (params.minMarketCap !== undefined) entries = entries.filter((e) => e.marketCap >= params.minMarketCap!)
  if (params.maxMarketCap !== undefined) entries = entries.filter((e) => e.marketCap <= params.maxMarketCap!)

  const sorted = sortEntries(entries, params.sort || "marketCap", params.order)

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / params.limit))
  const page = Math.min(params.page, totalPages)
  const start = (page - 1) * params.limit
  const data = sorted.slice(start, start + params.limit)

  return {
    data,
    meta: { total, page, limit: params.limit, totalPages },
  }
}
