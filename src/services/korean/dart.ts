import { cache, ONE_DAY } from "../../cache/memory-cache.js"
import { resolveCorpCode } from "../../data/dart-corp-codes.js"

const DART_BASE_URL = "https://opendart.fss.or.kr/api"

export interface FinancialStatement {
  readonly rcept_no: string
  readonly bsns_year: string
  readonly stock_code: string
  readonly reprt_code: string
  readonly sj_div: string
  readonly sj_nm: string
  readonly account_nm: string
  readonly thstrm_nm: string
  readonly thstrm_amount: string
  readonly frmtrm_nm: string
  readonly frmtrm_amount: string
  readonly bfefrmtrm_nm: string
  readonly bfefrmtrm_amount: string
}

export interface CompanyOverview {
  readonly corp_name: string
  readonly corp_name_eng: string
  readonly stock_code: string
  readonly ceo_nm: string
  readonly corp_cls: string
  readonly est_dt: string
  readonly hm_url: string
  readonly adres: string
  readonly induty_code: string
}

function getDartApiKey(): string {
  const key = process.env.DART_API_KEY
  if (!key) throw new Error("DART_API_KEY is not configured")
  return key
}

export async function getFinancialStatements(
  corpCode: string,
  year: string,
  reportCode = "11011"
): Promise<FinancialStatement[]> {
  const cacheKey = `dart:financials:${corpCode}:${year}:${reportCode}`
  const cached = cache.get<FinancialStatement[]>(cacheKey)
  if (cached) return cached

  try {
    const apiKey = getDartApiKey()
    const params = new URLSearchParams({
      crtfc_key: apiKey,
      corp_code: corpCode,
      bsns_year: year,
      reprt_code: reportCode,
      fs_div: "CFS",
    })

    const res = await fetch(`${DART_BASE_URL}/fnlttSinglAcntAll.json?${params.toString()}`)
    const data = await res.json() as Record<string, unknown>

    if (data.status !== "000") return []

    const statements = data.list as FinancialStatement[]
    cache.set(cacheKey, statements, ONE_DAY)
    return statements
  } catch {
    return []
  }
}

export async function getCompanyOverview(
  corpCode: string
): Promise<CompanyOverview | null> {
  const cacheKey = `dart:company:${corpCode}`
  const cached = cache.get<CompanyOverview>(cacheKey)
  if (cached) return cached

  try {
    const apiKey = getDartApiKey()
    const params = new URLSearchParams({
      crtfc_key: apiKey,
      corp_code: corpCode,
    })

    const res = await fetch(`${DART_BASE_URL}/company.json?${params.toString()}`)
    const data = await res.json() as Record<string, unknown>

    if (data.status !== "000") return null

    cache.set(cacheKey, data as unknown as CompanyOverview, ONE_DAY)
    return data as unknown as CompanyOverview
  } catch {
    return null
  }
}

export function stockCodeToCorpCode(stockCode: string): string {
  return resolveCorpCode(stockCode) ?? stockCode.padStart(8, "0")
}
