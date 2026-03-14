export interface USStockEntry {
  readonly symbol: string
  readonly name: string
  readonly nameKr: string
  readonly sector: string
  readonly sectorKr: string
  readonly exchange: "NYSE" | "NASDAQ"
}

export const SECTOR_MAP: Readonly<Record<string, string>> = {
  Technology: "기술",
  Healthcare: "헬스케어",
  Financials: "금융",
  "Consumer Discretionary": "경기소비재",
  "Consumer Staples": "필수소비재",
  "Communication Services": "커뮤니케이션",
  Industrials: "산업재",
  Energy: "에너지",
  Utilities: "유틸리티",
  "Real Estate": "부동산",
  Materials: "소재",
}

const US_STOCKS: readonly USStockEntry[] = [
  { symbol: "AAPL", name: "Apple Inc.", nameKr: "애플", sector: "Technology", sectorKr: "기술", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", nameKr: "마이크로소프트", sector: "Technology", sectorKr: "기술", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", nameKr: "엔비디아", sector: "Technology", sectorKr: "기술", exchange: "NASDAQ" },
  { symbol: "AVGO", name: "Broadcom Inc.", nameKr: "브로드컴", sector: "Technology", sectorKr: "기술", exchange: "NASDAQ" },
  { symbol: "ORCL", name: "Oracle Corporation", nameKr: "오라클", sector: "Technology", sectorKr: "기술", exchange: "NYSE" },
  { symbol: "CRM", name: "Salesforce Inc.", nameKr: "세일즈포스", sector: "Technology", sectorKr: "기술", exchange: "NYSE" },
  { symbol: "AMD", name: "Advanced Micro Devices", nameKr: "AMD", sector: "Technology", sectorKr: "기술", exchange: "NASDAQ" },
  { symbol: "ADBE", name: "Adobe Inc.", nameKr: "어도비", sector: "Technology", sectorKr: "기술", exchange: "NASDAQ" },
  { symbol: "INTC", name: "Intel Corporation", nameKr: "인텔", sector: "Technology", sectorKr: "기술", exchange: "NASDAQ" },
  { symbol: "QCOM", name: "Qualcomm Inc.", nameKr: "퀄컴", sector: "Technology", sectorKr: "기술", exchange: "NASDAQ" },
  { symbol: "PLTR", name: "Palantir Technologies", nameKr: "팔란티어", sector: "Technology", sectorKr: "기술", exchange: "NASDAQ" },
  { symbol: "GOOG", name: "Alphabet Inc.", nameKr: "알파벳(구글)", sector: "Communication Services", sectorKr: "커뮤니케이션", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms Inc.", nameKr: "메타(페이스북)", sector: "Communication Services", sectorKr: "커뮤니케이션", exchange: "NASDAQ" },
  { symbol: "NFLX", name: "Netflix Inc.", nameKr: "넷플릭스", sector: "Communication Services", sectorKr: "커뮤니케이션", exchange: "NASDAQ" },
  { symbol: "DIS", name: "The Walt Disney Company", nameKr: "디즈니", sector: "Communication Services", sectorKr: "커뮤니케이션", exchange: "NYSE" },
  { symbol: "AMZN", name: "Amazon.com Inc.", nameKr: "아마존", sector: "Consumer Discretionary", sectorKr: "경기소비재", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", nameKr: "테슬라", sector: "Consumer Discretionary", sectorKr: "경기소비재", exchange: "NASDAQ" },
  { symbol: "HD", name: "The Home Depot", nameKr: "홈디포", sector: "Consumer Discretionary", sectorKr: "경기소비재", exchange: "NYSE" },
  { symbol: "MCD", name: "McDonald's Corporation", nameKr: "맥도날드", sector: "Consumer Discretionary", sectorKr: "경기소비재", exchange: "NYSE" },
  { symbol: "NKE", name: "Nike Inc.", nameKr: "나이키", sector: "Consumer Discretionary", sectorKr: "경기소비재", exchange: "NYSE" },
  { symbol: "WMT", name: "Walmart Inc.", nameKr: "월마트", sector: "Consumer Staples", sectorKr: "필수소비재", exchange: "NYSE" },
  { symbol: "PG", name: "Procter & Gamble", nameKr: "P&G", sector: "Consumer Staples", sectorKr: "필수소비재", exchange: "NYSE" },
  { symbol: "COST", name: "Costco Wholesale", nameKr: "코스트코", sector: "Consumer Staples", sectorKr: "필수소비재", exchange: "NASDAQ" },
  { symbol: "KO", name: "The Coca-Cola Company", nameKr: "코카콜라", sector: "Consumer Staples", sectorKr: "필수소비재", exchange: "NYSE" },
  { symbol: "PEP", name: "PepsiCo Inc.", nameKr: "펩시코", sector: "Consumer Staples", sectorKr: "필수소비재", exchange: "NASDAQ" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", nameKr: "버크셔해서웨이", sector: "Financials", sectorKr: "금융", exchange: "NYSE" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", nameKr: "JP모건", sector: "Financials", sectorKr: "금융", exchange: "NYSE" },
  { symbol: "V", name: "Visa Inc.", nameKr: "비자", sector: "Financials", sectorKr: "금융", exchange: "NYSE" },
  { symbol: "MA", name: "Mastercard Inc.", nameKr: "마스터카드", sector: "Financials", sectorKr: "금융", exchange: "NYSE" },
  { symbol: "BAC", name: "Bank of America", nameKr: "뱅크오브아메리카", sector: "Financials", sectorKr: "금융", exchange: "NYSE" },
  { symbol: "GS", name: "Goldman Sachs Group", nameKr: "골드만삭스", sector: "Financials", sectorKr: "금융", exchange: "NYSE" },
  { symbol: "LLY", name: "Eli Lilly and Company", nameKr: "일라이릴리", sector: "Healthcare", sectorKr: "헬스케어", exchange: "NYSE" },
  { symbol: "UNH", name: "UnitedHealth Group", nameKr: "유나이티드헬스", sector: "Healthcare", sectorKr: "헬스케어", exchange: "NYSE" },
  { symbol: "JNJ", name: "Johnson & Johnson", nameKr: "존슨앤존슨", sector: "Healthcare", sectorKr: "헬스케어", exchange: "NYSE" },
  { symbol: "ABBV", name: "AbbVie Inc.", nameKr: "애브비", sector: "Healthcare", sectorKr: "헬스케어", exchange: "NYSE" },
  { symbol: "MRK", name: "Merck & Co.", nameKr: "머크", sector: "Healthcare", sectorKr: "헬스케어", exchange: "NYSE" },
  { symbol: "PFE", name: "Pfizer Inc.", nameKr: "화이자", sector: "Healthcare", sectorKr: "헬스케어", exchange: "NYSE" },
  { symbol: "GE", name: "GE Aerospace", nameKr: "GE에어로스페이스", sector: "Industrials", sectorKr: "산업재", exchange: "NYSE" },
  { symbol: "CAT", name: "Caterpillar Inc.", nameKr: "캐터필러", sector: "Industrials", sectorKr: "산업재", exchange: "NYSE" },
  { symbol: "BA", name: "The Boeing Company", nameKr: "보잉", sector: "Industrials", sectorKr: "산업재", exchange: "NYSE" },
  { symbol: "LMT", name: "Lockheed Martin", nameKr: "록히드마틴", sector: "Industrials", sectorKr: "산업재", exchange: "NYSE" },
  { symbol: "XOM", name: "Exxon Mobil Corporation", nameKr: "엑슨모빌", sector: "Energy", sectorKr: "에너지", exchange: "NYSE" },
  { symbol: "CVX", name: "Chevron Corporation", nameKr: "셰브론", sector: "Energy", sectorKr: "에너지", exchange: "NYSE" },
  { symbol: "NEE", name: "NextEra Energy", nameKr: "넥스트에라에너지", sector: "Utilities", sectorKr: "유틸리티", exchange: "NYSE" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", nameKr: "S&P500 ETF", sector: "ETF", sectorKr: "ETF", exchange: "NYSE" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", nameKr: "나스닥100 ETF", sector: "ETF", sectorKr: "ETF", exchange: "NASDAQ" },
  { symbol: "IWM", name: "iShares Russell 2000 ETF", nameKr: "러셀2000 ETF", sector: "ETF", sectorKr: "ETF", exchange: "NYSE" },
  { symbol: "SOXX", name: "iShares Semiconductor ETF", nameKr: "반도체 ETF", sector: "ETF", sectorKr: "ETF", exchange: "NASDAQ" },
]

const symbolMap = new Map<string, USStockEntry>()
const nameSearchMap = new Map<string, USStockEntry>()

for (const stock of US_STOCKS) {
  symbolMap.set(stock.symbol, stock)
  nameSearchMap.set(stock.name.toLowerCase(), stock)
  nameSearchMap.set(stock.nameKr, stock)
}

export function findUSStock(symbol: string): USStockEntry | undefined {
  return symbolMap.get(symbol.toUpperCase())
}

export function searchUSStocks(query: string, limit = 20): readonly USStockEntry[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  const results: USStockEntry[] = []
  const seen = new Set<string>()

  const exact = symbolMap.get(q.toUpperCase())
  if (exact) {
    results.push(exact)
    seen.add(exact.symbol)
  }

  for (const stock of US_STOCKS) {
    if (seen.has(stock.symbol)) continue
    if (stock.symbol.toLowerCase().startsWith(q)) {
      results.push(stock)
      seen.add(stock.symbol)
    }
  }

  for (const stock of US_STOCKS) {
    if (seen.has(stock.symbol)) continue
    if (stock.name.toLowerCase().includes(q) || stock.nameKr.includes(q)) {
      results.push(stock)
      seen.add(stock.symbol)
    }
  }

  return results.slice(0, limit)
}

export function getUSStocksBySector(sector: string): readonly USStockEntry[] {
  return US_STOCKS.filter((s) => s.sector === sector)
}

export function getTopUSStocks(count = 30): readonly USStockEntry[] {
  return US_STOCKS.filter((s) => s.sector !== "ETF").slice(0, count)
}
