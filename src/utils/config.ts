export interface ApiKeyStatus {
  readonly name: string
  readonly envVar: string
  readonly configured: boolean
  readonly required: boolean
  readonly description: string
  readonly signupUrl: string
  readonly freeLimit: string
}

export function getApiKeyStatus(): ApiKeyStatus[] {
  return [
    {
      name: "OpenAI",
      envVar: "OPENAI_API_KEY",
      configured: !!process.env.OPENAI_API_KEY,
      required: false,
      description: "AI 종합 분석 (없으면 알고리즘 기반 분석)",
      signupUrl: "https://platform.openai.com/api-keys",
      freeLimit: "종량제",
    },
    {
      name: "DART",
      envVar: "DART_API_KEY",
      configured: !!process.env.DART_API_KEY,
      required: false,
      description: "한국 기업 재무제표, 내부자 거래",
      signupUrl: "https://opendart.fss.or.kr/",
      freeLimit: "일 10,000건",
    },
    {
      name: "Finnhub",
      envVar: "FINNHUB_API_KEY",
      configured: !!process.env.FINNHUB_API_KEY,
      required: false,
      description: "미국 주식 시세, 기업 프로필, 내부자 거래",
      signupUrl: "https://finnhub.io/register",
      freeLimit: "60 calls/min",
    },
    {
      name: "네이버 검색",
      envVar: "NAVER_CLIENT_ID",
      configured: !!process.env.NAVER_CLIENT_ID && !!process.env.NAVER_CLIENT_SECRET,
      required: false,
      description: "네이버 뉴스 검색 (없으면 Google News 사용)",
      signupUrl: "https://developers.naver.com/apps/#/register",
      freeLimit: "일 25,000건",
    },
    {
      name: "ECOS (한국은행)",
      envVar: "ECOS_API_KEY",
      configured: !!process.env.ECOS_API_KEY,
      required: false,
      description: "한국 거시경제 지표",
      signupUrl: "https://ecos.bok.or.kr/api/#/",
      freeLimit: "일 100,000건",
    },
    {
      name: "FRED",
      envVar: "FRED_API_KEY",
      configured: !!process.env.FRED_API_KEY,
      required: false,
      description: "미국 거시경제 지표",
      signupUrl: "https://fred.stlouisfed.org/docs/api/api_key.html",
      freeLimit: "무제한",
    },
    {
      name: "FMP",
      envVar: "FMP_API_KEY",
      configured: !!process.env.FMP_API_KEY,
      required: false,
      description: "미국 기업 프로필, 검색",
      signupUrl: "https://site.financialmodelingprep.com/developer/docs",
      freeLimit: "일 250건",
    },
  ]
}

export function formatApiKeyGuide(): string {
  const statuses = getApiKeyStatus()
  const lines = [
    "# Invest-Hub MCP API 키 설정 가이드\n",
    "## 키 없이 사용 가능한 기능",
    "- 한국 시세 조회 (네이버 금융)",
    "- Google 뉴스 검색",
    "- 공포탐욕 지수",
    "- 기술적 분석 (RSI, MACD, 볼린저밴드 등)",
    "- 종목 스크리너",
    "- 백테스트\n",
    "## API 키 현황\n",
    "| API | 상태 | 환경변수 | 무료 한도 |",
    "|-----|------|---------|----------|",
  ]

  for (const s of statuses) {
    const status = s.configured ? "✅ 설정됨" : "❌ 미설정"
    lines.push(`| ${s.name} | ${status} | ${s.envVar} | ${s.freeLimit} |`)
  }

  lines.push("\n## API 키 설정 방법\n")
  lines.push("```bash")
  lines.push("claude mcp add --transport stdio invest-hub \\")

  const unconfigured = statuses.filter((s) => !s.configured)
  for (const s of unconfigured) {
    if (s.envVar === "NAVER_CLIENT_ID") {
      lines.push(`  --env NAVER_CLIENT_ID=your_id \\`)
      lines.push(`  --env NAVER_CLIENT_SECRET=your_secret \\`)
    } else {
      lines.push(`  --env ${s.envVar}=your_key \\`)
    }
  }
  lines.push("  -- npx -y invest-hub-mcp")
  lines.push("```\n")

  lines.push("## API 키 발급 URL\n")
  for (const s of statuses) {
    lines.push(`- **${s.name}**: ${s.signupUrl}`)
    lines.push(`  ${s.description}`)
  }

  return lines.join("\n")
}
