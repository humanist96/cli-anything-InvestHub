import type { TechnicalIndicators } from "../analysis/technical.js"
import type { NewsSentiment } from "../types/news-types.js"
import type { CompanyOverview, FinancialStatement } from "../services/korean/dart.js"

export interface PromptData {
  readonly name: string
  readonly ticker: string
  readonly price: number
  readonly changePercent: number
  readonly per: number | null
  readonly pbr: number | null
  readonly eps: number | null
  readonly dividendYield: number | null
  readonly marketCap: number
  readonly volume: number
  readonly technicalIndicators: TechnicalIndicators
  readonly sector: string
  readonly companyInfo?: CompanyOverview | null
  readonly financials?: readonly FinancialStatement[]
  readonly newsSentiment?: NewsSentiment | null
}

export interface USPromptData {
  readonly name: string
  readonly symbol: string
  readonly price: number
  readonly changePercent: number
  readonly peAnnual: number | null
  readonly pbAnnual: number | null
  readonly epsAnnual: number | null
  readonly dividendYield: number | null
  readonly marketCap: number | null
  readonly roeTTM: number | null
  readonly beta: number | null
  readonly high52w: number | null
  readonly low52w: number | null
  readonly sector: string | null
  readonly technicalIndicators?: TechnicalIndicators
  readonly newsSentiment?: NewsSentiment | null
  readonly headlines: readonly string[]
}

function formatAmount(amount: string | undefined): string {
  if (!amount) return "N/A"
  const num = Number(amount.replace(/,/g, ""))
  if (isNaN(num)) return "N/A"
  if (Math.abs(num) >= 1_0000_0000) return `${(num / 1_0000_0000).toFixed(0)}억원`
  if (Math.abs(num) >= 10000) return `${(num / 10000).toFixed(0)}만원`
  return `${num.toLocaleString()}원`
}

function sanitizeForPrompt(text: string): string {
  return text.replace(/[\x00-\x1F\x7F]/g, " ").slice(0, 200)
}

export function buildScoringPrompt(data: PromptData): string {
  let prompt = `당신은 한국 주식 시장 전문 AI 분석가입니다. 아래 데이터를 기반으로 종합적인 주식 분석을 수행하고, 정해진 JSON 형식으로만 응답하세요.

## 분석 대상
- 종목명: ${data.name} (${data.ticker})
- 현재가: ₩${data.price.toLocaleString()}
- 등락률: ${data.changePercent.toFixed(2)}%
- 섹터: ${data.sector}

## 재무 지표
- PER: ${data.per?.toFixed(2) ?? "N/A"}
- PBR: ${data.pbr?.toFixed(2) ?? "N/A"}
- EPS: ${data.eps?.toLocaleString() ?? "N/A"}
- 배당수익률: ${data.dividendYield?.toFixed(2) ?? "N/A"}%
- 시가총액: ₩${(data.marketCap / 100000000).toFixed(0)}억
- 거래량: ${data.volume.toLocaleString()}

## 기술적 지표
- RSI(14): ${data.technicalIndicators.rsi.toFixed(1)}
- MACD Histogram: ${data.technicalIndicators.macdHistogram.toFixed(2)}
- 20일 이동평균 대비: ${data.technicalIndicators.priceVsSma20.toFixed(2)}%
- 200일 이동평균 대비: ${data.technicalIndicators.priceVsSma200.toFixed(2)}%
- 거래량 비율: ${data.technicalIndicators.volumeRatio.toFixed(2)}`

  if (data.companyInfo) {
    prompt += `\n\n## 기업 정보\n- 대표이사: ${data.companyInfo.ceo_nm}\n- 업종코드: ${data.companyInfo.induty_code}`
  }

  if (data.financials && data.financials.length > 0) {
    const findAccount = (name: string) => data.financials!.find((f) => f.account_nm.includes(name))
    const revenue = findAccount("매출액") ?? findAccount("수익(매출액)")
    const operatingProfit = findAccount("영업이익")
    const netIncome = findAccount("당기순이익")
    if (revenue || operatingProfit || netIncome) {
      prompt += "\n\n## 재무제표"
      if (revenue) prompt += `\n- 매출액: ${formatAmount(revenue.thstrm_amount)} (전기: ${formatAmount(revenue.frmtrm_amount)})`
      if (operatingProfit) prompt += `\n- 영업이익: ${formatAmount(operatingProfit.thstrm_amount)}`
      if (netIncome) prompt += `\n- 당기순이익: ${formatAmount(netIncome.thstrm_amount)}`
    }
  }

  if (data.newsSentiment && data.newsSentiment.articles.length > 0) {
    prompt += `\n\n## 시장 심리\n- 뉴스 감성: 긍정 ${data.newsSentiment.positiveCount}건 / 부정 ${data.newsSentiment.negativeCount}건\n- 감성 점수: ${data.newsSentiment.overallScore}/10`
    const topArticles = data.newsSentiment.articles.slice(0, 3)
    if (topArticles.length > 0) {
      prompt += "\n- 주요 헤드라인:"
      topArticles.forEach((a, i) => { prompt += `\n  ${i + 1}. ${sanitizeForPrompt(a.title)}` })
    }
  }

  prompt += `

## 응답 형식 (JSON만)
{"aiScore":1-10,"rating":"Strong Buy|Buy|Hold|Sell|Strong Sell","probability":0-100,"technicalScore":1-10,"fundamentalScore":1-10,"sentimentScore":1-10,"riskScore":1-10,"factors":[{"name":"한국어","impact":"positive|negative|neutral","strength":1-5}],"summary":"한국어 요약","keyInsight":"핵심 인사이트"}
- factors 5-10개, 모든 텍스트 한국어, JSON만 응답`

  return prompt
}

export function buildUSScoringPrompt(data: USPromptData): string {
  const ti = data.technicalIndicators
  const parts = [
    `Stock: ${data.name}(${data.symbol})`,
    `Price: $${data.price}`,
    `Change: ${data.changePercent > 0 ? "+" : ""}${data.changePercent.toFixed(2)}%`,
    data.peAnnual != null ? `P/E: ${data.peAnnual}` : null,
    data.pbAnnual != null ? `P/B: ${data.pbAnnual}` : null,
    data.epsAnnual != null ? `EPS: $${data.epsAnnual}` : null,
    data.dividendYield != null ? `Dividend Yield: ${data.dividendYield}%` : null,
    data.roeTTM != null ? `ROE: ${data.roeTTM}%` : null,
    data.beta != null ? `Beta: ${data.beta}` : null,
    ti ? `RSI: ${ti.rsi.toFixed(1)}` : null,
    ti ? `MACD: ${ti.macdHistogram > 0 ? "Bullish" : "Bearish"}` : null,
    data.newsSentiment ? `News Sentiment: ${data.newsSentiment.overallScore}/10` : null,
    data.sector ? `Sector: ${data.sector}` : null,
  ].filter(Boolean).join("\n")

  return `You are an expert US stock analyst. Analyze and return JSON only:
{"aiScore":1-10,"rating":"Strong Buy|Buy|Hold|Sell|Strong Sell","probability":0-100,"technicalScore":1-10,"fundamentalScore":1-10,"sentimentScore":1-10,"riskScore":1-10,"factors":[{"name":"Korean description","impact":"positive|negative|neutral","strength":1-5}],"summary":"Korean 2-3 sentences","keyInsight":"Korean 1 sentence"}

${parts}`
}
